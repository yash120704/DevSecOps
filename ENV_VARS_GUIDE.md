# 🔐 Cloud Deployment - Environment Variables & Credentials Guide

## Where to Get Each Credential

### Supabase Credentials

**Project URL & Keys:**
1. Go to https://supabase.com/dashboard
2. Click your project
3. Settings (gear icon) → **API**
4. Copy these:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **Anon key** (public) → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - **Service role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

**Database Connection String:**
1. Settings → **Database**
2. Click **Connection string** (Postgres tab)
3. Copy the connection string → `DATABASE_URL`
4. Format: `postgresql://postgres:password@host:5432/postgres`

**SMTP Configuration (Mailgun):**
1. Settings → **Email** or **Auth** → **Email Providers**
2. Look for Mailgun configuration you set up
3. Get SMTP credentials (if needed for backend)

---

### Generate Django SECRET_KEY

Run this command **locally** (only once):

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output → Use as `SECRET_KEY` in Render

---

## Render Environment Variables

### Step 1: Go to Render Backend Service Settings
1. Log in to https://render.com
2. Click your **devsecops-backend** service
3. Go to **Environment**

### Step 2: Add These Variables

```env
# Django Settings
DEBUG=False
SECRET_KEY=paste-the-generated-key-here

# Host Configuration
ALLOWED_HOSTS=your-backend-url.onrender.com

# Database (from Supabase)
DATABASE_URL=postgresql://postgres:your_password@your-host.supabase.co:5432/postgres

# Supabase (from Supabase Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Redis (use Upstash free tier)
CELERY_BROKER_URL=redis://default:password@your-upstash-host:6379
CELERY_RESULT_BACKEND=redis://default:password@your-upstash-host:6379

# CORS (your Vercel frontend URL)
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## Vercel Environment Variables

### Step 1: Go to Vercel Project Settings
1. Log in to https://vercel.com
2. Click your project
3. Settings → **Environment Variables**

### Step 2: Add These Variables

```env
# Supabase (from Supabase Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (Render backend URL)
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Quick Copy-Paste Template

### For Render Backend

```
DEBUG=False
SECRET_KEY=[GENERATE_ONE_LOCALLY]
ALLOWED_HOSTS=[your-service-name].onrender.com
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[COPY_FROM_SUPABASE]
SUPABASE_SERVICE_ROLE_KEY=[COPY_FROM_SUPABASE]
CELERY_BROKER_URL=redis://default:[PASSWORD]@[REDIS_HOST]:6379
CELERY_RESULT_BACKEND=redis://default:[PASSWORD]@[REDIS_HOST]:6379
CORS_ALLOWED_ORIGINS=https://[YOUR_VERCEL_DOMAIN].vercel.app
```

### For Vercel Frontend

```
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[COPY_FROM_SUPABASE]
VITE_API_URL=https://[YOUR_RENDER_SERVICE].onrender.com
```

---

## How to Find Your Service URLs

### Render Backend URL
1. Log in to Render
2. Go to **devsecops-backend** service
3. Top of page shows: `https://devsecops-backend.onrender.com`
4. Or Settings → Look for "Service URL"

### Upstash Redis URL
1. Go to https://upstash.com/
2. Create a Redis database on the free plan
3. Open the database details page
4. Copy the Redis URL shown there
5. Paste the exact URL into `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND`

### Vercel Frontend URL
1. Log in to Vercel
2. Click your project
3. Deployments → Latest deployment shows URL
4. Usually: `https://project-name.vercel.app`

---

## Database Connection Test

After adding DATABASE_URL to Render, test the connection:

```bash
# Run in your local terminal (with your .env file)
psql $DATABASE_URL -c "SELECT 1"
```

Should return: `1` ✅

If error: Check DATABASE_URL format and password

---

## Supabase Specific

### Enable SMTP in Supabase

1. Go to project dashboard
2. Settings → **Email Providers** or **Auth** → **Email**
3. Configure with Mailgun credentials (you already have this setup)
4. Test email sending

### Verify Database Migrations Ran

1. Go to Supabase dashboard
2. SQL Editor
3. Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
4. Should see: `django_migrations`, `scanner_*` tables

---

## Troubleshooting Missing Variables

### Backend returns 500 error
→ Check Render logs for which variable is missing

### Frontend API calls return 401
→ Check `CORS_ALLOWED_ORIGINS` includes Vercel URL

### Database connection fails
→ Check `DATABASE_URL` format: `postgresql://user:pass@host:port/db`

### Celery tasks fail
→ Check `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` match Redis URL

### Email not sending
→ Check Supabase SMTP configured in Email settings

---

## Security Notes

⚠️ **Never commit .env files to GitHub!**

Instead:
- [ ] Add environment variables in Vercel settings UI
- [ ] Add environment variables in Render settings UI
- [ ] Keep credentials in Supabase dashboard
- [ ] Never share screenshots with credentials visible

✅ **What's already safe:**
- `VITE_SUPABASE_ANON_KEY` is public (anon prefix means it's OK to expose)
- `VITE_API_URL` is public (just a URL)

🔒 **Keep secret:**
- `SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (contains password)
- `CELERY_BROKER_URL` (contains Redis password)

---

## Command Reference

### Generate SECRET_KEY (run once locally)
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Check Render Logs
```bash
# View last 100 lines
render logs devsecops-backend --tail 100

# Stream live logs
render logs devsecops-backend --follow
```

### Test API from terminal
```bash
curl https://your-backend.onrender.com/api/reports/
```

### Check database
```bash
psql $DATABASE_URL -c "SELECT version();"
```

---

## Final Checklist

Before going live:

- [ ] All 9 Render env vars set
- [ ] All 3 Vercel env vars set
- [ ] Supabase project created and SMTP configured
- [ ] SECRET_KEY generated and stored safely
- [ ] DATABASE_URL tested locally
- [ ] Redis dependency added to Render backend
- [ ] Frontend builds successfully in Vercel
- [ ] Backend migrations ran (check Render logs)
- [ ] Test API endpoint returns data
- [ ] Test login/register flow works
- [ ] Test email sending works

✅ When all checked → Production ready!
