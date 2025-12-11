import React, { useState, useEffect, useCallback, useMemo } from "react";
import DistrictCard from "./DistrictCard";
import AnomalyDetector from "./AnomalyDetector";
import LiveFeed from "./LiveFeed";
import CandidateManager from "./CandidateManager";
import {
  VoteTrendsChart,
  DistrictVotesChart,
  VoteShareChart,
  TurnoutChart,
} from "./VoteChart";
import {
  initializeDistrictData,
  updateDistrictVotes,
  generateVoteHistoryEntry,
  generateActivityLog,
  getCandidates,
  setCandidates,
  calculateOverallStats,
} from "../utils/dataGenerator";
import {
  analyzeAllAnomalies,
  calculateAnomalyScore,
} from "../utils/anomalyDetection";
import {
  District,
  VoteHistoryEntry,
  Activity,
  Anomaly,
  OverallStats,
  UpdateInterval,
  Candidate,
} from "../types";
import config from "../config/config";

/**
 * Main Dashboard Component
 * Orchestrates real-time voting data display and anomaly detection
 * Optimized with useCallback and useMemo for performance
 */
const Dashboard: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [voteHistory, setVoteHistory] = useState<VoteHistoryEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [updateInterval, setUpdateInterval] = useState<UpdateInterval>(
    config.updateIntervals.normal as UpdateInterval
  );
  const [candidates, setCandidatesState] = useState<Candidate[]>(
    getCandidates()
  );
  const [showCandidateManager, setShowCandidateManager] =
    useState<boolean>(false);

  // Initialize data on component mount
  useEffect(() => {
    try {
      const initialDistricts = initializeDistrictData();
      setDistricts(initialDistricts);

      setActivities([
        {
          id: Date.now(),
          timestamp: new Date(),
          districtName: "System",
          action: "system",
          details: "Dashboard initialized. Monitoring 8 districts.",
        },
      ]);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    }
  }, []);

  // Calculate overall stats whenever districts change
  useEffect(() => {
    if (districts.length > 0) {
      try {
        const stats = calculateOverallStats(districts);
        setOverallStats(stats);
      } catch (error) {
        console.error("Error calculating overall stats:", error);
      }
    }
  }, [districts]);

  // Real-time update loop with error handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setDistricts((prevDistricts) => {
          try {
            // Update district votes
            const updatedDistricts = updateDistrictVotes(prevDistricts);

            // Generate vote history entry
            const historyEntry = generateVoteHistoryEntry(
              updatedDistricts,
              new Date()
            );
            setVoteHistory((prev) =>
              [...prev, historyEntry].slice(
                -config.dataRetention.maxHistoryEntries
              )
            );

            // Detect anomalies
            const detectedAnomalies = analyzeAllAnomalies(
              updatedDistricts,
              voteHistory
            );

            // Check for new anomalies
            detectedAnomalies.forEach((anomaly) => {
              const existingAnomaly = anomalies.find(
                (a) =>
                  a.districtId === anomaly.districtId &&
                  a.type === anomaly.type &&
                  Math.abs(new Date(a.timestamp || 0).getTime() - Date.now()) <
                    30000
              );

              if (!existingAnomaly) {
                const activity = generateActivityLog(
                  updatedDistricts.find((d) => d.id === anomaly.districtId) ||
                    updatedDistricts[0],
                  "anomaly-detected",
                  anomaly.message
                );
                setActivities((prev) =>
                  [activity, ...prev].slice(
                    0,
                    config.dataRetention.maxActivities
                  )
                );
              }
            });

            setAnomalies(detectedAnomalies);

            // Generate random activity updates
            if (Math.random() < 0.3) {
              const randomDistrict =
                updatedDistricts[
                  Math.floor(Math.random() * updatedDistricts.length)
                ];
              const activity = generateActivityLog(
                randomDistrict,
                "vote-update",
                `${randomDistrict.votes.toLocaleString()} total votes recorded`
              );
              setActivities((prev) =>
                [activity, ...prev].slice(0, config.dataRetention.maxActivities)
              );
            }

            return updatedDistricts;
          } catch (error) {
            console.error("Error updating districts:", error);
            return prevDistricts;
          }
        });
      }, updateInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, updateInterval, voteHistory, anomalies]);

  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev);

    if (!isRunning) {
      const activity: Activity = {
        id: Date.now(),
        timestamp: new Date(),
        districtName: "System",
        action: "system",
        details: "Real-time simulation started",
      };
      setActivities((prev) => [activity, ...prev]);
    }
  }, [isRunning]);

  const resetData = useCallback(() => {
    try {
      const initialDistricts = initializeDistrictData();
      setDistricts(initialDistricts);
      setVoteHistory([]);
      setActivities([
        {
          id: Date.now(),
          timestamp: new Date(),
          districtName: "System",
          action: "system",
          details: "Dashboard reset. All data cleared.",
        },
      ]);
      setAnomalies([]);
      setIsRunning(false);
    } catch (error) {
      console.error("Error resetting dashboard:", error);
    }
  }, []);

  // Candidate CRUD handlers
  const handleAddCandidate = useCallback(
    (candidateData: Omit<Candidate, "id">) => {
      const newId = `C${Date.now()}`;
      const newCandidate: Candidate = { ...candidateData, id: newId };

      const updatedCandidates = [...candidates, newCandidate];
      setCandidatesState(updatedCandidates);
      setCandidates(updatedCandidates);

      // Update all districts to include the new candidate with 0 votes
      setDistricts((prev) =>
        prev.map((district) => ({
          ...district,
          candidateVotes: {
            ...district.candidateVotes,
            [newId]: 0,
          },
        }))
      );

      setActivities((prev) => [
        {
          id: Date.now(),
          timestamp: new Date(),
          districtName: "System",
          action: "system",
          details: `Candidate "${candidateData.name}" added to the race.`,
        },
        ...prev,
      ]);
    },
    [candidates]
  );

  const handleUpdateCandidate = useCallback(
    (id: string, candidateData: Omit<Candidate, "id">) => {
      const updatedCandidates = candidates.map((c) =>
        c.id === id ? { ...c, ...candidateData } : c
      );
      setCandidatesState(updatedCandidates);
      setCandidates(updatedCandidates);

      setActivities((prev) => [
        {
          id: Date.now(),
          timestamp: new Date(),
          districtName: "System",
          action: "system",
          details: `Candidate "${candidateData.name}" information updated.`,
        },
        ...prev,
      ]);
    },
    [candidates]
  );

  const handleDeleteCandidate = useCallback(
    (id: string) => {
      const candidate = candidates.find((c) => c.id === id);
      const updatedCandidates = candidates.filter((c) => c.id !== id);
      setCandidatesState(updatedCandidates);
      setCandidates(updatedCandidates);

      // Remove candidate votes from all districts
      setDistricts((prev) =>
        prev.map((district) => {
          const { [id]: removed, ...remainingVotes } = district.candidateVotes;
          return {
            ...district,
            candidateVotes: remainingVotes,
            votes: district.votes - (removed || 0), // Subtract the deleted candidate's votes
          };
        })
      );

      setActivities((prev) => [
        {
          id: Date.now(),
          timestamp: new Date(),
          districtName: "System",
          action: "system",
          details: `Candidate "${
            candidate?.name || "Unknown"
          }" removed from the race.`,
        },
        ...prev,
      ]);
    },
    [candidates]
  );

  const handleIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setUpdateInterval(Number(e.target.value) as UpdateInterval);
    },
    []
  );

  // Calculate district anomaly scores (memoized)
  const districtAnomalyScores = useMemo(() => {
    const scores: { [key: number]: number } = {};
    districts.forEach((district) => {
      const districtAnomalies = anomalies.filter(
        (a) => a.districtId === district.id
      );
      scores[district.id] = calculateAnomalyScore(districtAnomalies);
    });
    return scores;
  }, [districts, anomalies]);

  return (
    <div className="dashboard" role="main">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>🗳️ Real-Time Voting Transparency Dashboard</h1>
            <p className="subtitle">
              Live monitoring with AI-powered anomaly detection
            </p>
          </div>
          <div className="header-controls">
            <button
              className="btn btn-info"
              onClick={() => setShowCandidateManager(!showCandidateManager)}
              aria-label="Manage candidates"
            >
              👥 Manage Candidates
            </button>
            <button
              className={`btn ${isRunning ? "btn-danger" : "btn-primary"}`}
              onClick={toggleSimulation}
              aria-label={isRunning ? "Pause simulation" : "Start simulation"}
              aria-pressed={isRunning}
            >
              {isRunning ? "⏸️ Pause" : "▶️ Start"} Simulation
            </button>
            <button
              className="btn btn-secondary"
              onClick={resetData}
              aria-label="Reset dashboard"
            >
              🔄 Reset
            </button>
            <select
              className="update-speed"
              value={updateInterval}
              onChange={handleIntervalChange}
              disabled={isRunning}
              aria-label="Update speed"
            >
              <option value={config.updateIntervals.fast}>Fast (1s)</option>
              <option value={config.updateIntervals.normal}>Normal (2s)</option>
              <option value={config.updateIntervals.slow}>Slow (5s)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Candidate Manager */}
      {showCandidateManager && (
        <div className="candidate-manager-section">
          <CandidateManager
            candidates={candidates}
            onAddCandidate={handleAddCandidate}
            onUpdateCandidate={handleUpdateCandidate}
            onDeleteCandidate={handleDeleteCandidate}
          />
        </div>
      )}

      {/* Overall Statistics */}
      {overallStats && (
        <div
          className="stats-overview"
          role="region"
          aria-label="Overall statistics"
        >
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              📊
            </div>
            <div className="stat-content">
              <h3>{overallStats.totalVotes.toLocaleString()}</h3>
              <p>Total Votes Cast</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              👥
            </div>
            <div className="stat-content">
              <h3>{overallStats.totalRegistered.toLocaleString()}</h3>
              <p>Registered Voters</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              📈
            </div>
            <div className="stat-content">
              <h3>{overallStats.turnoutRate.toFixed(1)}%</h3>
              <p>Overall Turnout</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              🟢
            </div>
            <div className="stat-content">
              <h3>
                {overallStats.activeDistricts}/{districts.length}
              </h3>
              <p>Active Districts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              🚨
            </div>
            <div className="stat-content">
              <h3>{anomalies.length}</h3>
              <p>Anomalies Detected</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <VoteTrendsChart
              voteHistory={voteHistory}
              candidates={candidates}
            />
          </div>
          <div className="chart-container">
            <DistrictVotesChart districts={districts} candidates={candidates} />
          </div>
          <div className="chart-container">
            <VoteShareChart
              candidateTotals={
                voteHistory.length > 0
                  ? voteHistory[voteHistory.length - 1].candidateTotals
                  : { A: 0, B: 0, C: 0, D: 0 }
              }
              candidates={candidates}
            />
          </div>
          <div className="chart-container">
            <TurnoutChart districts={districts} />
          </div>
        </div>

        {/* Anomaly Detection Section */}
        <div className="anomaly-section">
          <AnomalyDetector anomalies={anomalies} />
        </div>

        {/* Districts Grid */}
        <div className="districts-section">
          <h2>📍 District Overview</h2>
          <div className="districts-grid">
            {districts.map((district) => (
              <DistrictCard
                key={district.id}
                district={district}
                anomalyScore={districtAnomalyScores[district.id] || 0}
                candidates={candidates}
              />
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="feed-section">
          <LiveFeed activities={activities} />
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer" role="contentinfo">
        <p>
          🛡️ Powered by advanced anomaly detection algorithms | Real-time
          monitoring using React & Chart.js | Last update:{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
