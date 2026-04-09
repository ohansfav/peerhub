# 🚀 Peerhub - Deployment Guide

Host your Peerhub application online for free! Here are the simplest options.

---

## **Option 1: Vercel + Railway (Easiest) ⭐**

### **Frontend: Deploy on Vercel** (5 minutes)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial Peerhub deployment"
   git remote add origin https://github.com/YOUR_USERNAME/peerhub-client.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub (select your `peerhub-client` repo)
   - Click "Deploy"
   - Your frontend is now live at `yourapp.vercel.app`

3. **Add Environment Variables:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-url.com/api`
   - Redeploy

### **Backend: Deploy on Railway** (10 minutes)

1. **Push backend to GitHub:**
   ```bash
   cd server
   git push origin main
   ```

2. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your backend repo
   - Railway auto-detects Node.js
   - Click "Deploy"

3. **Configure Database:**
   - Railway automatically provides a PostgreSQL database (or you can use SQLite)
   - In Railway dashboard, go to Variables tab
   - Add your `.env` variables:
     ```
     NODE_ENV=production
     JWT_SECRET=your-secret-key-here
     EMAIL_SERVICE=console
     ADMIN_EMAIL=admin@peerhub.com
     ADMIN_PASSWORD=admin123
     DATABASE_URL=your-railway-db-url
     ```
   - Your backend is now live at `your-backend-url.railway.app`

4. **Update Frontend API URL:**
   - Go back to Vercel
   - Update `VITE_API_URL` to your Railway backend URL
   - Vercel will auto-redeploy

---

## **Option 2: Render (All-in-One)** 

1. **Push both repos to GitHub**

2. **Deploy Backend on Render:**
   - Go to [render.com](https://render.com)
   - Create "Web Service" → GitHub
   - Select backend repo
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
   - Add `.env` variables
   - Deploy

3. **Deploy Frontend on Render:**
   - Same process, but Select "Static Site"
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Deploy

---

## **Option 3: Heroku (Traditional)** 

Heroku removed free tier, but you can use:

1. **Deploy backend:**
   ```bash
   npm install -g heroku
   heroku login
   heroku create your-peerhub-api
   git push heroku main
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   ```

2. **Deploy frontend:**
   - Same Vercel process as Option 1

---

## **Quick Comparison**

| Platform | Cost | Setup Time | Database | Best For |
|----------|------|-----------|----------|----------|
| **Vercel + Railway** | Free | 15 min | ✅ PostgreSQL | **Recommended** |
| **Render** | ~$7/mo | 10 min | ✅ PostgreSQL | All-in-one |
| **Heroku** | ~$7/mo | 10 min | ✅ PostgreSQL | Traditional |

---

## **Post-Deployment Checklist**

- [ ] Frontend loads at `your-app.vercel.app`
- [ ] Backend API responds at `your-api.railway.app/api/health`
- [ ] Can signup → login → onboarding on production
- [ ] Environment variables set correctly in both services
- [ ] Update `.env` files locally with production URLs for testing

---

## **Troubleshooting**

### **"Cannot connect to backend"**
- Check `VITE_API_URL` in Vercel
- Verify Railway/backend is running: `https://your-backend.railway.app/api/health`
- Check CORS headers in backend

### **"Database connection error"**
- Verify `DATABASE_URL` in Railway env vars
- Ensure SQLite backup or PostgreSQL migration is configured

### **"Admin login not working"**
- Run backend setup script: `npm run setup-db` on Railway
- Or manually insert admin via Railway terminal

---

## **Share with Friend**

Once deployed:
1. Send them: `https://your-app.vercel.app`
2. Login credentials: `admin@peerhub.com / admin123`
3. They can explore and signup as student or tutor!

---

## **Need Help?**
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
