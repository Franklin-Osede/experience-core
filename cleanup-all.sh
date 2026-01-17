#!/bin/bash

# Manual cleanup without stopping processes (use with caution or when stopped manually)
echo "Cleaning up ALL node_modules..."
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
echo "Cleanup complete."
