// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console } from "forge-std/Test.sol";
import { SendContract } from "../src/SendContract.sol";

/// @title SendContract Tests — Uses mock ERC-20 to test transfer logic
/// @dev Run with: forge test -v
contract SendContractTest is Test {
    SendContract public sendContract;
    MockFXRP public mockFxrp;

    address public sender = makeAddr("sender");
    address public recipient = makeAddr("recipient");
    address public deployer = makeAddr("deployer");

    uint256 constant INITIAL_BALANCE = 1000e6; // 1000 FXRP (6 decimals)
    uint256 constant SEND_AMOUNT = 100e6; // 100 FXRP

    event Sent(
        address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp
    );

    function setUp() public {
        vm.startPrank(deployer);
        mockFxrp = new MockFXRP();
        sendContract = new SendContract(address(mockFxrp));
        vm.stopPrank();

        // Fund sender with FXRP
        mockFxrp.mint(sender, INITIAL_BALANCE);
    }

    // ─── Happy Path ───────────────────────────────────────────────────────────

    /// @notice Test successful FXRP transfer
    function test_send_successfulTransfer() public {
        // Approve sendContract to spend sender's FXRP
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        uint256 senderBalanceBefore = mockFxrp.balanceOf(sender);
        uint256 recipientBalanceBefore = mockFxrp.balanceOf(recipient);

        // Execute send
        vm.prank(sender);
        sendContract.send(recipient, SEND_AMOUNT);

        // Verify balances
        assertEq(
            mockFxrp.balanceOf(sender),
            senderBalanceBefore - SEND_AMOUNT,
            "Sender balance should decrease"
        );
        assertEq(
            mockFxrp.balanceOf(recipient),
            recipientBalanceBefore + SEND_AMOUNT,
            "Recipient balance should increase"
        );
    }

    /// @notice Test that Sent event is emitted with correct data
    function test_send_emitsSentEvent() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        vm.expectEmit(true, true, false, true);
        emit Sent(sender, recipient, SEND_AMOUNT, block.timestamp);

        vm.prank(sender);
        sendContract.send(recipient, SEND_AMOUNT);
    }

    /// @notice Test totalVolume counter increments
    function test_send_incrementsVolume() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT * 2);

        vm.prank(sender);
        sendContract.send(recipient, SEND_AMOUNT);

        assertEq(sendContract.totalVolume(), SEND_AMOUNT, "Volume should equal send amount");
        assertEq(sendContract.totalTransactions(), 1, "Transaction count should be 1");

        vm.prank(sender);
        sendContract.send(recipient, SEND_AMOUNT);

        assertEq(
            sendContract.totalVolume(), SEND_AMOUNT * 2, "Volume should be double after 2 sends"
        );
        assertEq(sendContract.totalTransactions(), 2, "Transaction count should be 2");
    }

    // ─── Revert Cases ─────────────────────────────────────────────────────────

    /// @notice Test revert when amount is 0
    function test_send_revertWhenZeroAmount() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        vm.prank(sender);
        vm.expectRevert(SendContract.ZeroAmount.selector);
        sendContract.send(recipient, 0);
    }

    /// @notice Test revert when recipient is address(0)
    function test_send_revertWhenZeroRecipient() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        vm.prank(sender);
        vm.expectRevert(SendContract.ZeroRecipient.selector);
        sendContract.send(address(0), SEND_AMOUNT);
    }

    /// @notice Test revert when sender tries to send to themselves
    function test_send_revertWhenSelfTransfer() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        vm.prank(sender);
        vm.expectRevert(SendContract.SelfTransfer.selector);
        sendContract.send(sender, SEND_AMOUNT);
    }

    /// @notice Test revert when sender has insufficient balance
    function test_send_revertWhenInsufficientBalance() public {
        uint256 tooMuch = INITIAL_BALANCE + 1;

        vm.prank(sender);
        mockFxrp.approve(address(sendContract), tooMuch);

        vm.prank(sender);
        vm.expectRevert(
            abi.encodeWithSelector(
                SendContract.InsufficientBalance.selector, INITIAL_BALANCE, tooMuch
            )
        );
        sendContract.send(recipient, tooMuch);
    }

    /// @notice Test revert when allowance is insufficient
    function test_send_revertWhenInsufficientAllowance() public {
        uint256 lowAllowance = SEND_AMOUNT / 2;

        vm.prank(sender);
        mockFxrp.approve(address(sendContract), lowAllowance);

        vm.prank(sender);
        vm.expectRevert(
            abi.encodeWithSelector(
                SendContract.InsufficientAllowance.selector, lowAllowance, SEND_AMOUNT
            )
        );
        sendContract.send(recipient, SEND_AMOUNT);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Test getFxrpBalance returns correct balance
    function test_getFxrpBalance_returnsCorrectBalance() public view {
        assertEq(
            sendContract.getFxrpBalance(sender),
            INITIAL_BALANCE,
            "Should return sender's initial FXRP balance"
        );
    }

    /// @notice Test getAllowance returns correct allowance
    function test_getAllowance_returnsCorrectAllowance() public {
        vm.prank(sender);
        mockFxrp.approve(address(sendContract), SEND_AMOUNT);

        assertEq(sendContract.getAllowance(sender), SEND_AMOUNT, "Should return correct allowance");
    }

    /// @notice Test getFxrpAddress returns the FXRP token address
    function test_getFxrpAddress_returnsCorrectAddress() public view {
        assertEq(
            sendContract.getFxrpAddress(), address(mockFxrp), "Should return FXRP token address"
        );
    }

    // ─── Constructor validation ───────────────────────────────────────────────

    /// @notice Test constructor reverts with zero FXRP address
    function test_constructor_revertWithZeroFxrpAddress() public {
        vm.expectRevert("FXRP address cannot be zero");
        new SendContract(address(0));
    }
}

// ─── Mock ERC-20 for testing ─────────────────────────────────────────────────

/// @title MockFXRP — Minimal ERC-20 mock for testing SendContract
contract MockFXRP {
    string public name = "Mock FXRP";
    string public symbol = "FXRP";
    uint8 public decimals = 6;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
