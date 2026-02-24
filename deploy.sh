#!/bin/bash

set -e  # Exit on error

# Azure deployment script for Node.js with Next.js
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Copying standalone server files..."
# Copy the public folder to the standalone build
if [ -d ".next/standalone/public" ]; then
  rm -rf .next/standalone/public
fi

if [ -d "public" ]; then
  cp -r public .next/standalone/public
fi

# Copy the .next/static folder
if [ -d ".next/static" ]; then
  cp -r .next/static .next/standalone/.next/static
fi

echo "Deployment complete!"
