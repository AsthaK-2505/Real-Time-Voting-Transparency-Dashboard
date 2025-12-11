import React, { useState, useEffect } from 'react';
import DistrictCard from './DistrictCard';
import AnomalyDetector from './AnomalyDetector';
import LiveFeed from './LiveFeed';
import { VoteTrendsChart, DistrictVotesChart, VoteShareChart, TurnoutChart } from './VoteChart';
import {
    initializeDistrictData,
    updateDistrictVotes,
    generateVoteHistoryEntry,
    generateActivityLog,
    getCandidates,
    calculateOverallStats
} from '../utils/dataGenerator';
import {
    analyzeAllAnomalies,
    calculateAnomalyScore
} from '../utils/anomalyDetection';

/**
 * Main Dashboard Component
 * Orchestrates real-time voting data display and anomaly detection
 */
const Dashboard = () => {
    const [districts, setDistricts] = useState([]);
    const [voteHistory, setVoteHistory] = useState([]);
    const [activities, setActivities] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [overallStats, setOverallStats] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [updateInterval, setUpdateInterval] = useState(2000);
    const candidates = getCandidates();

    // Initialize data on component mount
    useEffect(() => {
        const initialDistricts = initializeDistrictData();
        setDistricts(initialDistricts);

        // Add welcome activity
        setActivities([{
            id: Date.now(),
            timestamp: new Date(),
            districtName: 'System',
            action: 'system',
            details: 'Dashboard initialized. Monitoring 8 districts.'
        }]);
    }, []);

    // Calculate overall stats whenever districts change
    useEffect(() => {
        if (districts.length > 0) {
            const stats = calculateOverallStats(districts);
            setOverallStats(stats);
        }
    }, [districts]);

    // Real-time update loop
    useEffect(() => {
        let intervalId;

        if (isRunning) {
            intervalId = setInterval(() => {
                setDistricts(prevDistricts => {
                    // Update district votes
                    const updatedDistricts = updateDistrictVotes(prevDistricts);

                    // Generate vote history entry
                    const historyEntry = generateVoteHistoryEntry(updatedDistricts, new Date());
                    setVoteHistory(prev => [...prev, historyEntry].slice(-50));

                    // Detect anomalies
                    const detectedAnomalies = analyzeAllAnomalies(updatedDistricts, voteHistory);

                    // Check for new anomalies
                    detectedAnomalies.forEach(anomaly => {
                        const existingAnomaly = anomalies.find(a =>
                            a.districtId === anomaly.districtId &&
                            a.type === anomaly.type &&
                            Math.abs(new Date(a.timestamp || 0) - Date.now()) < 30000
                        );

                        if (!existingAnomaly) {
                            // Add activity for new anomaly
                            const activity = generateActivityLog(
                                updatedDistricts.find(d => d.id === anomaly.districtId) || {},
                                'anomaly-detected',
                                anomaly.message
                            );
                            setActivities(prev => [activity, ...prev].slice(0, 100));
                        }
                    });

                    setAnomalies(detectedAnomalies);

                    // Generate random activity updates
                    if (Math.random() < 0.3) {
                        const randomDistrict = updatedDistricts[Math.floor(Math.random() * updatedDistricts.length)];
                        const activity = generateActivityLog(
                            randomDistrict,
                            'vote-update',
                            `${randomDistrict.votes.toLocaleString()} total votes recorded`
                        );
                        setActivities(prev => [activity, ...prev].slice(0, 100));
                    }

                    return updatedDistricts;
                });
            }, updateInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRunning, updateInterval, voteHistory, anomalies]);

    const toggleSimulation = () => {
        setIsRunning(!isRunning);

        if (!isRunning) {
            const activity = {
                id: Date.now(),
                timestamp: new Date(),
                districtName: 'System',
                action: 'system',
                details: 'Real-time simulation started'
            };
            setActivities(prev => [activity, ...prev]);
        }
    };

    const resetData = () => {
        const initialDistricts = initializeDistrictData();
        setDistricts(initialDistricts);
        setVoteHistory([]);
        setActivities([{
            id: Date.now(),
            timestamp: new Date(),
            districtName: 'System',
            action: 'system',
            details: 'Dashboard reset. All data cleared.'
        }]);
        setAnomalies([]);
        setIsRunning(false);
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>🗳️ Real-Time Voting Transparency Dashboard</h1>
                        <p className="subtitle">Live monitoring with anomaly detection</p>
                    </div>
                    <div className="header-controls">
                        <button
                            className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
                            onClick={toggleSimulation}
                        >
                            {isRunning ? '⏸️ Pause' : '▶️ Start'} Simulation
                        </button>
                        <button className="btn btn-secondary" onClick={resetData}>
                            🔄 Reset
                        </button>
                        <select
                            className="update-speed"
                            value={updateInterval}
                            onChange={(e) => setUpdateInterval(Number(e.target.value))}
                            disabled={isRunning}
                        >
                            <option value={1000}>Fast (1s)</option>
                            <option value={2000}>Normal (2s)</option>
                            <option value={5000}>Slow (5s)</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Overall Statistics */}
            {overallStats && (
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>{overallStats.totalVotes.toLocaleString()}</h3>
                            <p>Total Votes Cast</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>{overallStats.totalRegistered.toLocaleString()}</h3>
                            <p>Registered Voters</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{overallStats.turnoutRate.toFixed(1)}%</h3>
                            <p>Overall Turnout</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <h3>{overallStats.activeDistricts}/{districts.length}</h3>
                            <p>Active Districts</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🚨</div>
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
                        <VoteTrendsChart voteHistory={voteHistory} candidates={candidates} />
                    </div>
                    <div className="chart-container">
                        <DistrictVotesChart districts={districts} candidates={candidates} />
                    </div>
                    <div className="chart-container">
                        {overallStats && (
                            <VoteShareChart
                                candidateTotals={overallStats.candidateTotals}
                                candidates={candidates}
                            />
                        )}
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
                        {districts.map(district => {
                            const anomalyScore = calculateAnomalyScore(district, districts);
                            return (
                                <DistrictCard
                                    key={district.id}
                                    district={district}
                                    anomalyScore={anomalyScore}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Live Feed */}
                <div className="feed-section">
                    <LiveFeed activities={activities} />
                </div>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>
                    🛡️ Powered by advanced anomaly detection algorithms |
                    Real-time monitoring using React & Chart.js |
                    Last update: {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

export default Dashboard;
