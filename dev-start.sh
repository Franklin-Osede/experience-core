#!/bin/bash

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
echo $BACKEND_PID > ../.backend.pid
echo "Backend started with PID $BACKEND_PID"
cd ..

echo "Starting Frontend..."
cd frontend
npm run start &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend.pid
echo "Frontend started with PID $FRONTEND_PID"
cd ..

echo "Both Backend and Frontend started."
