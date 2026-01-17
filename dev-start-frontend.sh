#!/bin/bash

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Frontend..."
cd frontend
npm run start &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend.pid
echo "Frontend started with PID $FRONTEND_PID"
cd ..
