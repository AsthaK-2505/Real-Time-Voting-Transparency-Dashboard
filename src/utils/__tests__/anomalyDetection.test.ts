import { calculateZScore, detectZScoreAnomalies, calculateMovingAverage, detectTurnoutAnomalies } from '../anomalyDetection';
import { District, ChartDataPoint } from '../../types';

describe('Anomaly Detection', () => {
  describe('calculateZScore', () => {
    it('should calculate z-score correctly', () => {
      const data = [10, 12, 23, 23, 16, 23, 21, 16];
      const zScore = calculateZScore(30, data);
      expect(zScore).toBeGreaterThan(1);
    });

    it('should return 0 for empty data', () => {
      const zScore = calculateZScore(10, []);
      expect(zScore).toBe(0);
    });

    it('should return 0 when standard deviation is 0', () => {
      const data = [5, 5, 5, 5];
      const zScore = calculateZScore(5, data);
      expect(zScore).toBe(0);
    });
  });

  describe('calculateMovingAverage', () => {
    it('should calculate moving average correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const movingAvg = calculateMovingAverage(data, 3);
      expect(movingAvg[0]).toBeNull();
      expect(movingAvg[1]).toBeNull();
      expect(movingAvg[2]).toBe(2);
      expect(movingAvg[3]).toBe(3);
      expect(movingAvg[4]).toBe(4);
    });

    it('should handle empty array', () => {
      const movingAvg = calculateMovingAverage([], 3);
      expect(movingAvg).toEqual([]);
    });
  });

  describe('detectZScoreAnomalies', () => {
    it('should detect anomalies with high z-scores', () => {
      const data: ChartDataPoint[] = [
        { value: 10 },
        { value: 12 },
        { value: 11 },
        { value: 100 }, // Anomaly
      ];
      const anomalies = detectZScoreAnomalies(data, 2);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].severity).toBeDefined();
    });
  });

  describe('detectTurnoutAnomalies', () => {
    it('should detect impossible turnout rates', () => {
      const districts: District[] = [
        {
          id: 1,
          name: 'District 1',
          registeredVoters: 1000,
          baseVoteRate: 100,
          votes: 1100, // 110% turnout
          candidateVotes: { A: 550, B: 300, C: 150, D: 100 },
          voteVelocity: 10,
          lastUpdate: new Date(),
          status: 'active',
        },
      ];

      const anomalies = detectTurnoutAnomalies(districts);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].severity).toBe('high');
    });

    it('should not detect anomalies for normal turnout', () => {
      const districts: District[] = [
        {
          id: 1,
          name: 'District 1',
          registeredVoters: 1000,
          baseVoteRate: 100,
          votes: 700,
          candidateVotes: { A: 350, B: 200, C: 100, D: 50 },
          voteVelocity: 10,
          lastUpdate: new Date(),
          status: 'active',
        },
        {
          id: 2,
          name: 'District 2',
          registeredVoters: 1000,
          baseVoteRate: 100,
          votes: 650,
          candidateVotes: { A: 325, B: 180, C: 95, D: 50 },
          voteVelocity: 10,
          lastUpdate: new Date(),
          status: 'active',
        },
      ];

      const anomalies = detectTurnoutAnomalies(districts);
      expect(anomalies.length).toBe(0);
    });
  });
});
