// Winston Logger Configuration
import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";

export const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "mission-control" },
    transports: [
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        // Error log file
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        // Combined log file
        new winston.transports.File({
            filename: "logs/combined.log",
        }),
    ],
});

// Create logs directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}
