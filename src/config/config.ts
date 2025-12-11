/**
 * Environment Configuration
 * Centralized configuration management using environment variables
 */

export const config = {
  updateIntervals: {
    fast: Number(process.env.REACT_APP_UPDATE_INTERVAL_FAST) || 1000,
    normal: Number(process.env.REACT_APP_UPDATE_INTERVAL_NORMAL) || 2000,
    slow: Number(process.env.REACT_APP_UPDATE_INTERVAL_SLOW) || 5000,
  },
  anomalyDetection: {
    injectionRate: Number(process.env.REACT_APP_ANOMALY_INJECTION_RATE) || 0.05,
    zScoreThreshold: Number(process.env.REACT_APP_ZSCORE_THRESHOLD) || 2.5,
  },
  dataRetention: {
    maxHistoryEntries: Number(process.env.REACT_APP_MAX_HISTORY_ENTRIES) || 50,
    maxActivities: Number(process.env.REACT_APP_MAX_ACTIVITIES) || 100,
  },
} as const;

export default config;
