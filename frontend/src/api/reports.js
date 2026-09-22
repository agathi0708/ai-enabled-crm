import { apiFetch } from "./http";

/**
 * Handle standard API responses.
 */
async function handleResponse(response) {
    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error(
            "Invalid response from server"
        );
    }

    if (!response.ok) {
        throw new Error(
            result?.error?.message ||
            "Request failed"
        );
    }

    return result;
}

/**
 * Get dashboard pipeline summary.
 *
 * Supported ranges:
 * - 7d
 * - 30d
 * - 90d
 *
 * Returns:
 * - total deals
 * - total pipeline value
 * - open deals
 * - won deals
 * - lost deals
 * - win rate
 * - pipeline stages
 *
 * The backend derives the owner from
 * the authenticated JWT user.
 */
export async function getPipelineSummary(
    range = "30d"
) {
    const allowedRanges = [
        "7d",
        "30d",
        "90d",
    ];

    if (!allowedRanges.includes(range)) {
        throw new Error(
            "Invalid report range"
        );
    }

    const params = new URLSearchParams({
        range,
    });

    const response = await apiFetch(
        `/reports/pipeline-summary?${params.toString()}`
    );

    return handleResponse(response);
}

/**
 * Get dashboard performance data.
 *
 * Supported ranges:
 * - 7d
 * - 30d
 * - 90d
 */
export async function getPerformance(
    range = "30d"
) {
    const allowedRanges = [
        "7d",
        "30d",
        "90d",
    ];

    if (!allowedRanges.includes(range)) {
        throw new Error(
            "Invalid report range"
        );
    }

    const params = new URLSearchParams({
        range,
    });

    const response = await apiFetch(
        `/reports/performance?${params.toString()}`
    );

    return handleResponse(response);
}