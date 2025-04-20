# Portfolio Deployment Guide

This guide explains how to deploy your portfolio application to Vercel with a separate backend service.

## 1. Backend Deployment (Option 1: Render.com)

1. Create an account on [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your backend repository
4. Configure the service:

   - Name: `portfolio-backend` (or your preferred name)
   - Region: Choose closest to your target audience
   - Branch: `main` (or your production branch)
   - Root Directory: Leave blank if your backend is at the root of the repo
   - Build Command: `npm install`
   - Start Command: `npm start` (or your backend start command)

5. Add environment variables:

   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - Add any other environment variables your backend requires

6. Click "Create Web Service"
7. Wait for the deployment to complete
8. Note the URL of your deployed backend (e.g., `https://portfolio-backend.onrender.com`)

## 2. Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

1. Edit the `.env.production` file with your backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy with Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy your project:

   ```bash
   vercel
   ```

4. Follow the prompts to configure your project.

#### Option B: Deploy with GitHub Integration

1. Push your changes to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" -> "Project"
4. Import your GitHub repository
5. Configure the project:

   - Framework Preset: Vite
   - Root Directory: Leave blank if your frontend is at the root
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add the same variables from your `.env.production`

6. Click "Deploy"

## 3. Post-Deployment Configuration

### CORS Configuration

Make sure your backend has CORS properly configured to allow requests from your Vercel domain:

```javascript
// In your backend app
app.use(
  cors({
    origin: ["https://your-portfolio.vercel.app", "http://localhost:3000"],
  })
);
```

### Testing Your Deployment

1. Test all functionality on the live site
2. Check login/authentication
3. Verify image uploads and display
4. Test project and timeline creation

## Troubleshooting

### Image Loading Issues

If images aren't loading:

- Check the network tab in your browser console
- Verify the image URLs have the correct domain
- Make sure your backend properly serves static files

### API Connection Issues

If API calls fail:

- Check for CORS errors in the console
- Verify the API URL is correct in your environment variables
- Make sure your backend is running and accessible
