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

# Cleanup node_modules to save RAM/Disk
echo "Cleaning up node_modules..."
rm -rf node_modules
rm -rf backend/node_modules
echo "Cleanup complete."
