import { createApp } from "./app";

// Vercel detects this default Express export and serves it as one Function.
// Persistent hosts use persistent.ts to add timers and the chain indexer.
export default createApp();
