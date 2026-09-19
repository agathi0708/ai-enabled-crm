const InsightCard = ({
    title,
    content,
    type = "info",
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="ai-card">
                <h3>{title}</h3>
                <p>Generating AI insight...</p>
            </div>
        );
    }

    let displayContent = "";

    if (typeof content === "string") {
        displayContent = content;
    } else if (content && typeof content === "object") {
        if (content.action && content.reason) {
            displayContent = `${content.action} — ${content.reason}`;
        } else {
            displayContent = JSON.stringify(content);
        }
    }

    const formattedContent = displayContent
        ? displayContent
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/^\s*-\s*/gm, "• ")
        : "";

    return (
        <div className={`ai-card ai-card-${type}`}>
            <div className="ai-card-header">
                <h3>{title}</h3>
            </div>

            <p className="ai-card-text">
                {formattedContent ||
                    "No AI insight available yet."}
            </p>
        </div>
    );
};

export default InsightCard;