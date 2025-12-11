/**
 * TypeScript Type Definitions
 * Centralized type definitions for the entire application
 */

export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
}

export type CandidateVotes = Record<string, number>;

export interface District {
  id: number;
  name: string;
  registeredVoters: number;
  baseVoteRate: number;
  votes: number;
  candidateVotes: CandidateVotes;
  voteVelocity: number;
  lastUpdate: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface DynamicCandidatesContext {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

export interface VoteHistoryEntry {
  timestamp: Date;
  candidateTotals: CandidateVotes;
  totalVotes: number;
  districts: {
    [districtId: number]: number;
  };
}

export interface Activity {
  id: number;
  timestamp: Date;
  districtName: string;
  action: 'vote-update' | 'anomaly-detected' | 'system';
  details: string;
}

export interface Anomaly {
  districtId: number;
  districtName?: string;
  type: 'z-score' | 'moving-average' | 'turnout-rate' | 'vote-rate';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp?: Date;
  zScore?: number;
  turnoutRate?: number;
  voteRate?: number;
  expectedRate?: number;
  deviation?: number;
  movingAverage?: number;
}

export interface OverallStats {
  totalVotes: number;
  totalRegistered: number;
  turnoutRate: number;
  activeDistricts: number;
}

export type UpdateInterval = 1000 | 2000 | 5000;

export type AnomalyType = 'high-turnout' | 'suspicious-rate' | 'imbalanced';

export interface ChartDataPoint {
  value: number;
  label?: string;
  timestamp?: Date;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
