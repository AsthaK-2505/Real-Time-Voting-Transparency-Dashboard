/**
 * Anomaly Detection Algorithms
 * Implements statistical methods to detect irregular voting patterns
 */

import { District, Anomaly, VoteHistoryEntry, ChartDataPoint } from '../types';
import config from '../config/config';

/**
 * Calculate Z-score for anomaly detection
 * Z-score measures how many standard deviations away a value is from the mean
 */
export function calculateZScore(value: number, data: number[]): number {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (value - mean) / stdDev;
}

/**
 * Detect anomalies using Z-score threshold
 * Typically, |z| > 2 indicates potential anomaly, |z| > 3 is highly anomalous
 */
export function detectZScoreAnomalies(
  data: ChartDataPoint[],
  threshold: number = config.anomalyDetection.zScoreThreshold
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  data.forEach((item, index) => {
    const values = data.map(d => d.value);
    const zScore = calculateZScore(item.value, values);

    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        districtId: index,
        zScore,
        severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
        type: 'z-score',
        message: `Z-score anomaly detected: ${zScore.toFixed(2)} standard deviations from mean`,
        timestamp: item.timestamp || new Date(),
      });
    }
  });

  return anomalies;
}

/**
 * Calculate moving average for trend analysis
 */
export function calculateMovingAverage(data: number[], windowSize: number = 5): (number | null)[] {
  const movingAverages: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      movingAverages.push(null);
      continue;
    }

    const window = data.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
    movingAverages.push(avg);
  }

  return movingAverages;
}

/**
 * Detect sudden changes using moving average deviation
 */
export function detectMovingAverageAnomalies(
  data: ChartDataPoint[],
  threshold: number = 1.5
): Anomaly[] {
  const values = data.map(d => d.value);
  const movingAvg = calculateMovingAverage(values, 5);
  const anomalies: Anomaly[] = [];

  data.forEach((item, index) => {
    if (movingAvg[index] === null) return;

    const avgValue = movingAvg[index] as number;
    const deviation = Math.abs(item.value - avgValue);
    const percentDeviation = (deviation / avgValue) * 100;

    if (percentDeviation > threshold * 100) {
      anomalies.push({
        districtId: index,
        deviation: percentDeviation,
        movingAverage: avgValue,
        severity: percentDeviation > 200 ? 'high' : 'medium',
        type: 'moving-average',
        message: `Moving average deviation: ${percentDeviation.toFixed(1)}% from trend`,
        timestamp: item.timestamp || new Date(),
      });
    }
  });

  return anomalies;
}

/**
 * Detect turnout rate anomalies
 * Flags unusually high or low voter turnout rates
 */
export function detectTurnoutAnomalies(districts: District[]): Anomaly[] {
  const turnoutRates = districts.map(d => (d.votes / d.registeredVoters) * 100);
  const anomalies: Anomaly[] = [];

  districts.forEach((district, index) => {
    const turnoutRate = turnoutRates[index];
    const zScore = calculateZScore(turnoutRate, turnoutRates);

    // Flag impossibly high turnout (>100%)
    if (turnoutRate > 100) {
      anomalies.push({
        districtId: district.id,
        districtName: district.name,
        type: 'turnout-rate',
        severity: 'high',
        turnoutRate,
        zScore,
        message: `Impossible turnout rate: ${turnoutRate.toFixed(1)}% (exceeds 100%)`,
        timestamp: new Date(),
      });
    }
    // Flag statistically anomalous turnout
    else if (Math.abs(zScore) > 3) {
      anomalies.push({
        districtId: district.id,
        districtName: district.name,
        type: 'turnout-rate',
        severity: zScore > 0 ? 'high' : 'medium',
        turnoutRate,
        zScore,
        message: `Unusual turnout rate: ${turnoutRate.toFixed(1)}% (${zScore > 0 ? 'abnormally high' : 'abnormally low'})`,
        timestamp: new Date(),
      });
    }
  });

  return anomalies;
}

/**
 * Detect vote rate anomalies (suspiciously fast or slow vote accumulation)
 */
export function detectVoteRateAnomalies(districts: District[]): Anomaly[] {
  const voteRates = districts.map(d => d.voteVelocity);
  const avgRate = voteRates.reduce((sum, rate) => sum + rate, 0) / voteRates.length;
  const anomalies: Anomaly[] = [];

  districts.forEach(district => {
    const deviation = Math.abs(district.voteVelocity - avgRate);
    const percentDeviation = avgRate > 0 ? (deviation / avgRate) * 100 : 0;

    // Suspiciously high vote rate
    if (percentDeviation > 300 && district.voteVelocity > avgRate) {
      anomalies.push({
        districtId: district.id,
        districtName: district.name,
        type: 'vote-rate',
        severity: percentDeviation > 500 ? 'high' : 'medium',
        voteRate: district.voteVelocity,
        expectedRate: avgRate,
        message: `Suspicious vote rate: ${district.voteVelocity.toFixed(0)} votes/min (${percentDeviation.toFixed(0)}% above average)`,
        timestamp: new Date(),
      });
    }
  });

  return anomalies;
}

/**
 * Analyze all anomalies across districts
 */
export function analyzeAllAnomalies(
  districts: District[],
  _voteHistory: VoteHistoryEntry[]
): Anomaly[] {
  try {
    const allAnomalies: Anomaly[] = [];

    // Turnout anomalies
    const turnoutAnomalies = detectTurnoutAnomalies(districts);
    allAnomalies.push(...turnoutAnomalies);

    // Vote rate anomalies
    const voteRateAnomalies = detectVoteRateAnomalies(districts);
    allAnomalies.push(...voteRateAnomalies);

    return allAnomalies;
  } catch (error) {
    console.error('Error analyzing anomalies:', error);
    return [];
  }
}

/**
 * Calculate overall anomaly score (0-100)
 */
export function calculateAnomalyScore(anomalies: Anomaly[]): number {
  if (anomalies.length === 0) return 0;

  const highCount = anomalies.filter(a => a.severity === 'high').length;
  const mediumCount = anomalies.filter(a => a.severity === 'medium').length;
  const lowCount = anomalies.filter(a => a.severity === 'low').length;

  const score = (highCount * 10 + mediumCount * 5 + lowCount * 2);
  return Math.min(100, score);
}
