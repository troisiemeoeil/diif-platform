#!/bin/bash

# Azure deployment script for Node.js with Next.js
# Install dependencies from scratch to avoid symlink issues
npm ci --production=false

# Build the application
npm run build

# Set environment variable for production
export NODE_ENV=production
