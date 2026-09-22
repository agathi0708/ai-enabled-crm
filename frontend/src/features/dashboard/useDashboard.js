import { useCallback, useEffect, useState } from "react";

import {
    getPipelineSummary,
    getPerformance,
} from "../../api/reports";

function useDashboard(range = "30d") {
    const [pipelineSummary, setPipelineSummary] =
        useState(null);

    const [performanceReport, setPerformanceReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadDashboard = useCallback(
        async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    pipelineResponse,
                    performanceResponse,
                ] = await Promise.all([
                    getPipelineSummary(),
                    getPerformance(range),
                ]);

                setPipelineSummary(
                    pipelineResponse?.data || null
                );

                setPerformanceReport(
                    performanceResponse?.data || null
                );
            } catch (requestError) {
                setError(
                    requestError?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        },
        [range]
    );

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    return {
        pipelineSummary,
        performanceReport,
        loading,
        error,
        refresh: loadDashboard,
    };
}

export default useDashboard;