#!/bin/bash

# Warung HPP Calculator - Quick Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 Setting up Warung HPP Calculator..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed or not in PATH."
    echo "   Please install MySQL 8.0+ and ensure it's running."
    echo "   Visit: https://dev.mysql.com/downloads/mysql/"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MySQL found"
fi

echo ""
echo "🔧 Setting up backend..."

# Backend setup
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

cd ..

echo ""
echo "🎨 Setting up frontend..."

# Frontend setup
cd frontend

# Install dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
fi

cd ..

echo ""
echo "🗄️  Database setup..."

# Ask if user wants to set up database
read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter MySQL root password: " -s MYSQL_PASSWORD
    echo
    
    # Create database and run schema
    mysql -u root -p"$MYSQL_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS warung_hpp;
USE warung_hpp;
SOURCE c:/github/warung/database/schema.sql;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed successfully!"
    else
        echo "❌ Database setup failed. Please check your credentials."
    fi
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env with your database credentials"
echo "   2. Edit frontend/.env if needed (default: http://localhost:8000)"
echo "   3. Start MySQL service"
echo ""
echo "🚀 Quick Start:"
echo "   Start both services: ./start.sh"
echo "   Stop both services: ./stop.sh"
echo ""
echo "   Or run manually:"
echo "   4. Run backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "   5. Run frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📚 For more information, see README.md"
