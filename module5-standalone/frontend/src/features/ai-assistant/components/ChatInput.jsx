import { useState } from "react";

const ChatInput = ({
    onSend,
    loading = false,
}) => {
    const [query, setQuery] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedQuery = query.trim();

        if (!trimmedQuery || loading) {
            return;
        }

        setQuery("");

        await onSend(trimmedQuery);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            handleSubmit(event);
        }
    };

    return (
        <form
            className="chat-input-form"
            onSubmit={handleSubmit}
        >
            <textarea
                value={query}
                onChange={(event) =>
                    setQuery(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI assistant about your CRM..."
                rows={2}
                disabled={loading}
            />

            <button
                type="submit"
                disabled={
                    loading || !query.trim()
                }
            >
                {loading ? "Thinking..." : "Send"}
            </button>
        </form>
    );
};

export default ChatInput;