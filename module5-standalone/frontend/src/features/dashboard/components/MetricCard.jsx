const MetricCard = ({ title, value, description }) => {
    return (
        <div className="metric-card">
            <p>{title}</p>
            <h2>{value}</h2>

            {description && <span>{description}</span>}
        </div>
    );
};

export default MetricCard;