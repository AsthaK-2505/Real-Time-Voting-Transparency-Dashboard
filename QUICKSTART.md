# Quick Start Guide

## 🚀 Get Up and Running in 3 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

This will install all required dependencies including TypeScript, React, Chart.js, testing libraries, and build tools.

### Step 2: Start Development Server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

### Step 3: Explore the Dashboard

Once running, you can:

1. **Click "▶️ Start Simulation"** to begin real-time vote updates
2. **Watch the charts** update in real-time
3. **Monitor anomaly detection** in the right panel
4. **View district statistics** in the cards below
5. **Check the live feed** for activity updates
6. **Adjust update speed** (Fast/Normal/Slow)
7. **Click "🔄 Reset"** to clear all data

---

## 🎮 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with hot reload |
| `npm test` | Run all tests |
| `npm test -- --coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Build for production |
| `npm run type-check` | Type check without building |

---

## ⚙️ Configuration (Optional)

Edit `.env` to customize settings:

```env
# Update intervals (in milliseconds)
REACT_APP_UPDATE_INTERVAL_FAST=1000
REACT_APP_UPDATE_INTERVAL_NORMAL=2000
REACT_APP_UPDATE_INTERVAL_SLOW=5000

# Anomaly detection sensitivity
REACT_APP_ANOMALY_INJECTION_RATE=0.05
REACT_APP_ZSCORE_THRESHOLD=2.5

# Data retention limits
REACT_APP_MAX_HISTORY_ENTRIES=50
REACT_APP_MAX_ACTIVITIES=100
```

---

## 🧪 Testing

Run tests to verify everything works:

```bash
npm test
```

Expected output: All tests should pass ✓

---

## 🎨 Features to Try

### Dark Mode
Your system's dark mode preference will automatically apply!

### Anomaly Detection
Watch for 🚨 alerts when unusual voting patterns are detected:
- High turnout rates (>100%)
- Suspicious vote rates
- Statistical outliers

### Charts
- **Vote Trends**: Line chart showing votes over time
- **District Votes**: Stacked bar chart by district
- **Vote Share**: Doughnut chart of candidate distribution
- **Turnout Rate**: Horizontal bar chart sorted by turnout

### Accessibility
Try navigating with keyboard only:
- `Tab` to move between controls
- `Enter` to activate buttons
- `Space` to toggle selections

---

## 📱 Responsive Design

The dashboard works on:
- 🖥️ Desktop (1400px+)
- 💻 Laptop (1024px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
npm start
```

### TypeScript Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build directory
rm -rf dist
npm run build
```

---

## 📖 Learn More

- Check [README.md](README.md) for full documentation
- Read [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md) for details on improvements
- View code in `src/` directory

---

## 🎯 Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm start`
3. ✅ Click "Start Simulation"
4. ✅ Explore the features
5. 🚀 Start building!

---

**Enjoy your upgraded dashboard!** 🎉

Need help? Check the README or review the code comments.
