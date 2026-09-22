const {
    providers,
} = require("./aiClient");

/**
 * Determine whether an AI provider error
 * should trigger fallback to the next provider.
 */
function isRetryableError(error) {
    const status =
        error.response?.status;

    return (
        status === 429 ||
        status >= 500 ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        !error.response
    );
}

/**
 * Call an OpenAI-compatible provider.
 *
 * Used by:
 * - Groq
 * - OpenRouter
 */
async function generateOpenAICompatibleResponse(
    provider,
    prompt
) {
    const response =
        await provider.client.post(
            "/chat/completions",
            {
                model: provider.model,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2,
            }
        );

    return response.data;
}

/**
 * Call Google Gemini.
 */
async function generateGeminiResponse(
    provider,
    prompt
) {
    const response =
        await provider.client.post(
            `/models/${provider.model}:generateContent`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                },
            },
            {
                headers: {
                    "x-goog-api-key":
                        process.env
                            .AI_TERTIARY_API_KEY,
                },
            }
        );

    return response.data;
}

/**
 * Generate an AI response using provider
 * fallback.
 *
 * Provider order:
 * Groq → OpenRouter → Gemini
 */
async function generateAIResponse(
    prompt
) {
    let lastError = null;

    for (const provider of providers) {
        if (
            !provider.client ||
            !provider.model
        ) {
            console.log(
                `Skipping unconfigured provider: ${provider.name}`
            );

            continue;
        }

        try {
            console.log(
                `Trying AI provider: ${provider.name}`
            );

            let response;

            if (
                provider.type === "gemini"
            ) {
                response =
                    await generateGeminiResponse(
                        provider,
                        prompt
                    );
            } else {
                response =
                    await generateOpenAICompatibleResponse(
                        provider,
                        prompt
                    );
            }

            console.log(
                `AI provider succeeded: ${provider.name}`
            );

            return {
                provider: provider.name,
                response,
            };
        } catch (error) {
            lastError = error;

            console.error(
                `AI provider failed: ${provider.name}`,
                error.response?.status ||
                error.message
            );

            if (
                !isRetryableError(error)
            ) {
                throw error;
            }

            console.log(
                `Falling back from ${provider.name}...`
            );
        }
    }

    throw new Error(
        `All configured AI providers failed. ${lastError?.message || ""
        }`
    );
}

module.exports = {
    generateAIResponse,
};