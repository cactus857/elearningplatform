# 🚀 Deployment Guide

## Overview
- **Frontend:** Vercel (Next.js)
- **Backend:** Render (NestJS)
- **Database:** MongoDB Atlas (already configured)

---

## 📦 Frontend Deployment (Vercel)

### Step 1: Push to GitHub
Make sure your code is pushed to a GitHub repository.

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Select the `elearning-frontend` folder as root directory

### Step 3: Configure Build Settings
| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `elearning-frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Step 4: Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL | `https://elearning-api.onrender.com` |

### Step 5: Deploy!
Click "Deploy" and wait for the build to complete.

---

## 🖥️ Backend Deployment (Render)

### Step 1: Create Render Account
Go to [render.com](https://render.com) and sign up.

### Step 2: Create Web Service
1. Click "New" > "Web Service"
2. Connect your GitHub repo
3. Select the `online-elearning-platform` folder

### Step 3: Configure Build Settings
| Setting | Value |
|---------|-------|
| Name | `elearning-api` (or your choice) |
| Region | Singapore (closest to Vietnam) |
| Branch | `main` |
| Root Directory | `online-elearning-platform` |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm run start:prod` |

### Step 4: Environment Variables
Add these in Render Dashboard > Environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` (auto-set by Render) |
| `DATABASE_URL` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Random secure string | `your-super-secret-key-here` |
| `ADMIN_EMAIL` | Initial admin email | `admin@gmail.com` |
| `ADMIN_PASSWORD` | Initial admin password | `your-secure-password` |
| `FRONTEND_URL` | Your Vercel URL | `https://your-app.vercel.app` |
| `AWS_ACCESS_KEY_ID` | S3 access key | (from AWS) |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | (from AWS) |
| `AWS_REGION` | S3 region | `ap-southeast-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `your-bucket` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Step 5: Deploy!
Click "Create Web Service" and wait for deployment.

---

## ⚠️ Important Notes

### 1. Render Free Tier Cold Start
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- **Solution:** Use paid plan ($7/month) or set up a cron ping

### 2. CORS Already Configured
The backend `main.ts` has been updated to accept requests from:
- Your Vercel domain (via `FRONTEND_URL` env variable)
- `localhost:3300` (for local development)

### 3. Database
- MongoDB Atlas is cloud-based, no changes needed
- Make sure your Atlas cluster allows connections from anywhere (0.0.0.0/0)

### 4. After Deployment
1. Update `FRONTEND_URL` in Render with your actual Vercel URL
2. Update `NEXT_PUBLIC_API_URL` in Vercel with your actual Render URL
3. Redeploy both if needed

---

## 🔗 URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://elearning-api.onrender.com` |
| API Health Check | `https://elearning-api.onrender.com/health` |

---

## 📝 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Copy Render URL
- [ ] Deploy frontend to Vercel with Render URL
- [ ] Copy Vercel URL
- [ ] Update Render `FRONTEND_URL` with Vercel URL
- [ ] Test login functionality
- [ ] Test API calls from frontend
- [ ] Verify CORS working correctly

---

*Last updated: 2025-12-16*
