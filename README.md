# Real-Time Voting Transparency Dashboard

A comprehensive real-time dashboard for monitoring voting patterns with built-in anomaly detection capabilities.

## Features

- **Real-time Vote Tracking**: Live updates of voting data across multiple districts
- **Interactive Charts**: Powered by Chart.js for beautiful data visualization
- **Anomaly Detection**: Statistical analysis using z-scores and moving averages to detect irregular patterns
- **Live Feed**: Real-time activity log with anomaly alerts
- **District Comparison**: Side-by-side comparison of voting metrics

## Technologies

- React 18
- Chart.js 4
- JavaScript (ES6+)
- Webpack 5
- Custom anomaly detection algorithms

## Installation

```bash
npm install
```

## Running the Application

Development mode with hot reload:
```bash
npm start
```

Build for production:
```bash
npm run build
```

The application will open at `http://localhost:3000`

## Anomaly Detection

The dashboard implements multiple anomaly detection methods:

1. **Z-Score Analysis**: Identifies data points that deviate significantly from the mean
2. **Moving Average**: Detects sudden changes in voting patterns
3. **Turnout Rate Analysis**: Flags unusually high or low participation rates
4. **Vote Rate Monitoring**: Identifies suspiciously fast or slow vote accumulation

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard container
│   ├── VoteChart.js     # Chart.js visualizations
│   ├── AnomalyDetector.js  # Anomaly detection display
│   ├── LiveFeed.js      # Real-time activity feed
│   └── DistrictCard.js  # Individual district stats
├── utils/              # Utility functions
│   ├── anomalyDetection.js  # Anomaly detection algorithms
│   └── dataGenerator.js     # Mock data generator
├── styles/             # CSS styles
│   └── App.css
├── App.js              # Root component
└── index.js            # Entry point
```

## License

MIT
