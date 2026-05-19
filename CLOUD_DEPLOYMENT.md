# ☁️ Cloud Deployment Guide - DevSecOps Policy Engine

**Architecture Overview:**
- 🔧 **Code**: GitHub (source of truth)
- 🎨 **Frontend**: Vercel (auto-deploy from GitHub)
- 🚀 **Backend**: Render (auto-deploy from GitHub)
- 🗄️ **Database**: Supabase PostgreSQL
- 📧 **Email**: Supabase Auth + Mailgun SMTP
- ⚡ **Task Queue**: Redis (via Render)

---

## Step 1: Create GitHub Repository

### 1.1 Create Repository

1. Go to https://github.com/new
2. **Repository name**: `DevSecOps` (or your choice)
3. **Description**: DevSecOps Policy Engine with vulnerability scanning
4. **Visibility**: Choose Public or Private
5. **Initialize**: DO NOT initialize (you'll push existing code)
6. Click **Create repository**

### 1.2 Push Code to GitHub

On your local machine:

```bash
cd C:\Imp\g\DevSecOps

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: DevSecOps Policy Engine"

# Add remote (replace USERNAME/REPO with your details)
git remote add origin https://github.com/USERNAME/DevSecOps.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Verify on GitHub**: https://github.com/USERNAME/DevSecOps

---

## Step 2: Frontend Deployment (Vercel)

### 2.1 Connect GitHub to Vercel

1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel with GitHub
4. Click **Import Git Repository**
5. Select your `DevSecOps` repository
6. Click **Import**

### 2.2 Configure Vercel Project

**Project Settings:**

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Click **Continue**

### 2.3 Set Environment Variables

Add these environment variables in Vercel:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://your-backend.onrender.com
```

**How to get these values:**
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: From Supabase project settings
- `VITE_API_URL`: You'll set this after backend deployment (see Step 3)

**For now, use temporary value:**
```env
VITE_API_URL=http://localhost:8000
```

Update after Step 3.

### 2.4 Deploy Frontend

Click **Deploy**

**Vercel will:**
1. Clone your repository
2. Install dependencies
3. Build frontend
4. Deploy to CDN

**You'll get a URL like**: `https://devsecops-abc123.vercel.app`

✅ **Frontend Live!**

---

## Step 3: Backend Deployment (Render)

### 3.1 Create Render Account

1. Go to https://render.com/
2. Click **Get Started**
3. Sign up with GitHub
4. Authorize Render with GitHub

### 3.2 Create PostgreSQL Database

1. Dashboard → Click **New +**
2. Select **PostgreSQL**
3. **Name**: `devsecops-db`
4. **Region**: Choose closest to your users
5. **PostgreSQL Version**: 15
6. Keep all other defaults
7. Click **Create Database**

**Save these details** (shown after creation):
- Database URL
- Host
- User
- Password
- Database name

### 3.3 Create Backend Service

1. Dashboard → Click **New +**
2. Select **Web Service**
3. **Connect**: GitHub (authorize if needed)
4. **Repository**: Select `DevSecOps`
5. **Branch**: `main`
6. Click **Connect**

### 3.4 Configure Backend Service

**Service Settings:**

- **Name**: `devsecops-backend`
- **Environment**: `Python 3`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: 
  ```
  pip install -r requirements.txt && python manage.py migrate
  ```
- **Start Command**: 
  ```
  gunicorn policy_engine.wsgi:application --bind 0.0.0.0:$PORT
  ```

### 3.5 Set Environment Variables

Click **Environment** and add:

```env
DEBUG=False
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=your-backend.onrender.com
DATABASE_URL=postgresql://user:password@your-db.onrender.com:5432/your_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CELERY_BROKER_URL=redis://default:password@your-redis.onrender.com:6379
CELERY_RESULT_BACKEND=redis://default:password@your-redis.onrender.com:6379
CORS_ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app
```

**Generate SECRET_KEY** (run locally):
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3.6 Add Redis (for Celery)

Render free tier includes 0.25GB Redis. Add after service creation:

1. Go to your backend service
2. Click **Environment** → **Add Dependency**
3. Select **Redis**
4. Click **Create Database**

Render will automatically add `REDIS_URL` environment variable.

### 3.7 Deploy Backend

Click **Create Web Service**

**Render will:**
1. Clone repository
2. Create virtual environment
3. Install dependencies
4. Run migrations
5. Start Gunicorn server

**You'll get a URL like**: `https://devsecops-backend.onrender.com`

✅ **Backend Live!**

---

## Step 4: Update Frontend with Backend URL

### 4.1 Update Environment Variable

1. Go to Vercel Project
2. Settings → **Environment Variables**
3. Edit `VITE_API_URL`
4. Change from `http://localhost:8000` to `https://your-backend.onrender.com`
5. Click **Save**

### 4.2 Redeploy Frontend

1. Go to Deployments
2. Click the latest deployment → **Redeploy**
3. Or push a new commit to trigger auto-deploy

✅ **Frontend & Backend Connected!**

---

## Step 5: Configure Supabase

### 5.1 Get Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → **API**
4. Copy:
   - Project URL
   - Anon key
   - Service role key

### 5.2 Get SMTP Credentials

1. Settings → **Email** (or **Auth** → **Email** provider)
2. Mailgun configuration (if already setup by you)
   - SMTP Host
   - Port
   - Username
   - Password

### 5.3 Update Render Backend

Add to Render environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5.4 Update Vercel Frontend

Add to Vercel environment variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 6: Configure Database Connection

### 6.1 Update Backend with Supabase Database

In Render environment variables, set:

```env
DATABASE_URL=postgresql://postgres:your_password@your-db.supabase.co:5432/postgres
```

### 6.2 Run Migrations

Migrations run automatically during Render deployment (via build command).

**To verify migrations:**
1. Go to Render backend service
2. Click **Logs**
3. Look for "Running migrations" messages
4. Should see "System check identified no issues (0 silenced)"

---

## Step 7: Test Cloud Deployment

### 7.1 Test Frontend

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. You should see the home page
3. Click navigation links to verify routing works

### 7.2 Test Backend API

```bash
# Test from terminal
curl https://your-backend.onrender.com/api/reports/

# Should return: []
# Or: {"detail":"Authentication credentials were not provided."}
```

### 7.3 Test Authentication Flow

1. Go to frontend URL
2. Click "Register"
3. Enter email and password
4. Should receive confirmation email (if Mailgun configured)
5. Confirm email in Supabase
6. Try login

### 7.4 Check Logs

**Vercel Frontend Logs:**
- Settings → Functions → Logs

**Render Backend Logs:**
- Your service → Logs tab

---

## Step 8: Custom Domain (Optional)

### 8.1 Frontend Custom Domain

1. Vercel Project → Settings → **Domains**
2. Enter your domain
3. Follow DNS setup instructions
4. Propagation takes 5-10 minutes

### 8.2 Backend Custom Domain

1. Render Service → Settings → **Custom Domain**
2. Enter your domain
3. Update DNS records
4. Propagation takes 5-10 minutes

---

## Step 9: Auto-Deployment Setup

### 9.1 Vercel Auto-Deploy

Already enabled by default:
- Any push to `main` branch → auto-deploy to production
- Pull requests → preview deployments

### 9.2 Render Auto-Deploy

Already enabled:
- Any push to `main` branch → auto-deploy
- Builds take 2-5 minutes
- Previous deployment stays live during build (zero downtime)

### 9.3 Manual Deployments

**Trigger redeploy without code changes:**

**Vercel:**
1. Deployments → Latest → **Redeploy**

**Render:**
1. Service → **Manual Deploy** → **Deploy latest commit**

---

## Step 10: Monitoring & Logs

### 10.1 Monitor Frontend

**Vercel Analytics:**
- Home → Click project → **Analytics**
- View page load times, core web vitals

**Error Tracking:**
- Settings → **Error Tracking**

### 10.2 Monitor Backend

**Render Logs:**
- Your service → **Logs** tab
- Real-time request logs
- Error messages
- Build output

**Set up alerts:**
- Settings → **Alerts** (Pro feature, but check for free options)

### 10.3 Monitor Database

**Supabase Monitoring:**
- Project → **Database** → **Monitoring**
- Query performance
- Connection stats
- Backups

---

## Troubleshooting

### Frontend won't load after deployment

```
Error: Cannot find module '@/services/api'
```

**Solution:**
1. Check build output in Vercel logs
2. Verify `VITE_API_URL` environment variable set
3. Trigger redeploy

### Backend 502 Bad Gateway

```
502 Bad Gateway (Render)
```

**Solution:**
1. Check Render logs for startup errors
2. Verify environment variables set correctly
3. Check DATABASE_URL syntax
4. Restart service: Service → **Manual Deploy**

### Can't connect to database

```
Error: psycopg2.OperationalError: could not connect
```

**Solution:**
1. Verify DATABASE_URL is correct
2. Check Supabase database is running
3. Verify IP whitelist (Supabase might need to add Render IPs)
4. Test locally: `psql $DATABASE_URL -c "SELECT 1"`

### CORS errors from frontend

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check `CORS_ALLOWED_ORIGINS` in backend settings
2. Verify Vercel frontend URL is in CORS list
3. Restart backend service
4. Clear browser cache

### Celery tasks not processing

```
No active worker found
```

**Solution:**
1. Render free tier has limited resources
2. Check Redis connection: Verify `CELERY_BROKER_URL`
3. Check Render logs for Celery worker startup
4. Restart service

---

## Cost Summary (Free Tier)

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **GitHub** | Unlimited | Public/Private repos |
| **Vercel** | 100 GB/month bandwidth | Auto-scaling |
| **Render** | 750 hours/month | 0.5GB RAM web service |
| **Render Database** | 1 PostgreSQL database | 1GB storage |
| **Render Redis** | 0.25GB Redis | Included |
| **Supabase** | 500MB database | 1GB file storage |
| **Mailgun** | 100 emails/day | Sandbox mode |
| **Total Cost** | **$0/month** | ✅ Free tier sufficient for MVP |

---

## Upgrade Path When Needed

| Service | When to Upgrade | Cost |
|---------|-----------------|------|
| Vercel | > 100GB/month | $20/month |
| Render | Need more RAM/CPU | $7-57/month |
| Supabase | > 1GB storage | $25-100/month |
| Mailgun | > 100 emails/day | $35/month sandbox → verified domain |

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub main branch
- [ ] All credentials added to Render/Vercel
- [ ] Database URL correct in Render
- [ ] Supabase project created and configured
- [ ] Mailgun domain configured in Supabase

### Deployment
- [ ] Vercel frontend deployed successfully
- [ ] Render backend deployed successfully
- [ ] Database migrations ran (check Render logs)
- [ ] Environment variables set on both services
- [ ] No errors in logs

### Post-Deployment
- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds to requests
- [ ] Authentication flow works
- [ ] Email sending works (check Supabase logs)
- [ ] Custom domains working (if added)

---

## Common Git Workflows

### Push new code

```bash
cd C:\Imp\g\DevSecOps
git add .
git commit -m "Description of changes"
git push origin main
```

Auto-deploys to Vercel (1 min) and Render (2-5 min)

### Rollback to previous version

```bash
# See commit history
git log --oneline

# Reset to previous commit
git reset --hard <commit-hash>
git push origin main --force-with-lease
```

Services will auto-deploy the previous version.

### Create feature branch (advanced)

```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create pull request on GitHub
# Vercel creates preview deployment
# Merge when ready
```

---

## Useful Commands

```bash
# View Render backend logs (if have CLI)
render logs devsecops-backend

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View all environment variables
render env list devsecops-backend

# Redeploy manually
render deploy --service devsecops-backend --commit <hash>
```

---

## Support & Documentation

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Mailgun**: https://documentation.mailgun.com/
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/
- **GitHub**: https://docs.github.com/

---

## Next Steps

1. ✅ Create GitHub repository and push code
2. ✅ Deploy frontend to Vercel
3. ✅ Deploy backend to Render
4. ✅ Configure Supabase and Mailgun
5. ✅ Test all functionality
6. ✅ Set up custom domains (optional)
7. ✅ Monitor services and logs
8. ✅ Setup automatic backups (Supabase handles this)

**Estimated time**: 30-45 minutes total

**Status**: Production-ready cloud infrastructure with zero cost!
