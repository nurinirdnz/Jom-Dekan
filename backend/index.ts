import { createApp } from "./src/app";
import { env } from "./src/config/config/env";
import { logger } from "./src/utils/logger";
import { checkDatabaseConnection } from "./src/config/config/db";

async function main(): Promise<void> {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    logger.error(
      "Could not connect to PostgreSQL at startup. Check DB_* environment variables.",
    );
  }

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`JomDekan API listening on port ${env.port} (${env.nodeEnv})`);
    if (!env.isProduction) {
      logger.info(`Swagger docs: http://localhost:${env.port}/api/v1/docs`);
    }
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error", err);
  process.exit(1);
});
