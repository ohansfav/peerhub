#!/bin/bash

# Replit startup script for Peerup
# This script builds the frontend and starts the backend to serve it

echo "🚀 Starting Peerup on Replit..."

# Install dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Go back to root
cd ..

# Build client
echo "🔨 Building frontend..."
cd client
npm install
npm run build

# Go back to root
cd ..

# Start server (which will serve the built client)
echo "✅ Starting backend server..."
cd server
npm start
