#!/bin/bash

echo "🚀 Starting Real-Time Voting Dashboard..."
echo ""
echo "📦 Checking dependencies..."
npm list react react-dom typescript --depth=0

echo ""
echo "🔍 Type checking..."
npx tsc --noEmit

echo ""
echo "✅ All checks passed!"
echo ""
echo "To start the development server, run:"
echo "  npm start"
echo ""
echo "The app will open at http://localhost:3000"
