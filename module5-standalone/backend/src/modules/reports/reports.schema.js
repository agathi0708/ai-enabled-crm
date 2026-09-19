const { z } = require("zod");

const pipelineSummarySchema = z.object({
    totalDeals: z.number(),

    totalPipelineValue: z.number(),

    stages: z.record(
        z.string(),
        z.object({
            count: z.number(),
            value: z.number(),
        })
    ),
});

const performanceRangeSchema = z.enum([
    "7d",
    "30d",
    "90d",
]);

module.exports = {
    pipelineSummarySchema,
    performanceRangeSchema,
};