import React, { memo } from 'react';
import { District, Candidate } from '../types';

interface DistrictCardProps {
  district: District;
  anomalyScore: number;
  candidates: Candidate[];
}

/**
 * District Card Component
 * Displays individual district statistics with status indicators
 * Memoized for performance optimization
 */
const DistrictCard: React.FC<DistrictCardProps> = memo(({ district, anomalyScore, candidates }) => {
  const turnoutRate = ((district.votes / district.registeredVoters) * 100).toFixed(1);

  // Determine status color based on anomaly score
  const getStatusColor = (): string => {
    if (anomalyScore > 70) return '#ef4444'; // Red - high anomaly
    if (anomalyScore > 40) return '#f59e0b'; // Orange - medium anomaly
    if (anomalyScore > 20) return '#fbbf24'; // Yellow - low anomaly
    return '#10b981'; // Green - normal
  };

  const getStatusText = (): string => {
    if (anomalyScore > 70) return 'High Alert';
    if (anomalyScore > 40) return 'Warning';
    if (anomalyScore > 20) return 'Monitor';
    return 'Normal';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  // Find leading candidate
  const candidateEntries = Object.entries(district.candidateVotes);
  const leadingCandidate = candidateEntries.reduce(
    (max, [id, votes]) => (votes > max.votes ? { id, votes } : max),
    { id: '', votes: 0 }
  );

  return (
    <div className="district-card" role="article" aria-label={`${district.name} statistics`}>
      <div className="district-header">
        <div>
          <h3>{district.name}</h3>
          <p className="district-meta">
            <span aria-label={`${district.votes} votes cast out of ${district.registeredVoters} registered voters`}>
              {district.votes.toLocaleString()} / {district.registeredVoters.toLocaleString()} votes
            </span>
          </p>
        </div>
        <div
          className="status-badge"
          style={{ backgroundColor: statusColor }}
          role="status"
          aria-label={`District status: ${statusText}`}
        >
          {statusText}
        </div>
      </div>

      <div className="district-stats">
        <div className="stat-item">
          <span className="stat-label">Turnout</span>
          <span
            className="stat-value"
            style={{
              color: Number(turnoutRate) > 90 ? '#ef4444' : Number(turnoutRate) > 70 ? '#10b981' : '#6b7280',
            }}
            aria-label={`${turnoutRate}% voter turnout`}
          >
            {turnoutRate}%
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Anomaly Score</span>
          <span
            className="stat-value"
            style={{ color: statusColor }}
            aria-label={`Anomaly score ${anomalyScore} out of 100`}
          >
            {anomalyScore}/100
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className="stat-value" aria-label={`District is ${district.status}`}>
            {district.status === 'active' ? '🟢 Active' : '🔴 Closed'}
          </span>
        </div>
      </div>

      <div className="vote-distribution">
        <h4>Vote Distribution</h4>
        {candidates.map(candidate => {
          const votes = district.candidateVotes[candidate.id] || 0;
          const percentage = district.votes > 0 ? ((votes / district.votes) * 100).toFixed(1) : '0';
          const isLeading = candidate.id === leadingCandidate.id;
          
          return (
            <div key={candidate.id} className="candidate-bar">
              <div className="candidate-info">
                <span style={{ color: candidate.color, fontWeight: isLeading ? 'bold' : 'normal' }}>
                  {candidate.name} {isLeading && '👑'}
                </span>
                <span>{votes.toLocaleString()} ({percentage}%)</span>
              </div>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={Number(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${candidate.name} has ${percentage}% of votes`}
              >
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: candidate.color,
                    opacity: isLeading ? 1 : 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DistrictCard.displayName = 'DistrictCard';

export default DistrictCard;
