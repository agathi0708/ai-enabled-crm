const endpoints = {
    reports: {
        pipelineSummary: "/reports/pipeline-summary",
        performance: "/reports/performance",
    },

    ai: {
        leadScore: (contactId) =>
            `/ai/lead-score/${contactId}`,

        summary: (contactId) =>
            `/ai/summary/${contactId}`,

        assistant: "/ai/assistant/query",

        nextBestAction: (contactId) =>
            `/ai/next-best-action/${contactId}`,
    },
};

export default endpoints;