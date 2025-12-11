import React from 'react';

/**
 * Live Feed Component
 * Displays real-time activity log with updates and alerts
 */
const LiveFeed = ({ activities }) => {
    const getActivityIcon = (action) => {
        switch (action) {
            case 'vote-update': return '📊';
            case 'anomaly-detected': return '🚨';
            case 'high-turnout': return '📈';
            case 'district-closed': return '🔒';
            case 'system': return '⚙️';
            default: return '📌';
        }
    };

    const getActivityColor = (action) => {
        switch (action) {
            case 'anomaly-detected': return '#ef4444';
            case 'high-turnout': return '#f59e0b';
            case 'district-closed': return '#6b7280';
            default: return '#3b82f6';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="live-feed">
                <h2>📡 Live Activity Feed</h2>
                <p className="no-activity">Waiting for activity...</p>
            </div>
        );
    }

    return (
        <div className="live-feed">
            <div className="feed-header">
                <h2>📡 Live Activity Feed</h2>
                <span className="live-indicator">
                    <span className="pulse"></span>
                    LIVE
                </span>
            </div>

            <div className="activity-list">
                {activities.slice(0, 20).map((activity) => (
                    <div
                        key={activity.id}
                        className="activity-item"
                        style={{ borderLeftColor: getActivityColor(activity.action) }}
                    >
                        <div className="activity-icon">
                            {getActivityIcon(activity.action)}
                        </div>
                        <div className="activity-content">
                            <div className="activity-header">
                                <span className="activity-district">{activity.districtName}</span>
                                <span className="activity-time">{formatTime(activity.timestamp)}</span>
                            </div>
                            <p className="activity-details">{activity.details}</p>
                        </div>
                    </div>
                ))}
            </div>

            {activities.length > 20 && (
                <div className="feed-footer">
                    Showing 20 most recent activities
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
