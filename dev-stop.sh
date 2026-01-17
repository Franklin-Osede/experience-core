#!/bin/bash

if [ -f ".backend.pid" ]; then
  PID=$(cat .backend.pid)
  echo "Stopping Backend (PID: $PID)..."
  kill $PID
  rm .backend.pid
  echo "Backend stopped."
else
  echo "Backend PID file not found."
fi

if [ -f ".frontend.pid" ]; then
  PID=$(cat .frontend.pid)
  echo "Stopping Frontend (PID: $PID)..."
  kill $PID
  rm .frontend.pid
  echo "Frontend stopped."
else
  echo "Frontend PID file not found."
fi

# Cleanup node_modules to save RAM/Disk
echo "Cleaning up node_modules..."
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
echo "Cleanup complete."
