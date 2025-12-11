/**
 * Data Generator for Real-Time Voting Simulation
 * Generates realistic voting data with occasional anomalies
 */

import {
  District,
  Candidate,
  VoteHistoryEntry,
  Activity,
  OverallStats,
  CandidateVotes,
  AnomalyType,
} from '../types';
import config from '../config/config';

interface BaseDistrict {
  id: number;
  name: string;
  registeredVoters: number;
  baseVoteRate: number;
}

const DISTRICTS: BaseDistrict[] = [
  { id: 1, name: 'District 1 - Downtown', registeredVoters: 45000, baseVoteRate: 120 },
  { id: 2, name: 'District 2 - Northside', registeredVoters: 38000, baseVoteRate: 95 },
  { id: 3, name: 'District 3 - Eastville', registeredVoters: 52000, baseVoteRate: 140 },
  { id: 4, name: 'District 4 - Westport', registeredVoters: 41000, baseVoteRate: 105 },
  { id: 5, name: 'District 5 - Southend', registeredVoters: 35000, baseVoteRate: 88 },
  { id: 6, name: 'District 6 - Central', registeredVoters: 47000, baseVoteRate: 125 },
  { id: 7, name: 'District 7 - Riverside', registeredVoters: 29000, baseVoteRate: 75 },
  { id: 8, name: 'District 8 - Hilltop', registeredVoters: 33000, baseVoteRate: 85 },
];

let CANDIDATES: Candidate[] = [
  { id: 'A', name: 'Candidate A', party: 'Blue Party', color: '#3b82f6' },
  { id: 'B', name: 'Candidate B', party: 'Red Party', color: '#ef4444' },
  { id: 'C', name: 'Candidate C', party: 'Green Party', color: '#10b981' },
];

/**
 * Set candidates dynamically
 */
export function setCandidates(candidates: Candidate[]): void {
  CANDIDATES = candidates;
}

/**
 * Get candidates list
 */
export function getCandidates(): Candidate[] {
  return CANDIDATES;
}

/**
 * Create empty candidate votes object based on current candidates
 */
function createEmptyCandidateVotes(): CandidateVotes {
  const votes: CandidateVotes = {};
  CANDIDATES.forEach(candidate => {
    votes[candidate.id] = 0;
  });
  return votes;
}

/**
 * Initialize district data with starting values
 */
export function initializeDistrictData(): District[] {
  return DISTRICTS.map(district => ({
    ...district,
    votes: 0,
    candidateVotes: createEmptyCandidateVotes(),
    voteVelocity: 0,
    lastUpdate: new Date(),
    status: 'active' as const,
  }));
}

/**
 * Generate random vote increment with natural variation
 */
function generateVoteIncrement(baseRate: number, variance: number = 0.3): number {
  const variation = 1 + (Math.random() - 0.5) * variance;
  return Math.max(1, Math.round(baseRate * variation));
}

/**
 * Inject anomaly into voting data (for testing detection)
 */
function injectAnomaly(district: District, anomalyType: AnomalyType): number | CandidateVotes {
  const firstCandidateId = CANDIDATES[0]?.id || 'A';
  
  switch (anomalyType) {
    case 'high-turnout':
      // Sudden spike in votes
      return generateVoteIncrement(district.baseVoteRate * 5);

    case 'suspicious-rate':
      // Extremely high vote rate
      return generateVoteIncrement(district.baseVoteRate * 8);

    case 'imbalanced': {
      // All votes go to one candidate
      const anomalyVotes: CandidateVotes = createEmptyCandidateVotes();
      anomalyVotes[firstCandidateId] = generateVoteIncrement(district.baseVoteRate * 3);
      return anomalyVotes;
    }

    default:
      return generateVoteIncrement(district.baseVoteRate);
  }
}

/**
 * Update district voting data with new votes
 */
export function updateDistrictVotes(districts: District[]): District[] {
  return districts.map(district => {
    try {
      // Anomaly injection based on configuration
      const hasAnomaly = Math.random() < config.anomalyDetection.injectionRate;
      let newVotes: number;

      if (hasAnomaly) {
        const anomalyTypes: AnomalyType[] = ['high-turnout', 'suspicious-rate'];
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const anomalyResult = injectAnomaly(district, anomalyType);
        newVotes = typeof anomalyResult === 'number' ? anomalyResult : 0;
      } else {
        newVotes = generateVoteIncrement(district.baseVoteRate);
      }

      // Distribute votes among candidates (with realistic proportions)
      const numCandidates = CANDIDATES.length;
      const candidateDistribution: Record<string, number> = {};
      
      // Generate random distribution that sums to 1
      let remaining = 1.0;
      CANDIDATES.forEach((candidate, index) => {
        if (index === numCandidates - 1) {
          // Last candidate gets remaining
          candidateDistribution[candidate.id] = remaining;
        } else {
          // Random portion of remaining
          const portion = Math.random() * remaining * 0.7; // Keep it realistic
          candidateDistribution[candidate.id] = portion;
          remaining -= portion;
        }
      });

      // Normalize distribution to ensure it sums to 1
      const total = Object.values(candidateDistribution).reduce((sum, val) => sum + val, 0);
      Object.keys(candidateDistribution).forEach(key => {
        candidateDistribution[key] /= total;
      });

      // Calculate new candidate votes
      const newCandidateVotes: CandidateVotes = {};
      CANDIDATES.forEach(candidate => {
        newCandidateVotes[candidate.id] = Math.round(newVotes * (candidateDistribution[candidate.id] || 0));
      });

      // Calculate vote velocity (votes per minute)
      const timeDiff = (new Date().getTime() - district.lastUpdate.getTime()) / 1000 / 60;
      const voteVelocity = timeDiff > 0 ? newVotes / timeDiff : 0;

      // Prevent votes from exceeding registered voters (with small buffer for realism)
      const totalVotes = district.votes + newVotes;
      const maxVotes = district.registeredVoters * 1.02; // Allow 2% over-registration

      if (totalVotes > maxVotes) {
        return district; // Don't add more votes if limit reached
      }

      // Update candidate votes
      const updatedCandidateVotes: CandidateVotes = { ...district.candidateVotes };
      CANDIDATES.forEach(candidate => {
        updatedCandidateVotes[candidate.id] = (updatedCandidateVotes[candidate.id] || 0) + (newCandidateVotes[candidate.id] || 0);
      });

      return {
        ...district,
        votes: totalVotes,
        candidateVotes: updatedCandidateVotes,
        voteVelocity,
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error(`Error updating district ${district.id}:`, error);
      return district;
    }
  });
}

/**
 * Generate vote history entry
 */
export function generateVoteHistoryEntry(
  districts: District[],
  timestamp: Date
): VoteHistoryEntry {
  const candidateTotals: CandidateVotes = createEmptyCandidateVotes();
  const districtVotes: { [districtId: number]: number } = {};

  districts.forEach(district => {
    CANDIDATES.forEach(candidate => {
      candidateTotals[candidate.id] = (candidateTotals[candidate.id] || 0) + (district.candidateVotes[candidate.id] || 0);
    });
    districtVotes[district.id] = district.votes;
  });

  const totalVotes = Object.values(candidateTotals).reduce((sum, val) => sum + val, 0);

  return {
    timestamp,
    candidateTotals,
    totalVotes,
    districts: districtVotes,
  };
}

/**
 * Generate activity log entry
 */
export function generateActivityLog(
  district: District,
  action: Activity['action'],
  details: string
): Activity {
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    districtName: district.name || 'Unknown District',
    action,
    details,
  };
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(districts: District[]): OverallStats {
  const totalVotes = districts.reduce((sum, d) => sum + d.votes, 0);
  const totalRegistered = districts.reduce((sum, d) => sum + d.registeredVoters, 0);
  const activeDistricts = districts.filter(d => d.status === 'active').length;
  const turnoutRate = totalRegistered > 0 ? (totalVotes / totalRegistered) * 100 : 0;

  return {
    totalVotes,
    totalRegistered,
    turnoutRate,
    activeDistricts,
  };
}
