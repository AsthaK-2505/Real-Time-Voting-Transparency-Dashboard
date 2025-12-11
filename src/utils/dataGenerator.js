/**
 * Data Generator for Real-Time Voting Simulation
 * Generates realistic voting data with occasional anomalies
 */

const DISTRICTS = [
    { id: 1, name: 'District 1 - Downtown', registeredVoters: 45000, baseVoteRate: 120 },
    { id: 2, name: 'District 2 - Northside', registeredVoters: 38000, baseVoteRate: 95 },
    { id: 3, name: 'District 3 - Eastville', registeredVoters: 52000, baseVoteRate: 140 },
    { id: 4, name: 'District 4 - Westport', registeredVoters: 41000, baseVoteRate: 105 },
    { id: 5, name: 'District 5 - Southend', registeredVoters: 35000, baseVoteRate: 88 },
    { id: 6, name: 'District 6 - Central', registeredVoters: 47000, baseVoteRate: 125 },
    { id: 7, name: 'District 7 - Riverside', registeredVoters: 29000, baseVoteRate: 75 },
    { id: 8, name: 'District 8 - Hilltop', registeredVoters: 33000, baseVoteRate: 85 }
];

const CANDIDATES = [
    { id: 'A', name: 'Candidate A', party: 'Blue Party', color: '#3b82f6' },
    { id: 'B', name: 'Candidate B', party: 'Red Party', color: '#ef4444' },
    { id: 'C', name: 'Candidate C', party: 'Green Party', color: '#10b981' },
    { id: 'D', name: 'Candidate D', party: 'Independent', color: '#f59e0b' }
];

/**
 * Initialize district data with starting values
 */
export function initializeDistrictData() {
    return DISTRICTS.map(district => ({
        ...district,
        votes: 0,
        candidateVotes: {
            A: 0,
            B: 0,
            C: 0,
            D: 0
        },
        voteVelocity: 0,
        lastUpdate: new Date(),
        status: 'active'
    }));
}

/**
 * Generate random vote increment with natural variation
 */
function generateVoteIncrement(baseRate, variance = 0.3) {
    const variation = 1 + (Math.random() - 0.5) * variance;
    return Math.max(1, Math.round(baseRate * variation));
}

/**
 * Inject anomaly into voting data (for testing detection)
 */
function injectAnomaly(district, anomalyType) {
    switch (anomalyType) {
        case 'high-turnout':
            // Sudden spike in votes
            return generateVoteIncrement(district.baseVoteRate * 5);

        case 'suspicious-rate':
            // Extremely high vote rate
            return generateVoteIncrement(district.baseVoteRate * 8);

        case 'imbalanced':
            // All votes go to one candidate
            return {
                A: generateVoteIncrement(district.baseVoteRate * 3),
                B: 0,
                C: 0,
                D: 0
            };

        default:
            return null;
    }
}

/**
 * Update district voting data with new votes
 */
export function updateDistrictVotes(districts) {
    const updatedDistricts = districts.map(district => {
        // 5% chance of anomaly injection for demonstration
        const hasAnomaly = Math.random() < 0.05;
        let newVotes;

        if (hasAnomaly) {
            const anomalyTypes = ['high-turnout', 'suspicious-rate'];
            const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
            newVotes = injectAnomaly(district, anomalyType);
        } else {
            newVotes = generateVoteIncrement(district.baseVoteRate);
        }

        // Distribute votes among candidates (with realistic proportions)
        const candidateDistribution = {
            A: 0.35 + Math.random() * 0.1,
            B: 0.30 + Math.random() * 0.1,
            C: 0.20 + Math.random() * 0.1,
            D: 0.15 + Math.random() * 0.05
        };

        // Normalize distribution
        const total = Object.values(candidateDistribution).reduce((sum, val) => sum + val, 0);
        Object.keys(candidateDistribution).forEach(key => {
            candidateDistribution[key] /= total;
        });

        const updatedCandidateVotes = {};
        let totalNewVotes = typeof newVotes === 'number' ? newVotes : 0;

        if (typeof newVotes === 'object') {
            // Anomaly case - predefined distribution
            Object.keys(newVotes).forEach(candidate => {
                updatedCandidateVotes[candidate] = district.candidateVotes[candidate] + newVotes[candidate];
                totalNewVotes += newVotes[candidate];
            });
        } else {
            // Normal case - distribute votes
            Object.keys(candidateDistribution).forEach(candidate => {
                const candidateNewVotes = Math.round(newVotes * candidateDistribution[candidate]);
                updatedCandidateVotes[candidate] = district.candidateVotes[candidate] + candidateNewVotes;
            });
        }

        const newTotalVotes = district.votes + totalNewVotes;

        // Don't exceed registered voters (unless anomaly)
        if (newTotalVotes > district.registeredVoters && !hasAnomaly) {
            return { ...district, status: 'closed' };
        }

        const now = new Date();
        const timeDiff = (now - district.lastUpdate) / 1000 / 60; // minutes
        const voteVelocity = timeDiff > 0 ? totalNewVotes / timeDiff : 0;

        return {
            ...district,
            votes: newTotalVotes,
            candidateVotes: updatedCandidateVotes,
            voteVelocity: voteVelocity,
            lastUpdate: now
        };
    });

    return updatedDistricts;
}

/**
 * Generate vote history entry
 */
export function generateVoteHistoryEntry(districts, timestamp) {
    const totalVotes = districts.reduce((sum, d) => sum + d.votes, 0);
    const candidateTotals = {
        A: districts.reduce((sum, d) => sum + d.candidateVotes.A, 0),
        B: districts.reduce((sum, d) => sum + d.candidateVotes.B, 0),
        C: districts.reduce((sum, d) => sum + d.candidateVotes.C, 0),
        D: districts.reduce((sum, d) => sum + d.candidateVotes.D, 0)
    };

    return {
        timestamp: timestamp,
        totalVotes: totalVotes,
        candidateTotals: candidateTotals,
        votes: totalVotes
    };
}

/**
 * Generate activity log entry
 */
export function generateActivityLog(district, action, details) {
    return {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        districtId: district.id,
        districtName: district.name,
        action: action,
        details: details
    };
}

/**
 * Get candidate information
 */
export function getCandidates() {
    return CANDIDATES;
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(districts) {
    const totalRegistered = districts.reduce((sum, d) => sum + d.registeredVoters, 0);
    const totalVotes = districts.reduce((sum, d) => sum + d.votes, 0);
    const turnoutRate = (totalVotes / totalRegistered) * 100;

    const candidateTotals = {
        A: districts.reduce((sum, d) => sum + d.candidateVotes.A, 0),
        B: districts.reduce((sum, d) => sum + d.candidateVotes.B, 0),
        C: districts.reduce((sum, d) => sum + d.candidateVotes.C, 0),
        D: districts.reduce((sum, d) => sum + d.candidateVotes.D, 0)
    };

    return {
        totalRegistered,
        totalVotes,
        turnoutRate,
        candidateTotals,
        activeDistricts: districts.filter(d => d.status === 'active').length,
        closedDistricts: districts.filter(d => d.status === 'closed').length
    };
}
