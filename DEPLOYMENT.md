# 🚀 Deployment Guide

This guide will help you deploy the Warung HPP Calculator application.

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MySQL 8.0+
- Git
- Vercel account (for frontend deployment)
- Render/Cloud Run account (for backend deployment)

## 🗄️ Database Setup

### Local Development

1. Install MySQL:
   - **Windows**: Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - **macOS**: `brew install mysql`
   - **Linux**: `sudo apt-get install mysql-server`

2. Start MySQL service:

   ```bash
   # macOS/Linux
   sudo service mysql start
   # or
   sudo systemctl start mysql

   # Windows
   # MySQL runs as a service automatically
   ```

3. Create database:

   ```bash
   mysql -u root -p
   ```

   Then run:

   ```sql
   CREATE DATABASE warung_hpp;
   USE warung_hpp;
   SOURCE c:/github/warung/database/schema.sql;
   ```

### Production Database

For production, use a managed MySQL service:

- **PlanetScale**: Free tier available
- **AWS RDS**: Scalable and reliable
- **Google Cloud SQL**: Good integration with GCP
- **DigitalOcean Managed Databases**: Affordable option

## 🔧 Backend Deployment (Render)

### Option 1: Render (Recommended)

1. Push code to GitHub

2. Create `render.yaml` in backend directory:

   ```yaml
   services:
     - type: web
       name: warung-hpp-api
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: DB_HOST
           sync: false
         - key: DB_PORT
           sync: false
         - key: DB_NAME
           sync: false
         - key: DB_USER
           sync: false
         - key: DB_PASSWORD
           sync: false
         - key: SECRET_KEY
           generateValue: true
   ```

3. Go to [render.com](https://render.com) and:
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select `backend` folder as root directory
   - Configure environment variables
   - Deploy!

### Option 2: Google Cloud Run

1. Build and push Docker image:

   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/PROJECT_ID/warung-hpp-api
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy warung-hpp-api \
     --image gcr.io/PROJECT_ID/warung-hpp-api \
     --platform managed \
     --region REGION \
     --allow-unauthenticated
   ```

## 🌐 Frontend Deployment (Vercel)

### Option 1: Vercel (Recommended)

1. Push code to GitHub

2. Go to [vercel.com](https://vercel.com) and:
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `frontend`
     - Environment Variables:
       - `NEXT_PUBLIC_API_URL`: Your backend URL
   - Deploy!

### Option 2: Netlify

1. Install Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=.next
   ```

## 🔐 Environment Variables

### Backend (.env)

```env
DB_HOST=your-db-host.com
DB_PORT=3306
DB_NAME=warung_hpp
DB_USER=your-db-user
DB_PASSWORD=your-db-password
APP_NAME=Warung HPP API
APP_VERSION=1.0.0
DEBUG=False
CORS_ORIGINS=https://your-frontend-url.com
SECRET_KEY=your-secret-key-here
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=Warung HPP Calculator
```

## 🧪 Testing

### Local Testing

1. Start MySQL:

   ```bash
   sudo service mysql start
   ```

2. Start backend:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. Start frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Test at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Testing

1. Test API endpoints:

   ```bash
   curl https://your-backend-url.com/
   curl https://your-backend-url.com/api/products
   ```

2. Test frontend:
   - Open https://your-frontend-url.com
   - Test calculator functionality
   - Verify API calls work

## 📊 Monitoring

### Backend Monitoring

- **Render**: Built-in metrics and logs
- **Google Cloud**: Cloud Monitoring
- **Custom**: Add Sentry for error tracking

### Frontend Monitoring

- **Vercel Analytics**: Built-in
- **Google Analytics**: Add to `app/layout.tsx`
- **Sentry**: For error tracking

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords, restrict access
3. **API**: Enable HTTPS, rate limiting
4. **CORS**: Only allow trusted origins
5. **Secrets**: Rotate regularly, use secret management

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/v1/services/srv-xxx/deploys \
            -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Check firewall rules

2. **CORS Errors**
   - Update `CORS_ORIGINS` in backend `.env`
   - Include frontend URL

3. **Build Fails**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`

4. **API Not Responding**
   - Check backend logs
   - Verify environment variables
   - Test API health endpoint

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

## 🆘 Support

For issues:

1. Check logs in Render/Vercel dashboard
2. Review this documentation
3. Open an issue on GitHub
