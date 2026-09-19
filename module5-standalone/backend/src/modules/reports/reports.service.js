const reportsRepository = require("./reports.repository");

const {
    performanceRangeSchema,
} = require("./reports.schema");

const getPipelineSummary = async () => {
    const deals = await reportsRepository.getDeals();
    const leads = await reportsRepository.getLeads();

    const summary = {
        totalLeads: leads.length,
        totalDeals: deals.length,
        openDeals: 0,
        wonDeals: 0,
        lostDeals: 0,
        winRate: 0,
        totalPipelineValue: 0,
        stages: {},
    };

    deals.forEach((deal) => {
        if (deal.stage === "won") {
            summary.wonDeals += 1;
        } else if (deal.stage === "lost") {
            summary.lostDeals += 1;
        } else {
            summary.openDeals += 1;
        }

        if (deal.stage !== "lost") {
            summary.totalPipelineValue += deal.value;
        }

        if (!summary.stages[deal.stage]) {
            summary.stages[deal.stage] = {
                count: 0,
                value: 0,
            };
        }

        summary.stages[deal.stage].count += 1;
        summary.stages[deal.stage].value += deal.value;
    });

    const totalClosedDeals =
        summary.wonDeals + summary.lostDeals;

    if (totalClosedDeals > 0) {
        summary.winRate =
            (summary.wonDeals / totalClosedDeals) * 100;
    }

    return summary;
};

const getPerformanceReport = async (range = "30d") => {
    const validatedRange =
        performanceRangeSchema.parse(range);

    const performanceData =
        await reportsRepository.getPerformanceData();

    return {
        range: validatedRange,
        data: performanceData,
    };
};

module.exports = {
    getPipelineSummary,
    getPerformanceReport,
};