import { app } from "./src/app";
import { connectDb } from "./src/config/db";
import { env } from "./src/config/env";
import { logger } from "./src/utils/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDb();
    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
