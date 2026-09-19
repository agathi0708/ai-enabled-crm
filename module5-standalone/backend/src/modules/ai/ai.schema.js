const { z } = require("zod");

const contactIdSchema = z.object({
    contactId: z.coerce.number().int().positive(),
});

const leadScoreResponseSchema = z.object({
    contactId: z.number(),
    score: z.number().min(0).max(100),
    rationale: z.string(),
});

const summaryResponseSchema = z.object({
    contactId: z.number(),
    summary: z.string(),
});

module.exports = {
    contactIdSchema,
    leadScoreResponseSchema,
    summaryResponseSchema,
};