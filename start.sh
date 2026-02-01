#!/bin/bash

# Warung HPP Calculator - Start Script
# This script starts both frontend and backend services

echo "🚀 Starting Warung HPP Calculator..."
echo ""

# PID file to track running processes
PID_FILE=".pids"

# Check if already running
if [ -f "$PID_FILE" ]; then
    echo "⚠️  Services might already be running. Use './stop.sh' first to stop them."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Backend
echo "📦 Starting Backend (FastAPI)..."
cd backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Please run './setup.sh' first."
    exit 1
fi

# Start backend in background and save PID
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > ../"$PID_FILE"

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: backend.log"

cd ..

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo ""
echo "🎨 Starting Frontend (Next.js)..."
cd frontend

# Start frontend in background and save PID
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> ../"$PID_FILE"

echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: frontend.log"

cd ..

echo ""
echo "========================================="
echo "✅ All services started successfully!"
echo "========================================="
echo ""
echo "📝 PIDs saved to: $PID_FILE"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📊 View logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services, run: ./stop.sh"
echo ""
