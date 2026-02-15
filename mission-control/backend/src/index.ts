// Main Express Server
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { logger } from "./utils/logger";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
    });
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes
app.get("/", (req, res) => {
    res.json({
        name: "Mission Control API",
        version: "1.0.0",
        status: "running",
    });
});

import webhookRoutes from "./routes/webhookRoutes";

// Webhook routes
app.use("/webhook", webhookRoutes);

// API routes (will be implemented)
// app.use("/api", apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error("Unhandled error", {
        error: err.message,
        stack: err.stack,
        path: req.path,
    });

    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal server error",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: "Not found",
            path: req.path,
        },
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Mission Control API running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
