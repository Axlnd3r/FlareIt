// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title QrisSettlement — Records payment intents for QRIS simulation (Fase 4)
/// @notice This contract demonstrates the FDC attestation pattern for QRIS settlement.
///         It is NOT a real QRIS settlement — real QRIS requires a licensed PJP
///         under Bank Indonesia regulation and FDC attestation integration.
/// @dev Clearly labeled as SIMULATION in the UI. This contract shows how FDC
///      would be used post-hackathon to verify off-chain payment finality.
contract QrisSettlement {
    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a payer records intent to pay a QRIS merchant
    /// @param payer Address that initiated the payment
    /// @param merchantId QRIS merchant ID (e.g., "ID1234567890123456789012")
    /// @param amount Amount in FXRP smallest unit (6 decimals)
    /// @param timestamp Block timestamp
    event PaymentIntent(
        address indexed payer,
        string merchantId,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when a payment is "confirmed" (simulation only)
    event PaymentSimulated(
        address indexed payer,
        string merchantId,
        uint256 amount,
        uint256 timestamp
    );

    // ─── State ────────────────────────────────────────────────────────────────

    struct PaymentRecord {
        address payer;
        string merchantId;
        uint256 amount;
        uint256 timestamp;
        bool simulated; // true = simulation confirmed
    }

    mapping(bytes32 => PaymentRecord) public payments;
    uint256 public totalPayments;

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Record a payment intent for QRIS merchant
    /// @dev In post-hackathon implementation, this would first wait for FDC
    ///      attestation before emitting confirmation. For now, it's a simulation.
    /// @param merchantId QRIS merchant identifier
    /// @param amount Amount in FXRP smallest unit (6 decimals)
    function recordPaymentIntent(
        string calldata merchantId,
        uint256 amount
    ) external returns (bytes32 paymentId) {
        require(amount > 0, "Amount must be positive");
        require(bytes(merchantId).length > 0, "Merchant ID required");

        paymentId = keccak256(
            abi.encodePacked(msg.sender, merchantId, amount, block.timestamp, totalPayments)
        );

        payments[paymentId] = PaymentRecord({
            payer: msg.sender,
            merchantId: merchantId,
            amount: amount,
            timestamp: block.timestamp,
            simulated: true // All are simulated in hackathon version
        });

        unchecked { totalPayments++; }

        emit PaymentIntent(msg.sender, merchantId, amount, block.timestamp);
        emit PaymentSimulated(msg.sender, merchantId, amount, block.timestamp);

        return paymentId;
    }

    /// @notice Get payment record by ID
    function getPayment(bytes32 paymentId)
        external
        view
        returns (PaymentRecord memory)
    {
        return payments[paymentId];
    }

    // ─── FDC Roadmap Documentation ────────────────────────────────────────────
    //
    // POST-HACKATHON FDC FLOW (not implemented in this submission):
    //
    // 1. User scans QRIS QR code at merchant
    // 2. FlareIt dApp calls recordPaymentIntent() → locks FXRP
    // 3. PJP partner processes IDR payment to merchant
    // 4. PJP posts settlement confirmation to off-chain oracle API
    // 5. FDC attesters verify the settlement via FDC protocol
    // 6. FDC writes on-chain attestation proof
    // 7. This contract reads FDC attestation → releases FXRP to PJP
    // 8. Settlement finalized trustlessly (no custodian needed)
    //
    // See: https://dev.flare.network/fdc/overview
    // ─────────────────────────────────────────────────────────────────────────
}
