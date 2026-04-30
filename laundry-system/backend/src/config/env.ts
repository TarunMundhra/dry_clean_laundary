import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

const readEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: parseNumber(process.env.PORT, 5000),
  mongodbUri: readEnv("MONGODB_URI", "mongodb://localhost:27017"),
  dbName: readEnv("DB_NAME", "laundry-system"),
  jwtSecret: readEnv("JWT_SECRET", "your_super_secret_key_here"),
  jwtExpiresIn: readEnv("JWT_EXPIRES_IN", "24h"),
  deliveryDaysOffset: parseNumber(process.env.DELIVERY_DAYS_OFFSET, 2),
  adminUsername: readEnv("ADMIN_USERNAME", "admin"),
  adminPassword: readEnv("ADMIN_PASSWORD", "admin123"),
  nodeEnv: readEnv("NODE_ENV", "development"),
  corsOrigin: readEnv("CORS_ORIGIN", "http://localhost:5173"),
};
