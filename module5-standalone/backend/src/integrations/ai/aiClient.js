const axios = require("axios");

const createAIClient = (baseURL, apiKey) => {
    if (!baseURL || !apiKey) {
        return null;
    }

    return axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });
};

const providers = [
    {
        name: "groq",
        type: "openai-compatible",
        client: createAIClient(
            process.env.AI_PRIMARY_BASE_URL,
            process.env.AI_PRIMARY_API_KEY
        ),
        model: process.env.AI_PRIMARY_MODEL,
    },
    {
        name: "openrouter",
        type: "openai-compatible",
        client: createAIClient(
            process.env.AI_SECONDARY_BASE_URL,
            process.env.AI_SECONDARY_API_KEY
        ),
        model: process.env.AI_SECONDARY_MODEL,
    },
    {
        name: "gemini",
        type: "gemini",
        client: createAIClient(
            process.env.AI_TERTIARY_BASE_URL,
            process.env.AI_TERTIARY_API_KEY
        ),
        model: process.env.AI_TERTIARY_MODEL,
    },
];

module.exports = {
    providers,
};