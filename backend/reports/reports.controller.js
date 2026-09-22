const service = require("./reports.service");

async function getPipelineSummary(req, res) {
    try {
        const ownerId = req.user.id;
        const range = req.query.range || "30d";

        const allowedRanges = [
            "7d",
            "30d",
            "90d",
        ];

        if (!allowedRanges.includes(range)) {
            return res.status(400).json({
                data: null,
                meta: {},
                error: {
                    code: "VALIDATION_ERROR",
                    message:
                        "Invalid range. Use 7d, 30d, or 90d.",
                },
            });
        }

        const data =
            await service.getPipelineSummary(
                ownerId,
                range
            );

        return res.status(200).json({
            data,
            meta: {},
            error: null,
        });
    } catch (error) {
        console.error(
            "Pipeline summary error:",
            error
        );

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "INTERNAL_ERROR",
                message:
                    error.message ||
                    "Failed to fetch pipeline summary",
            },
        });
    }
}

async function getPerformance(req, res) {
    try {
        const ownerId = req.user.id;
        const range = req.query.range || "30d";

        const allowedRanges = [
            "7d",
            "30d",
            "90d",
        ];

        if (!allowedRanges.includes(range)) {
            return res.status(400).json({
                data: null,
                meta: {},
                error: {
                    code: "VALIDATION_ERROR",
                    message:
                        "Invalid range. Use 7d, 30d, or 90d.",
                },
            });
        }

        const data =
            await service.getPerformance(
                ownerId,
                range
            );

        return res.status(200).json({
            data,
            meta: {},
            error: null,
        });
    } catch (error) {
        console.error(
            "Performance report error:",
            error
        );

        return res.status(500).json({
            data: null,
            meta: {},
            error: {
                code: "INTERNAL_ERROR",
                message:
                    error.message ||
                    "Failed to fetch performance report",
            },
        });
    }
}

module.exports = {
    getPipelineSummary,
    getPerformance,
};