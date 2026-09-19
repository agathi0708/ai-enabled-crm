import { useEffect } from "react";

import useAIAssistant from "../hooks/useAIAssistant";
import LeadScoreCard from "./LeadScoreCard";
import InsightCard from "./InsightCard";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const AIAssistantPanel = ({
    contactId = 1,
}) => {
    const {
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
    } = useAIAssistant();

    useEffect(() => {
        const loadAIInsights = async () => {
            try {
                await fetchLeadScore(contactId);
            } catch { }

            try {
                await fetchSummary(contactId);
            } catch { }

            try {
                await fetchNextBestAction(contactId);
            } catch { }
        };

        loadAIInsights();
    }, [contactId]);

    return (
        <section className="ai-assistant-panel">
            <div className="ai-panel-header">
                <div>
                    <h2>AI Assistant</h2>

                    <p>
                        AI-powered insights and recommendations
                    </p>
                </div>
            </div>

            {error && (
                <div className="ai-error">
                    {error}
                </div>
            )}

            <div className="ai-insights-grid">
                <LeadScoreCard
                    leadScore={leadScore}
                    loading={leadScoreLoading}
                />

                <InsightCard
                    title="Contact Summary"
                    content={summary}
                    loading={summaryLoading}
                    type="info"
                />

                <InsightCard
                    title="Next Best Action"
                    content={
                        nextBestAction
                            ? `${nextBestAction.action} — ${nextBestAction.reason}`
                            : ""
                    }
                    loading={nextBestActionLoading}
                    type="action"
                />
            </div>

            <div className="ai-chat-section">
                <div className="ai-chat-header">
                    <h3>CRM Chat Assistant</h3>

                    <p>
                        Ask questions about contacts,
                        activities, deals, or tasks.
                    </p>
                </div>

                <div className="ai-chat-messages">
                    {messages.length === 0 ? (
                        <div className="ai-chat-empty">
                            <p>
                                Ask me something about your
                                CRM.
                            </p>

                            <p>
                                Example: "What activities
                                does Arun have?"
                            </p>
                        </div>
                    ) : (
                        messages.map(
                            (message, index) => (
                                <ChatMessage
                                    key={`${message.role}-${index}`}
                                    message={message}
                                />
                            )
                        )
                    )}

                    {assistantLoading &&
                        messages.length > 0 && (
                            <div className="chat-message chat-message-assistant">
                                <div className="chat-message-role">
                                    AI Assistant
                                </div>

                                <div className="chat-message-content">
                                    Thinking...
                                </div>
                            </div>
                        )}
                </div>

                <ChatInput
                    onSend={sendAssistantMessage}
                    loading={assistantLoading}
                />
            </div>
        </section>
    );
};

export default AIAssistantPanel;