const axios = require("axios");

/**
 * Create an HTTP client for an AI provider.
 */
function createAIClient(
    baseURL,
    apiKey
) {
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
}

/**
 * AI providers are attempted in this order:
 *
 * 1. Groq
 * 2. OpenRouter
 * 3. Gemini
 *
 * This allows the backend to continue with
 * another provider when a provider is
 * temporarily unavailable or rate-limited.
 */
const providers = [
    {
        name: "groq",
        type: "openai-compatible",
        client: createAIClient(
            process.env.AI_PRIMARY_BASE_URL,
            process.env.AI_PRIMARY_API_KEY
        ),
        model:
            process.env.AI_PRIMARY_MODEL,
    },

    {
        name: "openrouter",
        type: "openai-compatible",
        client: createAIClient(
            process.env.AI_SECONDARY_BASE_URL,
            process.env.AI_SECONDARY_API_KEY
        ),
        model:
            process.env.AI_SECONDARY_MODEL,
    },

    {
        name: "gemini",
        type: "gemini",
        client: createAIClient(
            process.env.AI_TERTIARY_BASE_URL,
            process.env.AI_TERTIARY_API_KEY
        ),
        model:
            process.env.AI_TERTIARY_MODEL,
    },
];

module.exports = {
    providers,
};