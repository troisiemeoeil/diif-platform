#!/bin/bash

set -e  # Exit on error

# Azure deployment script for Node.js with Next.js
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Deployment complete!"
