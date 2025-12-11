import React, { memo } from 'react';
import { Anomaly } from '../types';

interface AnomalyDetectorProps {
  anomalies: Anomaly[];
}

/**
 * Anomaly Detector Component
 * Displays detected anomalies with severity indicators and details
 * Memoized for performance optimization
 */
const AnomalyDetector: React.FC<AnomalyDetectorProps> = memo(({ anomalies }) => {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="anomaly-detector" role="region" aria-label="Anomaly detection status">
        <div className="anomaly-header">
          <h2>🛡️ Anomaly Detection</h2>
          <span
            className="status-badge"
            style={{ backgroundColor: '#10b981' }}
            role="status"
            aria-label="All clear, no anomalies detected"
          >
            All Clear
          </span>
        </div>
        <p className="no-anomalies">No anomalies detected. System operating normally.</p>
      </div>
    );
  }

  const highSeverity = anomalies.filter(a => a.severity === 'high').length;
  const mediumSeverity = anomalies.filter(a => a.severity === 'medium').length;

  const getSeverityIcon = (severity: Anomaly['severity']): string => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']): string => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="anomaly-detector" role="region" aria-label="Anomaly detection alerts">
      <div className="anomaly-header">
        <h2>🛡️ Anomaly Detection</h2>
        <div className="anomaly-summary" role="status">
          {highSeverity > 0 && (
            <span className="severity-count high" aria-label={`${highSeverity} high severity anomalies`}>
              {highSeverity} High
            </span>
          )}
          {mediumSeverity > 0 && (
            <span className="severity-count medium" aria-label={`${mediumSeverity} medium severity anomalies`}>
              {mediumSeverity} Medium
            </span>
          )}
        </div>
      </div>

      <div className="anomaly-list" role="list">
        {anomalies.slice(0, 10).map((anomaly, index) => (
          <div
            key={`${anomaly.districtId}-${anomaly.type}-${index}`}
            className="anomaly-item"
            style={{ borderLeftColor: getSeverityColor(anomaly.severity) }}
            role="listitem"
            aria-label={`${anomaly.severity} severity anomaly in ${anomaly.districtName || `District ${anomaly.districtId}`}`}
          >
            <div className="anomaly-icon" aria-hidden="true">
              {getSeverityIcon(anomaly.severity)}
            </div>
            <div className="anomaly-content">
              <div className="anomaly-title">
                {anomaly.districtName || `District ${anomaly.districtId}`}
                <span
                  className="anomaly-type"
                  style={{ backgroundColor: getSeverityColor(anomaly.severity) + '20' }}
                >
                  {anomaly.type}
                </span>
              </div>
              <p className="anomaly-message">{anomaly.message}</p>
              {anomaly.turnoutRate && (
                <div className="anomaly-details">
                  <span>Turnout: {anomaly.turnoutRate.toFixed(1)}%</span>
                  {anomaly.zScore && <span>Z-Score: {anomaly.zScore.toFixed(2)}</span>}
                </div>
              )}
              {anomaly.voteRate && (
                <div className="anomaly-details">
                  <span>Rate: {anomaly.voteRate.toFixed(0)} votes/min</span>
                  <span>Expected: {anomaly.expectedRate?.toFixed(0)} votes/min</span>
                </div>
              )}
            </div>
            <div
              className="severity-badge"
              style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
              aria-label={`${anomaly.severity} severity`}
            >
              {anomaly.severity}
            </div>
          </div>
        ))}
      </div>

      {anomalies.length > 10 && (
        <div className="anomaly-footer" role="note">
          Showing 10 most recent anomalies ({anomalies.length} total)
        </div>
      )}
    </div>
  );
});

AnomalyDetector.displayName = 'AnomalyDetector';

export default AnomalyDetector;
