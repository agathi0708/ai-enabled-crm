const ChatMessage = ({ message }) => {
    const isUser = message.role === "user";

    return (
        <div
            className={`chat-message ${isUser
                    ? "chat-message-user"
                    : "chat-message-assistant"
                }`}
        >
            <div className="chat-message-role">
                {isUser ? "You" : "AI Assistant"}
            </div>

            <div className="chat-message-content">
                {message.content}
            </div>
        </div>
    );
};

export default ChatMessage;