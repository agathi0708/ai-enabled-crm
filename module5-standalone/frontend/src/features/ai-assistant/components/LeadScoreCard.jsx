const LeadScoreCard = ({
    leadScore,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="ai-card">
                <h3>AI Lead Score</h3>
                <p>Calculating lead score...</p>
            </div>
        );
    }

    if (!leadScore) {
        return (
            <div className="ai-card">
                <h3>AI Lead Score</h3>
                <p>
                    No lead score available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="ai-card">
            <div className="ai-card-header">
                <h3>AI Lead Score</h3>
                <span>
                    {leadScore.score}/100
                </span>
            </div>

            <div className="lead-score">
                <div
                    className="lead-score-bar"
                    style={{
                        width: `${leadScore.score}%`,
                    }}
                />
            </div>

            <p className="ai-card-label">
                AI Recommendation
            </p>

            <p className="ai-card-text">
                {leadScore.rationale}
            </p>

            {leadScore.provider && (
                <small>
                    Powered by {leadScore.provider}
                </small>
            )}
        </div>
    );
};

export default LeadScoreCard;