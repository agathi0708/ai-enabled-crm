import axiosClient from "../../../api/axiosClient";
import endpoints from "../../../api/endpoints";

const getLeadScore = async (contactId) => {
    const response = await axiosClient.post(
        endpoints.ai.leadScore(contactId)
    );

    return response.data;
};

const getContactSummary = async (contactId) => {
    const response = await axiosClient.post(
        endpoints.ai.summary(contactId)
    );

    return response.data;
};

const askAssistant = async (query) => {
    const response = await axiosClient.post(
        endpoints.ai.assistant,
        {
            query,
        }
    );

    return response.data;
};

const getNextBestAction = async (contactId) => {
    const response = await axiosClient.post(
        endpoints.ai.nextBestAction(contactId)
    );

    return response.data;
};

export {
    getLeadScore,
    getContactSummary,
    askAssistant,
    getNextBestAction,
};