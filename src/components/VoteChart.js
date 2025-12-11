import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Real-time voting trends line chart
 */
export const VoteTrendsChart = ({ voteHistory, candidates }) => {
    if (!voteHistory || voteHistory.length === 0) {
        return <div className="chart-placeholder">Waiting for data...</div>;
    }

    const data = {
        labels: voteHistory.map((entry, index) => {
            const time = new Date(entry.timestamp);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: candidates.map(candidate => ({
            label: candidate.name,
            data: voteHistory.map(entry => entry.candidateTotals[candidate.id]),
            borderColor: candidate.color,
            backgroundColor: candidate.color + '20',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, weight: '500' }
                }
            },
            title: {
                display: true,
                text: 'Vote Trends Over Time',
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { maxTicksLimit: 10, font: { size: 10 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 } }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div style={{ height: '300px' }}>
            <Line data={data} options={options} />
        </div>
    );
};

/**
 * District-wise vote distribution bar chart
 */
export const DistrictVotesChart = ({ districts, candidates }) => {
    const data = {
        labels: districts.map(d => d.name.split(' - ')[1] || d.name),
        datasets: candidates.map(candidate => ({
            label: candidate.name,
            data: districts.map(d => d.candidateVotes[candidate.id]),
            backgroundColor: candidate.color,
            borderColor: candidate.color,
            borderWidth: 1
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, weight: '500' }
                }
            },
            title: {
                display: true,
                text: 'Votes by District',
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { size: 10 } }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 } }
            }
        }
    };

    return (
        <div style={{ height: '300px' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

/**
 * Overall vote share doughnut chart
 */
export const VoteShareChart = ({ candidateTotals, candidates }) => {
    const data = {
        labels: candidates.map(c => c.name),
        datasets: [{
            data: candidates.map(c => candidateTotals[c.id] || 0),
            backgroundColor: candidates.map(c => c.color),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 10
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, weight: '500' },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                        return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return {
                                text: `${label}: ${percentage}%`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            };
                        });
                    }
                }
            },
            title: {
                display: true,
                text: 'Overall Vote Share',
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div style={{ height: '300px' }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

/**
 * Turnout rate comparison chart
 */
export const TurnoutChart = ({ districts }) => {
    const sortedDistricts = [...districts].sort((a, b) => {
        const rateA = (a.votes / a.registeredVoters) * 100;
        const rateB = (b.votes / b.registeredVoters) * 100;
        return rateB - rateA;
    });

    const data = {
        labels: sortedDistricts.map(d => d.name.split(' - ')[1] || d.name),
        datasets: [{
            label: 'Turnout Rate (%)',
            data: sortedDistricts.map(d => ((d.votes / d.registeredVoters) * 100).toFixed(1)),
            backgroundColor: sortedDistricts.map(d => {
                const rate = (d.votes / d.registeredVoters) * 100;
                if (rate > 90) return '#ef4444'; // High turnout - potential anomaly
                if (rate > 70) return '#10b981'; // Good turnout
                if (rate > 50) return '#f59e0b'; // Moderate turnout
                return '#6b7280'; // Low turnout
            }),
            borderColor: sortedDistricts.map(d => {
                const rate = (d.votes / d.registeredVoters) * 100;
                if (rate > 90) return '#dc2626';
                if (rate > 70) return '#059669';
                if (rate > 50) return '#d97706';
                return '#4b5563';
            }),
            borderWidth: 2
        }]
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Turnout Rate by District',
                font: { size: 16, weight: '600' },
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        return `Turnout: ${context.parsed.x}%`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    },
                    font: { size: 11 }
                }
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            }
        }
    };

    return (
        <div style={{ height: '350px' }}>
            <Bar data={data} options={options} />
        </div>
    );
};
