import { useState } from "react";

import {
    getLeadScore,
    getContactSummary,
    askAssistant,
    getNextBestAction,
} from "../api/aiApi";

const useAIAssistant = () => {
    const [leadScoreLoading, setLeadScoreLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [nextBestActionLoading, setNextBestActionLoading] = useState(false);
    const [assistantLoading, setAssistantLoading] = useState(false);

    const [error, setError] = useState("");

    const [leadScore, setLeadScore] = useState(null);
    const [summary, setSummary] = useState("");
    const [nextBestAction, setNextBestAction] = useState(null);
    const [messages, setMessages] = useState([]);

    const clearError = () => setError("");

    const fetchLeadScore = async (contactId) => {
        try {
            setLeadScoreLoading(true);

            const response = await getLeadScore(contactId);

            setLeadScore(response.data);

            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to generate lead score.";

            setError(message);

            throw err;
        } finally {
            setLeadScoreLoading(false);
        }
    };

    const fetchSummary = async (contactId) => {
        try {
            setSummaryLoading(true);

            const response = await getContactSummary(contactId);

            setSummary(response.data.summary);

            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to generate contact summary.";

            setError(message);

            throw err;
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchNextBestAction = async (contactId) => {
        try {
            setNextBestActionLoading(true);

            const response = await getNextBestAction(contactId);

            console.log(
                "Next Best Action API response:",
                response
            );

            const actionData =
                response?.data?.data ||
                response?.data;

            console.log(
                "Next Best Action parsed data:",
                actionData
            );

            setNextBestAction(actionData);

            return actionData;
        } catch (err) {
            console.error(
                "Next Best Action error:",
                err.response?.data || err.message
            );

            const message =
                err.response?.data?.message ||
                "Failed to generate next best action.";

            setError(message);

            throw err;
        } finally {
            setNextBestActionLoading(false);
        }
    };

    const sendAssistantMessage = async (query) => {
        if (!query || !query.trim()) {
            return;
        }

        const userMessage = {
            role: "user",
            content: query,
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage,
        ]);

        try {
            setAssistantLoading(true);
            setError("");

            const response = await askAssistant(query);

            const assistantMessage = {
                role: "assistant",
                content: response.data.answer,
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                assistantMessage,
            ]);

            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to get a response from the AI assistant.";

            setError(message);

            throw err;
        } finally {
            setAssistantLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return {
        leadScoreLoading,
        summaryLoading,
        nextBestActionLoading,
        assistantLoading,

        error,

        leadScore,
        summary,
        nextBestAction,
        messages,

        fetchLeadScore,
        fetchSummary,
        fetchNextBestAction,
        sendAssistantMessage,

        clearMessages,
        clearError,
    };
};

export default useAIAssistant;