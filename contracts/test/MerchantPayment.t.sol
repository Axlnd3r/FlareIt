// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { MerchantPayment } from "../src/MerchantPayment.sol";

contract MerchantPaymentTest is Test {
    MerchantPayment private settlement;
    MockQrisFXRP private token;

    address private payer = makeAddr("payer");
    address private merchant = makeAddr("merchant");
    bytes32 private constant PAYMENT_ID = keccak256("order-001");
    bytes32 private constant REFERENCE_HASH = keccak256("merchant-reference-001");
    uint256 private constant AMOUNT = 25e6;

    event MerchantPaid(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 idrQuote,
        bytes32 merchantReferenceHash,
        uint256 deadline,
        uint256 timestamp
    );

    function setUp() public {
        token = new MockQrisFXRP();
        settlement = new MerchantPayment(address(token));
        token.mint(payer, 100e6);
    }

    function test_payMerchant_transfersAndRecordsPayment() public {
        uint256 deadline = block.timestamp + 5 minutes;
        vm.prank(payer);
        token.approve(address(settlement), AMOUNT);

        vm.expectEmit(true, true, true, true);
        emit MerchantPaid(
            PAYMENT_ID, payer, merchant, AMOUNT, 500_000, REFERENCE_HASH, deadline, block.timestamp
        );

        vm.prank(payer);
        settlement.payMerchant(PAYMENT_ID, merchant, AMOUNT, 500_000, REFERENCE_HASH, deadline);

        assertEq(token.balanceOf(merchant), AMOUNT);
        assertEq(settlement.totalPayments(), 1);
        assertEq(settlement.totalVolume(), AMOUNT);

        MerchantPayment.PaymentRecord memory payment = settlement.getPayment(PAYMENT_ID);
        assertEq(payment.payer, payer);
        assertEq(payment.merchant, merchant);
        assertEq(payment.amount, AMOUNT);
        assertEq(payment.idrQuote, 500_000);
        assertEq(payment.merchantReferenceHash, REFERENCE_HASH);
        assertEq(payment.deadline, deadline);
    }

    function test_payMerchant_revertsForDuplicatePaymentId() public {
        vm.startPrank(payer);
        token.approve(address(settlement), AMOUNT * 2);
        settlement.payMerchant(
            PAYMENT_ID, merchant, AMOUNT, 500_000, REFERENCE_HASH, block.timestamp + 5 minutes
        );

        vm.expectRevert(
            abi.encodeWithSelector(MerchantPayment.DuplicatePaymentId.selector, PAYMENT_ID)
        );
        settlement.payMerchant(
            PAYMENT_ID, merchant, AMOUNT, 500_000, REFERENCE_HASH, block.timestamp + 5 minutes
        );
        vm.stopPrank();
    }

    function test_payMerchant_revertsWithoutAllowance() public {
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(MerchantPayment.InsufficientAllowance.selector, 0, AMOUNT)
        );
        settlement.payMerchant(
            PAYMENT_ID, merchant, AMOUNT, 500_000, REFERENCE_HASH, block.timestamp + 5 minutes
        );
    }

    function test_payMerchant_revertsForZeroAmount() public {
        vm.prank(payer);
        vm.expectRevert(MerchantPayment.ZeroAmount.selector);
        settlement.payMerchant(
            PAYMENT_ID, merchant, 0, 500_000, REFERENCE_HASH, block.timestamp + 5 minutes
        );
    }

    function test_payMerchant_revertsForExpiredQuote() public {
        vm.prank(payer);
        token.approve(address(settlement), AMOUNT);
        uint256 deadline = block.timestamp + 1;
        vm.warp(deadline + 1);

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(MerchantPayment.QuoteExpired.selector, deadline, block.timestamp)
        );
        settlement.payMerchant(PAYMENT_ID, merchant, AMOUNT, 500_000, REFERENCE_HASH, deadline);
    }

    function test_constructor_revertsForZeroToken() public {
        vm.expectRevert(MerchantPayment.ZeroToken.selector);
        new MerchantPayment(address(0));
    }
}

contract MockQrisFXRP {
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balances[from] >= amount, "balance");
        require(allowances[from][msg.sender] >= amount, "allowance");
        balances[from] -= amount;
        allowances[from][msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}
