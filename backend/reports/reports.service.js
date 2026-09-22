const repository = require("./reports.repository");

function getRangeDays(range) {
    if (range === "7d") {
        return 7;
    }

    if (range === "90d") {
        return 90;
    }

    return 30;
}

async function getPipelineSummary(
    ownerId,
    range = "30d"
) {
    const days = getRangeDays(range);

    const { summary, stages } =
        await repository.getPipelineSummary(
            ownerId,
            days
        );

    const totalDeals = Number(summary.total_deals);
    const openDeals = Number(summary.open_deals);
    const wonDeals = Number(summary.won_deals);
    const lostDeals = Number(summary.lost_deals);

    const closedDeals = wonDeals + lostDeals;

    const winRate =
        closedDeals > 0
            ? Number(
                ((wonDeals / closedDeals) * 100).toFixed(2)
            )
            : 0;

    return {
        totalDeals,
        totalPipelineValue: Number(
            summary.total_pipeline_value
        ),
        openDeals,
        wonDeals,
        lostDeals,
        winRate,
        range,
        stages: stages.map((stage) => ({
            stage: stage.stage,
            count: Number(stage.count),
            value: Number(stage.value),
        })),
    };
}

async function getPerformance(
    ownerId,
    range = "30d"
) {
    const days = getRangeDays(range);

    const [performance, totalLeads] =
        await Promise.all([
            repository.getPerformanceData(
                ownerId,
                days
            ),
            repository.getLeadCount(
                ownerId,
                days
            ),
        ]);

    return {
        totalLeads,
        range,
        data: performance.map((item) => ({
            month: item.month.trim(),
            deals: Number(item.deals),
            wonDeals: Number(item.won_deals),
            revenue: Number(item.revenue),
        })),
    };
}

module.exports = {
    getPipelineSummary,
    getPerformance,
};