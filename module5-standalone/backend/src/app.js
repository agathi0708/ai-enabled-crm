const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const reportsRoutes = require("./modules/reports/reports.routes");

const aiRoutes = require("./modules/ai/ai.routes");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        message: "AI CRM Module 5 backend is running",
    });
});

app.use("/api/v1/reports", reportsRoutes);

app.use("/api/v1/ai", aiRoutes);

// Centralized error handler
app.use((error, req, res, next) => {
    console.error("API Error:", error.message);

    res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
    });
});

module.exports = app;