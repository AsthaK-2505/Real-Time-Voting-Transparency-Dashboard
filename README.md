# Real-Time Voting Transparency Dashboard v2.0 🗳️

A comprehensive, **production-ready** real-time voting transparency dashboard with advanced anomaly detection, built with **React**, **TypeScript**, and **Chart.js**.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

## ✨ What's New in v2.0

- 🎯 **Full TypeScript conversion** with strict type checking
- 🧪 **Comprehensive testing** with Jest & React Testing Library (70% coverage)
- 🎨 **Modern UI redesign** with glassmorphism, animations, and dark mode
- ♿ **Full accessibility** support (WCAG 2.1 compliant)
- ⚡ **Performance optimizations** with React.memo, useMemo, useCallback
- 🛡️ **Error boundaries** for graceful error handling
- 🔧 **Environment configuration** via .env files
- 📱 **Enhanced responsive design** for all devices

## Features

### Core Functionality

- **Real-time Vote Tracking**: Live updates of voting data across 8 districts
- **Interactive Charts**: Beautiful data visualizations powered by Chart.js 4
- **AI-Powered Anomaly Detection**: Statistical analysis using z-scores, moving averages, and turnout analysis
- **Live Activity Feed**: Real-time activity log with anomaly alerts
- **District Comparison**: Side-by-side comparison of voting metrics

### Technical Highlights

- ✅ **TypeScript**: Full type safety across the entire codebase
- ✅ **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- ✅ **Performance Optimized**: Memoization and optimized re-renders
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive Design**: Mobile-first approach with adaptive layouts
- ✅ **Dark Mode**: Automatic dark mode based on system preferences
- ✅ **Modern UI**: Glassmorphism effects, smooth animations, gradients
- ✅ **Testing**: Unit tests for utilities and components
- ✅ **Configuration**: Flexible configuration via environment variables

## Technologies

### Frontend

- **React 18.2** with Hooks (useState, useEffect, useCallback, useMemo)
- **TypeScript 5.3** for type safety
- **Chart.js 4.4** + react-chartjs-2 for visualizations

### Build & Testing

- **Webpack 5** with custom configuration
- **Babel 7** with TypeScript support
- **Jest 29** + React Testing Library
- **ts-jest** for TypeScript testing
- **ESLint** with TypeScript rules

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd Real-Time-Voting-Transparency-Dashboard
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment** (optional)

```bash
cp .env.example .env
# Edit .env to customize settings
```

4. **Start development server**

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check
```

## 🏗️ Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Anomaly Detection

The dashboard implements multiple statistical methods:

1. **Z-Score Analysis**

   - Identifies data points >2.5 standard deviations from mean
   - High severity for |z| > 3

2. **Moving Average Detection**

   - 5-period moving average
   - Detects sudden pattern changes

3. **Turnout Rate Analysis**

   - Flags turnout >100% as critical
   - Identifies statistical outliers (>3σ)

4. **Vote Rate Monitoring**
   - Detects suspiciously fast vote accumulation
   - Compares against district averages

## Project Structure

```
src/
├── components/           # React components (TypeScript)
│   ├── Dashboard.tsx     # Main dashboard container
│   ├── VoteChart.tsx     # Chart.js visualizations
│   ├── AnomalyDetector.tsx  # Anomaly detection display
│   ├── LiveFeed.tsx      # Real-time activity feed
│   ├── DistrictCard.tsx  # Individual district stats
│   ├── ErrorBoundary.tsx # Error handling component
│   └── __tests__/        # Component tests
├── utils/                # Utility functions (TypeScript)
│   ├── anomalyDetection.ts  # Anomaly detection algorithms
│   ├── dataGenerator.ts     # Mock data generator
│   └── __tests__/        # Utility tests
├── types/                # TypeScript definitions
│   └── index.ts
├── config/               # Configuration
│   └── config.ts
├── styles/               # CSS styles
│   └── App.css          # Modern UI with dark mode
├── App.tsx               # Root component
├── index.tsx             # Entry point
└── setupTests.ts         # Test configuration
```

## 🎨 UI/UX Features

- **Glassmorphism**: Modern frosted glass effects
- **Animations**: Smooth fade-in, slide-in, hover effects
- **Gradients**: Beautiful color schemes
- **Dark Mode**: Auto-adapts to system preferences
- **Responsive**: Optimized for desktop, tablet, mobile
- **Custom Scrollbars**: Styled for better aesthetics

## ⚙️ Configuration

Edit `.env` to customize:

```env
REACT_APP_UPDATE_INTERVAL_FAST=1000
REACT_APP_UPDATE_INTERVAL_NORMAL=2000
REACT_APP_UPDATE_INTERVAL_SLOW=5000
REACT_APP_ANOMALY_INJECTION_RATE=0.05
REACT_APP_ZSCORE_THRESHOLD=2.5
REACT_APP_MAX_HISTORY_ENTRIES=50
REACT_APP_MAX_ACTIVITIES=100
```

## 📊 Performance

- Component memoization with React.memo
- Hook optimization (useCallback, useMemo)
- Configurable data retention limits
- Lazy rendering for charts
- Debounced updates

## ♿ Accessibility

- ARIA labels on all interactive elements
- Full keyboard navigation support
- Screen reader compatible
- WCAG 2.1 AA color contrast
- Clear focus indicators

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
