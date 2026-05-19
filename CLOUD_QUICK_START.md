# 🚀 Quick Start - Cloud Deployment in 30 Minutes

Follow these steps in order. Estimated time: **30-45 minutes**

---

## Phase 1: Setup GitHub (5 min)

### Step 1A: Create Repository
```bash
# In PowerShell, from project root
cd C:\Imp\g\DevSecOps

git init
git add .
git commit -m "Initial commit: DevSecOps Policy Engine"
git branch -M main

# Then go to https://github.com/new and create repo named "DevSecOps"
# Copy the remote add command and run:
git remote add origin https://github.com/YOUR_USERNAME/DevSecOps.git
git push -u origin main
```

**✅ Code now on GitHub!**

---

## Phase 2: Deploy Frontend (5 min)

### Step 2A: Connect Vercel

1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize and select **DevSecOps** repository
4. **Framework**: Vite
5. **Root Directory**: `frontend`
6. Click **Deploy**

**Wait 1-2 min for deployment...**

### Step 2B: Get Frontend URL
After deployment, copy your URL: `https://your-app.vercel.app`

**✅ Frontend live on Vercel!**

---

## Phase 3: Deploy Backend (10 min)

### Step 3A: Create Render Account
1. Go to https://render.com
2. Click **Get Started**
3. Sign up with GitHub

### Step 3B: Create Database
1. Dashboard → **New +** → **PostgreSQL**
2. **Name**: `devsecops-db`
3. Create
4. **Copy the connection string** (looks like `postgresql://...`)

### Step 3C: Create Backend Service
1. Dashboard → **New +** → **Web Service**
2. Connect your **DevSecOps** repository
3. **Name**: `devsecops-backend`
4. **Root Directory**: `backend`
5. **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
6. **Start Command**: `gunicorn policy_engine.wsgi:application --bind 0.0.0.0:$PORT`
7. Click **Create Web Service**

**Wait 2-3 min for build...**

### Step 3D: Add Environment Variables

While backend is building, go to **Environment** tab and add these variables:

```
DEBUG=False
SECRET_KEY=[Generate locally: python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"]
ALLOWED_HOSTS=your-backend.onrender.com
DATABASE_URL=[Copy from Render PostgreSQL]
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=[From Supabase Settings → API]
SUPABASE_SERVICE_ROLE_KEY=[From Supabase Settings → API]
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Step 3E: Add Redis
1. Go to backend service
2. Click **Environment** → **Add Dependency**
3. Select **Redis** → **Create**

**Render will auto-add CELERY_BROKER_URL and CELERY_RESULT_BACKEND**

### Step 3F: Get Backend URL
After service is built and running, copy URL: `https://your-backend.onrender.com`

**✅ Backend live on Render!**

---

## Phase 4: Connect Services (5 min)

### Step 4A: Update Vercel with Backend URL
1. Go to Vercel project
2. Settings → **Environment Variables**
3. Edit `VITE_API_URL` (or create new)
4. Set value: `https://your-backend.onrender.com`
5. Click **Save**
6. Go to Deployments → **Redeploy latest**

**Wait 1-2 min...**

### Step 4B: Verify All Connections
1. Check Vercel frontend loads: https://your-app.vercel.app
2. Check backend responds:
   ```bash
   curl https://your-backend.onrender.com/api/reports/
   ```
   Should return: `[]` or error (that's OK, just checking connection)

**✅ Frontend & Backend connected!**

---

## Phase 5: Test Application (5 min)

### Step 5A: Test Frontend
- Open: https://your-app.vercel.app
- Click around, verify pages load

### Step 5B: Test Authentication
- Click **Register**
- Enter email and password
- Should see: "Check your email to confirm"

### Step 5C: Test Email
- Check spam folder for confirmation email
- If not there, check Supabase dashboard → Auth → Users
- Verify user was created

### Step 5D: Test Login
- Click **Login**
- Use the credentials you registered
- Should be logged in

**✅ Application working!**

---

## Environment Variables Quick Reference

### Generate Django SECRET_KEY
Run this **once** locally:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Get Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Click your project
3. Settings (gear) → **API**
4. Copy:
   - Project URL
   - Anon key
   - Service role key

### Get Database Connection String
1. Same Supabase project
2. Settings → **Database**
3. Click **Connection string** (Postgres tab)
4. Copy the connection string

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend returns 502 | Check Render logs, verify environment variables |
| Frontend can't reach API | Check `VITE_API_URL` in Vercel, redeploy |
| Database connection fails | Check `DATABASE_URL` format, test: `psql $DATABASE_URL -c "SELECT 1"` |
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` includes Vercel URL |
| Email not received | Check Supabase Settings → Email Providers configured |

---

## What's Next?

### Immediately After Deployment

- [ ] Test all features work
- [ ] Check logs for errors: Render → Service → Logs
- [ ] Verify database has tables: Supabase → SQL Editor

### Optional - Custom Domains

- [ ] Add custom domain to Vercel (Settings → Domains)
- [ ] Add custom domain to Render (Settings → Custom Domain)
- [ ] Update DNS records

### Ongoing

- [ ] Push updates to GitHub
- [ ] Services auto-deploy
- [ ] Monitor logs in Render & Vercel
- [ ] Supabase handles backups automatically

---

## Completed Architecture

```
GitHub (code) 
    ↓
    ├─→ Vercel (frontend) 
    │       ↓
    │   https://your-app.vercel.app
    │
    └─→ Render (backend) 
            ↓
        https://your-backend.onrender.com
        └─→ Supabase (database + auth)
            └─→ Mailgun (email)
```

**All free tier! 🎉**

---

## Costs

| Service | Cost |
|---------|------|
| GitHub | Free |
| Vercel | Free (100GB/month) |
| Render | Free (750 hours/month) |
| Supabase | Free (500MB database) |
| **Total** | **$0/month** |

---

## Full Documentation

- **Detailed steps**: See `CLOUD_DEPLOYMENT.md`
- **Env variables**: See `ENV_VARS_GUIDE.md`
- **Development setup**: See `SETUP.md`
- **Architecture**: See `RESEARCH_PAPER.md`

---

**You're done! 🚀 Your app is live in the cloud!**
