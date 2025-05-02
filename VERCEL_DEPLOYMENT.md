# Deploying to Vercel

This guide will help you deploy your Beehive Monitoring application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

Before deploying, you'll need to set up the following environment variables in Vercel:

```
# MongoDB connection
MONGODB_URI=mongodb+srv://your-mongodb-uri

# API URLs (will be automatically set by Vercel for the frontend)
NEXT_PUBLIC_API_URL=
SCHEDULER_API_URL=https://your-scheduler-api-url

# Other variables as needed
```

## Deployment Steps

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up or log in

2. **Import your Git Repository**
   - Click "Add New" > "Project"
   - Connect to your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

3. **Configure Project**
   - Project Name: Choose a name for your deployment
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (or your project root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables**
   - Add all required environment variables from the section above
   - Click on "Environment Variables" and add each key-value pair

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

## After Deployment

- Your application will be assigned a URL like `project-name.vercel.app`
- You can add a custom domain in the Vercel project settings
- Each new push to your repository's main branch will trigger a new deployment

## Backend Services

Note that Vercel only hosts frontend applications. If your app has Python backend services, you'll need to:

1. Host the Python services separately (AWS, DigitalOcean, Heroku, etc.)
2. Update your environment variables to point to these external services
3. Ensure CORS is properly configured for cross-domain communication

## Continuous Development

You can continue to develop your application after deployment:

1. Make changes to your code locally
2. Push changes to your Git repository
3. Vercel will automatically rebuild and deploy the new version

## Preview Deployments

Vercel creates a unique preview deployment for each pull request, allowing you to test changes before merging to production.

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in Vercel
2. Ensure all environment variables are correctly set
3. Verify that your application works locally before deploying
4. Make sure any API endpoints are accessible from the Vercel environment 