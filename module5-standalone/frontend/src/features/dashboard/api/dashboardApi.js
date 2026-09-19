import axiosClient from "../../../api/axiosClient";
import endpoints from "../../../api/endpoints";

export const getPipelineSummary = async () => {
    const response = await axiosClient.get(
        endpoints.reports.pipelineSummary
    );

    return response.data;
};

export const getPerformanceReport = async (range = "30d") => {
    const response = await axiosClient.get(
        endpoints.reports.performance,
        {
            params: {
                range,
            },
        }
    );

    return response.data;
};