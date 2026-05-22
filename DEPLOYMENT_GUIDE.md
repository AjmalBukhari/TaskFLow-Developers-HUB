# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB
- Git repository
- Deployment platform account (Railway, Render, Vercel, etc.)

## Environment Setup

### Backend Environment Variables

Create `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task-manager
JWT_SECRET=your-production-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend Environment Variables

For production, update the API base URL in `frontend/src/services/api.js`:

```javascript
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-domain.com/api' });
```

Or create `.env` in `frontend/`:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Option 1: Deploy to Railway (Recommended)

### Backend

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Select `backend` as root directory
5. Add environment variables in Railway dashboard
6. Railway auto-detects Node.js and runs `npm install && npm start`
7. Note the Railway-provided URL

### Frontend

1. In same Railway project, add another service
2. Select `frontend` as root directory
3. Set build command: `npm run build`
4. Set start command: `npx serve -s build`
5. Add environment variable: `REACT_APP_API_URL` = backend URL
6. Deploy

### Database

1. Add MongoDB plugin in Railway
2. Copy connection string
3. Set as `MONGO_URI` in backend environment

## Option 2: Deploy to Render

### Backend

1. Create new Web Service on Render
2. Connect GitHub repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables

### Frontend

1. Create new Static Site on Render
2. Connect GitHub repo
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `build`
6. Add environment variables

## Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

### Backend on Railway
Follow Option 1 backend steps.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `REACT_APP_API_URL`
5. Deploy

## Option 4: Self-Hosted (VPS)

### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

### Deploy Backend

```bash
cd /var/www
git clone <your-repo>
cd task-manager/backend
npm install --production

# Create .env
nano .env
# Add environment variables

# Start with PM2
pm2 start server.js --name task-manager-api
pm2 save
pm2 startup
```

### Deploy Frontend

```bash
cd /var/www/task-manager/frontend
npm install
npm run build

# Serve with Nginx
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/task-manager
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/task-manager/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Option 5: Docker Deployment

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/task-manager
      - JWT_SECRET=your-secret
      - CORS_ORIGIN=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

```bash
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] CORS configured for frontend domain
- [ ] SSL certificate installed
- [ ] Socket.IO working with production URL
- [ ] File uploads working
- [ ] Email notifications (if added)
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Monitoring set up (Sentry, LogRocket, etc.)

## Monitoring

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - Performance monitoring
- **UptimeRobot** - Uptime monitoring

### Health Check Endpoint

Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
```
