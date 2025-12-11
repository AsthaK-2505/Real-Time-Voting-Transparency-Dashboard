import { initializeDistrictData, updateDistrictVotes, getCandidates, calculateOverallStats } from '../dataGenerator';

describe('Data Generator', () => {
  describe('initializeDistrictData', () => {
    it('should initialize 8 districts', () => {
      const districts = initializeDistrictData();
      expect(districts).toHaveLength(8);
    });

    it('should initialize districts with zero votes', () => {
      const districts = initializeDistrictData();
      districts.forEach(district => {
        expect(district.votes).toBe(0);
        expect(district.candidateVotes).toEqual({ A: 0, B: 0, C: 0 });
      });
    });

    it('should set all districts to active status', () => {
      const districts = initializeDistrictData();
      districts.forEach(district => {
        expect(district.status).toBe('active');
      });
    });
  });

  describe('getCandidates', () => {
    it('should return 3 default candidates', () => {
      const candidates = getCandidates();
      expect(candidates).toHaveLength(3);
    });

    it('should have candidates with required properties', () => {
      const candidates = getCandidates();
      candidates.forEach(candidate => {
        expect(candidate).toHaveProperty('id');
        expect(candidate).toHaveProperty('name');
        expect(candidate).toHaveProperty('party');
        expect(candidate).toHaveProperty('color');
      });
    });
  });

  describe('updateDistrictVotes', () => {
    it('should increase vote counts', () => {
      const districts = initializeDistrictData();
      const updated = updateDistrictVotes(districts);
      
      const totalVotesBefore = districts.reduce((sum, d) => sum + d.votes, 0);
      const totalVotesAfter = updated.reduce((sum, d) => sum + d.votes, 0);
      
      expect(totalVotesAfter).toBeGreaterThanOrEqual(totalVotesBefore);
    });

    it('should not exceed registered voters limit', () => {
      const districts = initializeDistrictData();
      // Simulate many updates
      let updated = districts;
      for (let i = 0; i < 100; i++) {
        updated = updateDistrictVotes(updated);
      }

      updated.forEach(district => {
        expect(district.votes).toBeLessThanOrEqual(district.registeredVoters * 1.02);
      });
    });
  });

  describe('calculateOverallStats', () => {
    it('should calculate correct total votes', () => {
      const districts = initializeDistrictData();
      districts[0].votes = 100;
      districts[1].votes = 200;

      const stats = calculateOverallStats(districts);
      expect(stats.totalVotes).toBeGreaterThanOrEqual(300);
    });

    it('should calculate correct turnout rate', () => {
      const districts = initializeDistrictData();
      const totalRegistered = districts.reduce((sum, d) => sum + d.registeredVoters, 0);
      districts.forEach(d => {
        d.votes = d.registeredVoters * 0.5; // 50% turnout
      });

      const stats = calculateOverallStats(districts);
      expect(stats.turnoutRate).toBeCloseTo(50, 1);
    });

    it('should count active districts correctly', () => {
      const districts = initializeDistrictData();
      const stats = calculateOverallStats(districts);
      expect(stats.activeDistricts).toBe(8);
    });
  });
});
