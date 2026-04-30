import mongoose from "mongoose";
import { env } from "./env";
import { DB_NAME } from "../constants/db";
import { logger } from "../utils/logger";

const buildMongoUri = (uri: string, dbName: string): string => {
  const [base, query] = uri.split("?");
  const schemeIndex = base.indexOf("://");
  if (schemeIndex === -1) {
    return uri;
  }

  const afterScheme = base.slice(schemeIndex + 3);
  const slashIndex = afterScheme.indexOf("/");
  const hasPath =
    slashIndex !== -1 && afterScheme.slice(slashIndex + 1).length > 0;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const withDb = hasPath ? base : `${normalizedBase}/${dbName}`;

  return query ? `${withDb}?${query}` : withDb;
};

export const connectDb = async (): Promise<void> => {
  if (env.nodeEnv === "test") {
    logger.info("Skipping MongoDB connection in test environment");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = buildMongoUri(env.mongodbUri, DB_NAME);
  const connection = await mongoose.connect(mongoUri);
  logger.info(
    { host: connection.connection.host, dbName: connection.connection.name },
    "MongoDB connected",
  );
};

export const disconnectDb = async (): Promise<void> => {
  if (env.nodeEnv === "test") {
    return;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
