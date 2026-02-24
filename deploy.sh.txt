#!/bin/bash

set -e  # Exit on error

# Azure deployment script for Node.js with Next.js
echo "Installing dependencies..."
# Ensure node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "node_modules not found, installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "Building application..."
npm run build

echo "Deployment complete!"
