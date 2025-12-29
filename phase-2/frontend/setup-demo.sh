#!/bin/bash

# Demo Mode Setup Script
# This script sets up the frontend for demo/testing without a backend

echo "🚀 Setting up Todo App Demo Mode..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cp .env.demo .env.local
    echo "✅ Created .env.local with demo settings"
else
    echo "ℹ️  .env.local already exists, checking contents..."
    if ! grep -q "NEXT_PUBLIC_DEMO_MODE=true" .env.local; then
        echo "⚠️  Demo mode not enabled in .env.local"
        echo "Please add: NEXT_PUBLIC_DEMO_MODE=true"
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Demo Mode Setup Complete!"
echo ""
echo "🚀 To start the app in demo mode:"
echo "   npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:3000/tasks"
echo ""
echo "📝 Demo Features:"
echo "   • No authentication required"
echo "   • 5 pre-loaded demo tasks"
echo "   • Full CRUD operations (Create, Read, Update, Delete)"
echo "   • Search, filter, and sort functionality"
echo "   • All UI components working"
echo ""
echo "🔧 To switch back to production mode:"
echo "   1. Remove NEXT_PUBLIC_DEMO_MODE from .env.local"
echo "   2. Set up your backend API"
echo ""
echo "Enjoy testing! 🎉"