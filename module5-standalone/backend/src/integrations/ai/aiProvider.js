const { providers } = require("./aiClient");

const isRetryableError = (error) => {
    const status = error.response?.status;

    return (
        status === 429 ||
        status >= 500 ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        !error.response
    );
};

const generateOpenAICompatibleResponse = async (
    provider,
    prompt
) => {
    const response = await provider.client.post(
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
};

const generateGeminiResponse = async (
    provider,
    prompt
) => {
    const response = await provider.client.post(
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
                    process.env.AI_TERTIARY_API_KEY,
            },
        }
    );

    return response.data;
};

const generateAIResponse = async (prompt) => {
    let lastError = null;

    for (const provider of providers) {
        if (!provider.client || !provider.model) {
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

            if (provider.type === "gemini") {
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

            if (!isRetryableError(error)) {
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
};

module.exports = {
    generateAIResponse,
};