# Deployment Guide for Idea2Index

## Problem
The FastAPI backend with pandas/numpy/yfinance dependencies exceeds Vercel's 250 MB serverless function limit.

## Solution: Split Deployment Architecture

### Frontend (Next.js) → Vercel
### Backend (FastAPI) → Railway/Render/Fly.io

---

## Option 1: Deploy Backend to Railway (Recommended - Free Tier)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy Backend
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `idea_index` repository
4. Railway will auto-detect Python and deploy

### Step 3: Configure Backend
1. In Railway project settings → **Variables**, add:
   ```
   GEMINI_API_KEY=AIzaSyAtG4JTwiI8uTN8dwdGdotJUFYhq0DdZmg
   ```
2. In **Settings** → **Networking**, note your public URL (e.g., `https://your-app.railway.app`)

### Step 4: Update Frontend Environment Variable
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Update `FASTAPI_URL` to your Railway backend URL:
   ```
   FASTAPI_URL=https://your-app.railway.app
   ```
3. Redeploy frontend on Vercel

---

## Option 2: Deploy Backend to Render (Free Tier)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `idea-index-backend`
   - **Root Directory**: Leave empty (or `backend` if you restructure)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render dashboard → **Environment**, add:
```
GEMINI_API_KEY=AIzaSyAtG4JTwiI8uTN8dwdGdotJUFYhq0DdZmg
```

### Step 4: Update Frontend
Same as Railway Option 1, Step 4.

---

## Option 3: Keep Everything on Vercel (Requires Code Changes)

### Remove Heavy Dependencies
This requires rewriting `market_data_service.py` to use lightweight HTTP requests instead of pandas/numpy/yfinance. **Not recommended** as it loses core functionality.

---

## Recommended: Railway Deployment

Railway is the easiest option with:
- ✅ Free tier with 500 hours/month
- ✅ Auto-detects Python projects
- ✅ No credit card required for free tier
- ✅ Supports pandas/numpy/yfinance without size limits
- ✅ Simple GitHub integration

After deploying backend to Railway, your architecture will be:
```
User → Vercel (Next.js Frontend) → Railway (FastAPI Backend) → Yahoo Finance API
```
