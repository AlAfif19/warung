#!/bin/bash

# Warung HPP Calculator - Stop Script
# This script stops both frontend and backend services

echo "🛑 Stopping Warung HPP Calculator..."
echo ""

# PID file to track running processes
PID_FILE=".pids"

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  No running services found (PID file not found)."
    echo "   Services might not be running or were stopped manually."
    exit 0
fi

# Read PIDs from file
PIDS=$(cat "$PID_FILE")

# Stop Backend
echo "📦 Stopping Backend..."
BACKEND_PID=$(echo "$PIDS" | head -n 1)
if [ -n "$BACKEND_PID" ] && ps -p "$BACKEND_PID" > /dev/null 2>&1; then
    kill "$BACKEND_PID"
    echo "✅ Backend stopped (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend process not found (PID: $BACKEND_PID)"
fi

# Stop Frontend
echo ""
echo "🎨 Stopping Frontend..."
FRONTEND_PID=$(echo "$PIDS" | tail -n 1)
if [ -n "$FRONTEND_PID" ] && ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
    kill "$FRONTEND_PID"
    echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
else
    echo "⚠️  Frontend process not found (PID: $FRONTEND_PID)"
fi

# Remove PID file
rm "$PID_FILE"

echo ""
echo "========================================="
echo "✅ All services stopped!"
echo "========================================="
echo ""
echo "📝 Log files preserved:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🚀 To start services again, run: ./start.sh"
echo ""
