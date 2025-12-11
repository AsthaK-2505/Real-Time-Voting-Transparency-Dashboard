import React, { memo } from "react";
import { Activity } from "../types";

interface LiveFeedProps {
  activities: Activity[];
}

/**
 * Live Feed Component
 * Displays real-time activity log with updates and alerts
 * Memoized for performance optimization
 */
const LiveFeed: React.FC<LiveFeedProps> = memo(({ activities }) => {
  const getActivityIcon = (action: Activity["action"]): string => {
    switch (action) {
      case "vote-update":
        return "📊";
      case "anomaly-detected":
        return "🚨";
      case "system":
        return "⚙️";
      default:
        return "📌";
    }
  };

  const getActivityColor = (action: Activity["action"]): string => {
    switch (action) {
      case "anomaly-detected":
        return "#ef4444";
      case "system":
        return "#6b7280";
      default:
        return "#3b82f6";
    }
  };

  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <div
        className="live-feed"
        role="log"
        aria-live="polite"
        aria-label="Activity feed"
      >
        <h2>📡 Live Activity Feed</h2>
        <p className="no-activity">Waiting for activity...</p>
      </div>
    );
  }

  return (
    <div
      className="live-feed"
      role="log"
      aria-live="polite"
      aria-label="Activity feed"
    >
      <div className="feed-header">
        <h2>📡 Live Activity Feed</h2>
        <span
          className="live-indicator"
          role="status"
          aria-label="Live updates active"
        >
          <span className="pulse" aria-hidden="true"></span>
          LIVE
        </span>
      </div>

      <div className="activity-list">
        {activities.slice(0, 20).map((activity) => (
          <div
            key={activity.id}
            className="activity-item"
            style={{ borderLeftColor: getActivityColor(activity.action) }}
            role="listitem"
          >
            <div className="activity-icon" aria-hidden="true">
              {getActivityIcon(activity.action)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-district">
                  {activity.districtName}
                </span>
                <time
                  className="activity-time"
                  dateTime={activity.timestamp.toISOString()}
                >
                  {formatTime(activity.timestamp)}
                </time>
              </div>
              <p className="activity-details">{activity.details}</p>
            </div>
          </div>
        ))}
      </div>

      {activities.length > 20 && (
        <div className="feed-footer" role="note">
          Showing 20 most recent activities
        </div>
      )}
    </div>
  );
});

LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
