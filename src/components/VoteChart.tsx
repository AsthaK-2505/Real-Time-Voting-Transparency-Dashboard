import React, { memo } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  Filler,
  ChartOptions,
} from "chart.js";
import {
  District,
  Candidate,
  VoteHistoryEntry,
  CandidateVotes,
} from "../types";

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

interface VoteTrendsChartProps {
  voteHistory: VoteHistoryEntry[];
  candidates: Candidate[];
}

interface DistrictVotesChartProps {
  districts: District[];
  candidates: Candidate[];
}

interface VoteShareChartProps {
  candidateTotals: CandidateVotes;
  candidates: Candidate[];
}

interface TurnoutChartProps {
  districts: District[];
}

/**
 * Real-time voting trends line chart
 */
export const VoteTrendsChart: React.FC<VoteTrendsChartProps> = memo(
  ({ voteHistory, candidates }) => {
    if (!voteHistory || voteHistory.length === 0) {
      return <div className="chart-placeholder">Waiting for data...</div>;
    }

    const data = {
      labels: voteHistory.map((entry) => {
        const time = new Date(entry.timestamp);
        return time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: candidates.map((candidate) => ({
        label: candidate.name,
        data: voteHistory.map(
          (entry) => entry.candidateTotals[candidate.id as keyof CandidateVotes]
        ),
        borderColor: candidate.color,
        backgroundColor: candidate.color + "20",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      })),
    };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11, weight: "bold" as const },
          },
        },
        title: {
          display: true,
          text: "Vote Trends Over Time",
          font: { size: 16, weight: "bold" as const },
          padding: { bottom: 20 },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 10, font: { size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: { font: { size: 11 } },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    };

    return (
      <div
        style={{ height: "300px" }}
        role="img"
        aria-label="Vote trends over time chart"
      >
        <Line data={data} options={options} />
      </div>
    );
  }
);

VoteTrendsChart.displayName = "VoteTrendsChart";

/**
 * District-wise vote distribution bar chart
 */
export const DistrictVotesChart: React.FC<DistrictVotesChartProps> = memo(
  ({ districts, candidates }) => {
    const data = {
      labels: districts.map((d) => d.name.split(" - ")[1] || d.name),
      datasets: candidates.map((candidate) => ({
        label: candidate.name,
        data: districts.map(
          (d) => d.candidateVotes[candidate.id as keyof CandidateVotes]
        ),
        backgroundColor: candidate.color,
        borderColor: candidate.color,
        borderWidth: 1,
      })),
    };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11, weight: "bold" as const },
          },
        },
        title: {
          display: true,
          text: "Votes by District",
          font: { size: 16, weight: "bold" as const },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: { font: { size: 11 } },
        },
      },
    };

    return (
      <div
        style={{ height: "300px" }}
        role="img"
        aria-label="Votes by district chart"
      >
        <Bar data={data} options={options} />
      </div>
    );
  }
);

DistrictVotesChart.displayName = "DistrictVotesChart";

/**
 * Overall vote share doughnut chart
 */
export const VoteShareChart: React.FC<VoteShareChartProps> = memo(
  ({ candidateTotals, candidates }) => {
    const data = {
      labels: candidates.map((c) => c.name),
      datasets: [
        {
          data: candidates.map(
            (c) => candidateTotals[c.id as keyof CandidateVotes] || 0
          ),
          backgroundColor: candidates.map((c) => c.color),
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 10,
        },
      ],
    };

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11, weight: "bold" as const },
            generateLabels: (chart) => {
              const chartData = chart.data;
              const total = (chartData.datasets[0].data as number[]).reduce(
                (sum, val) => sum + val,
                0
              );
              return (chartData.labels as string[]).map((label, i) => {
                const value = (chartData.datasets[0].data as number[])[i];
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: (
                    chartData.datasets[0].backgroundColor as string[]
                  )[i],
                  hidden: false,
                  index: i,
                };
              });
            },
          },
        },
        title: {
          display: true,
          text: "Overall Vote Share",
          font: { size: 16, weight: "bold" as const },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const dataset = context.dataset.data as number[];
              const total = dataset.reduce((sum, val) => sum + val, 0);
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    };

    return (
      <div
        style={{ height: "300px" }}
        role="img"
        aria-label="Overall vote share chart"
      >
        <Doughnut data={data} options={options} />
      </div>
    );
  }
);

VoteShareChart.displayName = "VoteShareChart";

/**
 * Turnout rate comparison chart
 */
export const TurnoutChart: React.FC<TurnoutChartProps> = memo(
  ({ districts }) => {
    const sortedDistricts = [...districts].sort((a, b) => {
      const rateA = (a.votes / a.registeredVoters) * 100;
      const rateB = (b.votes / b.registeredVoters) * 100;
      return rateB - rateA;
    });

    const data = {
      labels: sortedDistricts.map((d) => d.name.split(" - ")[1] || d.name),
      datasets: [
        {
          label: "Turnout Rate (%)",
          data: sortedDistricts.map((d) =>
            Number(((d.votes / d.registeredVoters) * 100).toFixed(1))
          ),
          backgroundColor: sortedDistricts.map((d) => {
            const rate = (d.votes / d.registeredVoters) * 100;
            if (rate > 90) return "#ef4444";
            if (rate > 70) return "#10b981";
            if (rate > 50) return "#f59e0b";
            return "#6b7280";
          }),
          borderColor: sortedDistricts.map((d) => {
            const rate = (d.votes / d.registeredVoters) * 100;
            if (rate > 90) return "#dc2626";
            if (rate > 70) return "#059669";
            if (rate > 50) return "#d97706";
            return "#4b5563";
          }),
          borderWidth: 2,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Turnout Rate by District",
          font: { size: 16, weight: "bold" as const },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `Turnout: ${context.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: {
            callback: (value) => value + "%",
            font: { size: 11 },
          },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
      },
    };

    return (
      <div
        style={{ height: "350px" }}
        role="img"
        aria-label="Turnout rate by district chart"
      >
        <Bar data={data} options={options} />
      </div>
    );
  }
);

TurnoutChart.displayName = "TurnoutChart";
