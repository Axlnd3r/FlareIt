// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IFAssetsFXRP } from "./interfaces/IFAssetsFXRP.sol";

/// @title SendContract — Trustless FXRP transfer hub for FlareIt remittance
/// @notice Allows senders to transfer FXRP to recipients with full event logging
/// @dev Events are indexed by the backend for the recipient dashboard.
///      This contract acts as a thin routing layer — it does NOT hold funds.
///      The actual ERC-20 transfer happens directly from sender to recipient.
contract SendContract {
    // ─── Types ────────────────────────────────────────────────────────────────

    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 txHash; // Not stored on-chain (used off-chain for reference)
    }

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice FXRP ERC-20 token contract address on Coston2
    IFAssetsFXRP public immutable fxrp;

    /// @notice Contract deployer
    address public immutable owner;

    /// @notice Total FXRP sent through this contract (in smallest unit)
    uint256 public totalVolume;

    /// @notice Number of successful sends
    uint256 public totalTransactions;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted on every successful FXRP transfer
    /// @param sender Address that initiated the send
    /// @param recipient Address that received FXRP
    /// @param amount Amount of FXRP transferred (in smallest unit, 6 decimals)
    /// @param timestamp Block timestamp of the transfer
    event Sent(
        address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAmount();
    error ZeroRecipient();
    error SelfTransfer();
    error InsufficientBalance(uint256 available, uint256 required);
    error InsufficientAllowance(uint256 allowance, uint256 required);
    error TransferFailed();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _fxrpAddress Address of the FXRP ERC-20 token on Coston2
    constructor(address _fxrpAddress) {
        require(_fxrpAddress != address(0), "FXRP address cannot be zero");
        fxrp = IFAssetsFXRP(_fxrpAddress);
        owner = msg.sender;
    }

    // ─── Core Function ────────────────────────────────────────────────────────

    /// @notice Send FXRP from caller to recipient
    /// @dev Requires prior ERC-20 approval: caller must approve this contract to
    ///      spend `amount` FXRP before calling this function.
    ///      Flow: sender.approve(SendContract, amount) → SendContract.send(recipient, amount)
    /// @param recipient Address of the FXRP recipient (Wallet B)
    /// @param amount Amount of FXRP to send (in smallest unit; FXRP has 6 decimals)
    function send(address recipient, uint256 amount) external {
        // ── Input validation ─────────────────────────────────────────────────
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroRecipient();
        if (recipient == msg.sender) revert SelfTransfer();

        // ── Balance check ────────────────────────────────────────────────────
        uint256 senderBalance = fxrp.balanceOf(msg.sender);
        if (senderBalance < amount) {
            revert InsufficientBalance(senderBalance, amount);
        }

        // ── Allowance check ──────────────────────────────────────────────────
        uint256 allowed = fxrp.allowance(msg.sender, address(this));
        if (allowed < amount) {
            revert InsufficientAllowance(allowed, amount);
        }

        // ── Transfer ─────────────────────────────────────────────────────────
        bool success = fxrp.transferFrom(msg.sender, recipient, amount);
        if (!success) revert TransferFailed();

        // ── State update ─────────────────────────────────────────────────────
        unchecked {
            totalVolume += amount;
            totalTransactions += 1;
        }

        // ── Emit event (indexed by backend) ──────────────────────────────────
        emit Sent(msg.sender, recipient, amount, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Get sender's current FXRP balance
    /// @param user Address to check
    /// @return balance FXRP balance in smallest unit (divide by 10^6 for FXRP amount)
    function getFxrpBalance(address user) external view returns (uint256 balance) {
        return fxrp.balanceOf(user);
    }

    /// @notice Get current allowance for this contract to spend on behalf of user
    /// @param user Address that granted approval
    /// @return allowance Amount this contract is approved to spend
    function getAllowance(address user) external view returns (uint256 allowance) {
        return fxrp.allowance(user, address(this));
    }

    /// @notice Returns the FXRP token address
    function getFxrpAddress() external view returns (address) {
        return address(fxrp);
    }
}
