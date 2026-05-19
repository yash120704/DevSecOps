# 🔐 DevSecOps - Repository Security & Compliance Scanner

A comprehensive web application for scanning GitHub repositories to assess security vulnerabilities, code quality, CI/CD hygiene, and governance compliance. Built with modern technologies and deployed on cloud-native infrastructure.

**Live Demo:** https://dev-sec-ops-ruby.vercel.app/

---

## 📌 Project Description

DevSecOps is an advanced repository scanning platform that analyzes GitHub projects across four critical dimensions:

- **Security**: Detects hardcoded secrets, dependency vulnerabilities, and debug mode misconfigurations
- **Code Quality**: Analyzes complexity, maintainability, and code standards
- **CI/CD Hygiene**: Validates GitHub Actions workflows and deployment configurations
- **Governance**: Ensures compliance with project standards and policies

The application provides detailed, actionable reports with vulnerability information, risk assessment, and compliance scores to help teams identify and remediate security issues.

---

## 🚀 Features

✅ **GitHub Repository Scanning**
- One-click repository analysis
- Support for public and private repositories
- Real-time scan status updates

✅ **Comprehensive Security Analysis**
- Secret detection (API keys, credentials, tokens)
- Dependency vulnerability scanning (pip-audit, npm audit)
- Debug mode detection in production code

✅ **Code Quality Metrics**
- Cyclomatic complexity analysis
- Code maintainability index
- Code duplication detection
- Test coverage assessment

✅ **CI/CD Workflow Validation**
- GitHub Actions workflow analysis
- Docker configuration review
- Pipeline security checks

✅ **Governance & Compliance**
- License compliance verification
- Security policy validation
- Repository configuration standards

✅ **Detailed Reporting**
- Expandable vulnerability details
- Risk level assessment (LOW, MEDIUM, HIGH)
- Compliance score calculation
- JSON export for integration

✅ **Secure Authentication**
- Supabase JWT-based authentication
- User registration and login
- Session management

✅ **Search History**
- Track previous scans
- Quick access to past reports
- Performance trends

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, Framer Motion
- **3D Graphics**: Three.js (Security Radar visualization)
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Framework**: Django 4.2.30
- **Language**: Python 3.9+
- **REST API**: Django REST Framework
- **Task Queue**: Celery 5.6.3
- **Message Broker**: Redis (Upstash)
- **WSGI Server**: Gunicorn 26.0.0
- **Deployment**: Render

### Database & Auth
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase JWT
- **Authentication Backend**: Custom SupabaseJWTAuthentication

### Analysis Tools
- **Python Scanning**: pip-audit, radon, bandit
- **Node.js Scanning**: npm audit
- **YAML Linting**: yamllint
- **Repository Cloning**: GitPython

---

## 📂 Project Structure

```
DevSecOps/
├── frontend/                          # React + Vite frontend app
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── RuleRow.jsx          # Expandable vulnerability display
│   │   │   ├── ScoreGauge.jsx        # Compliance score visualization
│   │   │   ├── SecurityRadar.jsx     # 3D security metrics
│   │   │   ├── RepoForm.jsx          # Repository URL input
│   │   │   ├── ModuleCard.jsx        # Module score cards
│   │   │   └── ...
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Login.jsx             # Authentication
│   │   │   ├── Register.jsx          # User registration
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── Report.jsx            # Scan report display
│   │   │   └── ScanStatus.jsx        # Real-time scan status
│   │   ├── services/                 # API and utility services
│   │   │   ├── api.js                # Axios instance with interceptors
│   │   │   ├── auth.js               # Authentication service
│   │   │   └── supabaseClient.js     # Supabase configuration
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js            # Authentication hook
│   │   │   └── useScanPoller.js      # Scan status polling
│   │   ├── context/                  # React Context
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   ├── App.jsx                   # Root component
│   │   └── main.jsx                  # Entry point
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── package.json                  # Dependencies
│   └── Dockerfile                    # Container image
│
├── backend/                          # Django REST API
│   ├── policy_engine/               # Django project settings
│   │   ├── settings.py              # Configuration (DEBUG, DB, CELERY)
│   │   ├── urls.py                  # API routes
│   │   ├── wsgi.py                  # WSGI app
│   │   ├── asgi.py                  # ASGI app
│   │   └── celery.py                # Celery configuration
│   │
│   ├── scanner/                     # Main Django app
│   │   ├── models.py                # Database models
│   │   ├── views.py                 # API views (ScanView, ReportView, etc.)
│   │   ├── urls.py                  # App routes
│   │   ├── serializers.py           # DRF serializers
│   │   ├── auth_views.py            # Authentication endpoints
│   │   ├── auth_backend.py          # Custom JWT authentication
│   │   ├── tasks.py                 # Celery tasks
│   │   │
│   │   ├── services/               # Core scanning services
│   │   │   ├── repo_cloner.py       # GitHub repository cloning
│   │   │   ├── policy_engine.py     # Orchestrates all checks
│   │   │   ├── security_checks.py   # Secret/vulnerability scanning
│   │   │   ├── quality_checks.py    # Code quality analysis
│   │   │   ├── ci_checks.py         # CI/CD workflow validation
│   │   │   ├── governance_checks.py # Compliance validation
│   │   │   ├── scoring_engine.py    # Score calculation
│   │   │   ├── report_builder.py    # Report generation
│   │   │   └── supabase_client.py   # Database/auth client
│   │   │
│   │   ├── utils/
│   │   │   └── validators.py        # Input validation
│   │   │
│   │   └── migrations/              # Database migrations
│   │
│   ├── requirements.txt             # Python dependencies
│   ├── manage.py                    # Django CLI
│   ├── db.sqlite3                   # Local SQLite (dev only)
│   ├── Dockerfile                   # Container image
│   └── temp_scans/                  # Temporary cloned repos
│
├── docker-compose.yml               # Multi-container orchestration
├── SETUP.md                         # Detailed setup guide
├── START_SERVICES.md                # Service startup instructions
├── RESEARCH_PAPER.md                # Technical documentation
├── SUPABASE_SCHEMA.sql              # Database schema
├── test-api.ps1                     # PowerShell API tests
├── test-api.sh                      # Bash API tests
├── start-all.bat                    # Windows startup script
├── start-all.sh                     # Unix startup script
└── README.md                        # This file
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ (Frontend)
- Python 3.9+ (Backend)
- Git
- Supabase account
- Upstash Redis account (or local Redis)

### Step 1: Clone Repository
```bash
git clone https://github.com/yash120704/DevSecOps.git
cd DevSecOps
```

### Step 2: Set Up Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

Start dev server:
```bash
npm run dev
# Opens at http://localhost:5173
```

### Step 3: Set Up Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env`:
```env
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost/devsecops
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:5173
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379
```

Run migrations:
```bash
python manage.py migrate
```

Start Django server:
```bash
python manage.py runserver
# API at http://localhost:8000/api
```

### Step 4: Start Services

Option A - Docker Compose (All Services):
```bash
docker-compose up
```

Option B - Manual Start (Windows):
```bash
.\start-all.bat
```

Option B - Manual Start (Unix):
```bash
./start-all.sh
```

---

## 🔐 Authentication

### Register New User
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Login
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

# Returns: { user, session, jwt_token }
```

### Authenticated Requests
All API requests require JWT token:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/verify/` - Verify token validity

### Scanning
- `POST /api/scan/` - Initiate repository scan
- `GET /api/scan-status/{scan_id}/` - Get scan progress
- `GET /api/reports/` - List all scan reports
- `GET /api/reports/{report_id}/` - Get specific report
- `GET /api/search-history/` - Get search history

---

## 📊 Scan Report Structure

```json
{
  "scan_id": "uuid",
  "repo_name": "repository-name",
  "repo_url": "https://github.com/user/repo",
  "compliance_score": 78,
  "risk_level": "MEDIUM",
  "timestamp": "2026-05-19T10:30:00Z",
  "module_scores": {
    "security": { "raw_score": 0.85, "weighted_score": 25.5 },
    "code_quality": { "raw_score": 0.72, "weighted_score": 18 },
    "ci_hygiene": { "raw_score": 0.88, "weighted_score": 26.4 },
    "governance": { "raw_score": 0.65, "weighted_score": 9.75 }
  },
  "security": {
    "rules": [
      {
        "rule": "DEPENDENCY_VULNERABILITIES",
        "status": "FAIL",
        "details": "Found 2 high severity vulnerabilities",
        "findings": [
          {
            "package": "django",
            "version": "4.0.0",
            "severity": "HIGH",
            "description": "SQL Injection vulnerability",
            "fixed_version": "4.0.10"
          }
        ]
      }
    ]
  },
  "failures": [...],
  "warnings": [...]
}
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `VITE_API_URL=https://backend-url.onrender.com`
   - `VITE_SUPABASE_URL=your_supabase_url`
   - `VITE_SUPABASE_ANON_KEY=your_key`
4. Deploy on push to main

**Live URL:** https://dev-sec-ops-ruby.vercel.app/

### Backend (Render)
1. Create PostgreSQL database (Supabase)
2. Create Redis instance (Upstash)
3. Push to GitHub
4. Connect to Render Web Service
5. Set environment variables and deploy

**API URL:** https://devsecopsbackend.onrender.com/

---

## 📸 Screenshots

### Landing Page
![Home Page](/public/landing.jpg)

### Dashboard
![Dashboard](/public/dashboard.jpg)

### Scan Report
![Scan Report](/public/report.jpg)

### Security Details
![Security Details](/public/security.jpg)

### Real-time Scan Status
![Scan Status](/public/status.jpg)

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

**Backend (.env)**
```env
DEBUG=True/False
DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_key
ALLOWED_HOSTS=localhost,127.0.0.1,*.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:5173
CELERY_BROKER_URL=redis://default:password@host:port
CELERY_RESULT_BACKEND=redis://default:password@host:port
SCAN_TIMEOUT=120
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python manage.py test
```

### Test API Endpoints

PowerShell:
```powershell
.\test-api.ps1
```

Bash:
```bash
bash test-api.sh
```

---

## 📈 Performance Metrics

- **Scan Timeout**: 120 seconds
- **Max Repository Size**: ~500 MB
- **API Response Time**: <2s for status endpoints
- **Concurrent Scans**: Limited by Render/Celery worker capacity
- **Database Query Optimization**: Indexed on user_id, scan_id

---

## 🔐 Security Considerations

✅ JWT-based authentication with Supabase  
✅ HTTPS-only communication  
✅ CORS protection  
✅ Input validation on all endpoints  
✅ SQL injection prevention with ORM  
✅ Secret scanning before report generation  
✅ Secure temporary file cleanup after scanning  

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed installation instructions
- [Service Management](./START_SERVICES.md) - How to run services
- [Research Paper](./RESEARCH_PAPER.md) - Technical architecture
- [Database Schema](./SUPABASE_SCHEMA.sql) - PostgreSQL schema

---

## 🎯 Future Improvements

📌 **Phase 2 Features**
- Real-time scanning via WebSockets
- Advanced filtering and search in reports
- Export reports to PDF/CSV
- Scheduled recurring scans
- Slack/Email notifications
- Custom scoring policies
- Team collaboration features
- API rate limiting and analytics

📌 **Optimizations**
- Implement background job processing for large repositories
- Add caching layer (Redis) for frequently scanned repos
- Optimize dependency scanning performance
- Parallel check execution

📌 **Integrations**
- GitHub App integration for automatic scanning on push
- JIRA integration for issue creation
- Slack bot for scan notifications
- SonarQube integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Yash Kashyap**

- GitHub: [@yash120704](https://github.com/yash120704)
- Email: yash@example.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Database & Authentication
- [Django REST Framework](https://www.django-rest-framework.org/) - API Framework
- [Vercel](https://vercel.com/) - Frontend Hosting
- [Render](https://render.com/) - Backend Hosting
- [Upstash](https://upstash.com/) - Redis Hosting

---

## 📞 Support

If you encounter any issues:

1. Check the [SETUP.md](./SETUP.md) guide
2. Review [RESEARCH_PAPER.md](./RESEARCH_PAPER.md) for architecture details
3. Open an issue on GitHub
4. Contact: yash@example.com

---

**Happy Scanning! 🔒**
