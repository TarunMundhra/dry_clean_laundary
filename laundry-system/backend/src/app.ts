import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { docsRouter } from "./routes/docs.routes";
import { authRouter } from "./routes/auth.routes";
import { orderRouter } from "./routes/order.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";

export const app = express();

app.use(express.json());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(helmet());
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ok" },
  });
});

app.use("/api/docs", docsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.use(errorHandler);
