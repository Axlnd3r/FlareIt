-- FlareIt database schema
-- SQLite — lightweight, zero-config for demo

-- Transaction history indexed from SendContract Sent() events
CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sender      TEXT    NOT NULL,          -- lowercase EVM address (0x...)
  recipient   TEXT    NOT NULL,          -- lowercase EVM address (0x...)
  amount      TEXT    NOT NULL,          -- stored as string (bigint safe)
  tx_hash     TEXT    NOT NULL UNIQUE,   -- transaction hash (0x...)
  block_number INTEGER,                  -- block number when event was emitted
  log_index   INTEGER,                   -- log index within the block
  created_at  INTEGER NOT NULL           -- Unix timestamp (seconds)
);

-- Index for fast lookups by address (both sender and recipient queries)
CREATE INDEX IF NOT EXISTS idx_transactions_sender    ON transactions(sender);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient);
CREATE INDEX IF NOT EXISTS idx_transactions_created   ON transactions(created_at DESC);

-- Track last processed block for event listener restart recovery
CREATE TABLE IF NOT EXISTS indexer_state (
  id               INTEGER PRIMARY KEY CHECK(id = 1),  -- singleton row
  last_block       INTEGER NOT NULL DEFAULT 0,
  last_updated_at  INTEGER NOT NULL DEFAULT 0
);

-- Initialize indexer state
INSERT OR IGNORE INTO indexer_state (id, last_block, last_updated_at) VALUES (1, 0, 0);
