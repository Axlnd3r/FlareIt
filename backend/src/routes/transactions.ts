import { Router, Request, Response } from "express";
import { getDb, getTransactionsByAddress } from "../db/database";

const router = Router();

/**
 * GET /api/transactions/:address
 * Returns transaction history for a given address (as sender or recipient)
 */
router.get("/:address", async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params;

  // Validate address format
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({
      error: "Invalid address format",
      message: "Address must be a valid EVM address (0x + 40 hex chars)",
    });
    return;
  }

  try {
    const db = await getDb();
    const rows = getTransactionsByAddress(db, address);
    const normalizedAddress = address.toLowerCase();

    const transactions = rows.map((row) => ({
      id: row.id,
      sender: row.sender,
      recipient: row.recipient,
      amount: row.amount,
      amountFxrp: (Number(row.amount) / 1_000_000).toFixed(6), // FXRP has 6 decimals
      txHash: row.tx_hash,
      blockNumber: row.block_number,
      createdAt: row.created_at,
      direction: row.sender.toLowerCase() === normalizedAddress ? "sent" : "received",
    }));

    res.json({
      address: normalizedAddress,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("[API/transactions] Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch transaction history",
    });
  }
});

export default router;
