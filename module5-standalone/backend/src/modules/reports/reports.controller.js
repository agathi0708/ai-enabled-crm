const reportsService = require("./reports.service");

const getPipelineSummary = async (req, res, next) => {
    try {
        const summary = await reportsService.getPipelineSummary();

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

const getPerformanceReport = async (req, res, next) => {
    try {
        const range = req.query.range || "30d";

        const report = await reportsService.getPerformanceReport(range);

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPipelineSummary,
    getPerformanceReport,
};