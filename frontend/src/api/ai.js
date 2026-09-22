import { apiFetch } from "./http";

async function handleResponse(response) {
    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("Invalid response from server");
    }

    if (!response.ok) {
        throw new Error(
            result?.error?.message ||
            "AI request failed"
        );
    }

    return result;
}

export async function askAssistant({
    query,
    contactId,
}) {
    if (!query?.trim()) {
        throw new Error("Please enter a question");
    }

    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    const response = await apiFetch(
        "/ai/assistant/query",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: query.trim(),
                contactId,
            }),
        }
    );

    return handleResponse(response);
}

export async function scoreLead({
    contactId,
}) {
    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    const response = await apiFetch(
        "/ai/lead-score",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contactId,
            }),
        }
    );

    return handleResponse(response);
}

export async function getNextBestAction({
    contactId,
}) {
    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    const response = await apiFetch(
        "/ai/next-best-action",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contactId,
            }),
        }
    );

    return handleResponse(response);
}

export async function getActivitySummary({ contactId }) {
    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    const response = await apiFetch("/ai/activity-summary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId }),
    });

    return handleResponse(response);
}