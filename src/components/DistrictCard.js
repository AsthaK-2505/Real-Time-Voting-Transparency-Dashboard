import React from 'react';

/**
 * District Card Component
 * Displays individual district statistics with status indicators
 */
const DistrictCard = ({ district, anomalyScore }) => {
    const turnoutRate = ((district.votes / district.registeredVoters) * 100).toFixed(1);

    // Determine status color based on anomaly score
    const getStatusColor = () => {
        if (anomalyScore > 70) return '#ef4444'; // Red - high anomaly
        if (anomalyScore > 40) return '#f59e0b'; // Orange - medium anomaly
        if (anomalyScore > 20) return '#fbbf24'; // Yellow - low anomaly
        return '#10b981'; // Green - normal
    };

    const getStatusText = () => {
        if (anomalyScore > 70) return 'High Alert';
        if (anomalyScore > 40) return 'Warning';
        if (anomalyScore > 20) return 'Monitor';
        return 'Normal';
    };

    const statusColor = getStatusColor();
    const statusText = getStatusText();

    // Find leading candidate
    const candidateEntries = Object.entries(district.candidateVotes);
    const leadingCandidate = candidateEntries.reduce((max, [id, votes]) =>
        votes > max.votes ? { id, votes } : max,
        { id: '', votes: 0 }
    );

    return (
        <div className="district-card">
            <div className="district-header">
                <div>
                    <h3>{district.name}</h3>
                    <p className="district-meta">
                        {district.votes.toLocaleString()} / {district.registeredVoters.toLocaleString()} votes
                    </p>
                </div>
                <div className="status-badge" style={{ backgroundColor: statusColor }}>
                    {statusText}
                </div>
            </div>

            <div className="district-stats">
                <div className="stat-item">
                    <span className="stat-label">Turnout</span>
                    <span className="stat-value" style={{
                        color: turnoutRate > 90 ? '#ef4444' : turnoutRate > 70 ? '#10b981' : '#6b7280'
                    }}>
                        {turnoutRate}%
                    </span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Anomaly Score</span>
                    <span className="stat-value" style={{ color: statusColor }}>
                        {anomalyScore}/100
                    </span>
                </div>

                <div className="stat-item">
                    <span className="stat-label">Status</span>
                    <span className="stat-value">
                        {district.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                    </span>
                </div>
            </div>

            <div className="vote-distribution">
                <h4>Vote Distribution</h4>
                {candidateEntries.map(([id, votes]) => {
                    const percentage = district.votes > 0 ? ((votes / district.votes) * 100).toFixed(1) : 0;
                    return (
                        <div key={id} className="candidate-bar">
                            <div className="candidate-info">
                                <span>Candidate {id}</span>
                                <span>{percentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: id === leadingCandidate.id ? '#3b82f6' : '#94a3b8'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DistrictCard;
