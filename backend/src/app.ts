import express from "express";
import { adminRoutes } from "./routes/adminRoutes.js";
import { analysisRoutes } from "./routes/analysisRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { applySecurityMiddleware } from "./middleware/security.js";

export function createApp() {
  const app = express();
  applySecurityMiddleware(app);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/analysis", analysisRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/admin", adminRoutes);
  app.use(errorHandler);

  return app;
}
