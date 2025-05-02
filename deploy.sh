#!/bin/bash

# Beehive Monitoring System - Deployment Script
# This script helps prepare the project for Vercel deployment

echo "==== Preparing for Vercel Deployment ===="

# 1. Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# 2. Ensure Next.js build works locally
echo "Testing build process locally..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful! Ready to deploy."
else
    echo "Build failed. Please fix the issues before deploying."
    exit 1
fi

# 3. Login to Vercel if needed
echo "Please login to Vercel if prompted..."
vercel login

# 4. Deploy to Vercel
echo "Deploying to Vercel..."
echo "Note: You will be prompted to configure your project during first deployment."
echo "Remember to set your environment variables in the Vercel dashboard after deployment."
vercel

echo "==== Deployment Complete ===="
echo ""
echo "IMPORTANT NOTES:"
echo "1. Your Python backend services will need to be hosted separately."
echo "2. Update your frontend environment variables in the Vercel dashboard to point to your backend services."
echo "3. Set up your MongoDB connection string in the Vercel environment variables."
echo ""
echo "See VERCEL_DEPLOYMENT.md for detailed instructions." 