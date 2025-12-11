/**
 * Anomaly Detection Algorithms
 * Implements statistical methods to detect irregular voting patterns
 */

/**
 * Calculate Z-score for anomaly detection
 * Z-score measures how many standard deviations away a value is from the mean
 */
export function calculateZScore(value, data) {
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
export function detectZScoreAnomalies(data, threshold = 2.5) {
    const anomalies = [];

    data.forEach((item, index) => {
        const values = data.map(d => d.value);
        const zScore = calculateZScore(item.value, values);

        if (Math.abs(zScore) > threshold) {
            anomalies.push({
                ...item,
                zScore: zScore,
                severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
                type: 'z-score'
            });
        }
    });

    return anomalies;
}

/**
 * Calculate moving average for trend analysis
 */
export function calculateMovingAverage(data, windowSize = 5) {
    const movingAverages = [];

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
export function detectMovingAverageAnomalies(data, threshold = 1.5) {
    const values = data.map(d => d.value);
    const movingAvg = calculateMovingAverage(values, 5);
    const anomalies = [];

    data.forEach((item, index) => {
        if (movingAvg[index] === null) return;

        const deviation = Math.abs(item.value - movingAvg[index]);
        const percentDeviation = (deviation / movingAvg[index]) * 100;

        if (percentDeviation > threshold * 100) {
            anomalies.push({
                ...item,
                deviation: percentDeviation,
                movingAverage: movingAvg[index],
                severity: percentDeviation > 200 ? 'high' : 'medium',
                type: 'moving-average'
            });
        }
    });

    return anomalies;
}

/**
 * Detect turnout rate anomalies
 * Flags unusually high or low voter turnout rates
 */
export function detectTurnoutAnomalies(districts) {
    const turnoutRates = districts.map(d => (d.votes / d.registeredVoters) * 100);
    const anomalies = [];

    districts.forEach((district, index) => {
        const rate = turnoutRates[index];
        const zScore = calculateZScore(rate, turnoutRates);

        // Flag if turnout is suspiciously high (>95%) or has high z-score
        if (rate > 95 || Math.abs(zScore) > 2.5) {
            anomalies.push({
                districtId: district.id,
                districtName: district.name,
                turnoutRate: rate,
                zScore: zScore,
                message: rate > 95
                    ? `Unusually high turnout rate: ${rate.toFixed(1)}%`
                    : `Turnout rate significantly deviates from average`,
                severity: rate > 98 || Math.abs(zScore) > 3 ? 'high' : 'medium',
                type: 'turnout'
            });
        }
    });

    return anomalies;
}

/**
 * Detect voting rate anomalies (votes per minute)
 * Identifies suspiciously fast vote accumulation
 */
export function detectVoteRateAnomalies(voteHistory, timeWindowMinutes = 10) {
    const anomalies = [];

    // Group votes by time windows
    for (let i = timeWindowMinutes; i < voteHistory.length; i++) {
        const currentWindow = voteHistory.slice(i - timeWindowMinutes, i);
        const voteRate = currentWindow.reduce((sum, h) => sum + h.votes, 0) / timeWindowMinutes;

        // Compare to overall average
        const overallAvg = voteHistory.reduce((sum, h) => sum + h.votes, 0) / voteHistory.length;

        if (voteRate > overallAvg * 3) {
            anomalies.push({
                timestamp: voteHistory[i].timestamp,
                voteRate: voteRate,
                expectedRate: overallAvg,
                message: `Suspicious vote rate: ${voteRate.toFixed(0)} votes/min (avg: ${overallAvg.toFixed(0)})`,
                severity: voteRate > overallAvg * 5 ? 'high' : 'medium',
                type: 'vote-rate'
            });
        }
    }

    return anomalies;
}

/**
 * Comprehensive anomaly analysis
 * Combines multiple detection methods
 */
export function analyzeAllAnomalies(districts, voteHistory) {
    const allAnomalies = [];

    // Detect turnout anomalies
    const turnoutAnomalies = detectTurnoutAnomalies(districts);
    allAnomalies.push(...turnoutAnomalies);

    // Detect vote rate anomalies
    if (voteHistory.length > 10) {
        const rateAnomalies = detectVoteRateAnomalies(voteHistory);
        allAnomalies.push(...rateAnomalies);
    }

    // Sort by severity and timestamp
    allAnomalies.sort((a, b) => {
        if (a.severity === 'high' && b.severity !== 'high') return -1;
        if (a.severity !== 'high' && b.severity === 'high') return 1;
        return 0;
    });

    return allAnomalies;
}

/**
 * Calculate anomaly score for a district (0-100)
 */
export function calculateAnomalyScore(district, allDistricts) {
    let score = 0;

    // Check turnout rate
    const turnoutRate = (district.votes / district.registeredVoters) * 100;
    if (turnoutRate > 95) score += 30;
    else if (turnoutRate > 90) score += 15;
    else if (turnoutRate < 30) score += 20;

    // Check vote distribution
    const avgVotes = allDistricts.reduce((sum, d) => sum + d.votes, 0) / allDistricts.length;
    const deviation = Math.abs(district.votes - avgVotes) / avgVotes;
    if (deviation > 2) score += 30;
    else if (deviation > 1) score += 15;

    // Check vote velocity (if available)
    if (district.voteVelocity) {
        const avgVelocity = allDistricts.reduce((sum, d) => sum + (d.voteVelocity || 0), 0) / allDistricts.length;
        const velocityDeviation = Math.abs(district.voteVelocity - avgVelocity) / avgVelocity;
        if (velocityDeviation > 3) score += 40;
        else if (velocityDeviation > 2) score += 20;
    }

    return Math.min(score, 100);
}
