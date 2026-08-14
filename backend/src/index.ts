import { createApp } from "./app";
import { config } from "./config";
import { startRateUpdater } from "./routes/rate";
import { startEventListener } from "./indexer/eventListener";

async function main(): Promise<void> {
  startRateUpdater();
  createApp().listen(config.PORT, "0.0.0.0", () => {
    console.log(`[FlareIt] Backend running at http://localhost:${config.PORT}`);
    console.log(`[FlareIt] Network: Coston2 (${config.CHAIN_ID})`);
  });

  // Serve health/API requests immediately. Initial chain backfill can take
  // longer than a hosting provider's startup health-check window.
  void startEventListener().catch((error) => {
    console.error("[Indexer] Startup error; API remains available", error);
  });
}

main().catch((error) => {
  console.error("[FlareIt] Fatal startup error", error);
  process.exit(1);
});
