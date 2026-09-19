import { useEffect, useState } from "react";
import {
    getPipelineSummary,
    getPerformanceReport,
} from "../api/dashboardApi";

const useDashboard = (range = "30d") => {
    const [pipelineSummary, setPipelineSummary] = useState(null);
    const [performanceReport, setPerformanceReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [pipelineResponse, performanceResponse] =
                    await Promise.all([
                        getPipelineSummary(),
                        getPerformanceReport(range),
                    ]);

                setPipelineSummary(pipelineResponse.data);
                setPerformanceReport(performanceResponse.data);
            } catch (err) {
                console.error("Dashboard API error:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [range]);

    return {
        pipelineSummary,
        performanceReport,
        loading,
        error,
    };
};

export default useDashboard;