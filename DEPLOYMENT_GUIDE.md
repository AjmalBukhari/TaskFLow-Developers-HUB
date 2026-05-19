# TaskFlow Deployment Guide

## Overview

This comprehensive deployment guide provides step-by-step instructions for deploying the TaskFlow application to various environments. The guide covers deployment strategies, configuration, monitoring, and maintenance procedures for both frontend and backend components.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [SSL/HTTPS Configuration](#ssl-https-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling & Performance](#scaling--performance)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance](#maintenance)

---

## Prerequisites

### System Requirements

#### Development Environment
- **Node.js**: v18.x or higher
- **npm**: v8.x or higher
- **MongoDB**: v5.0 or higher (local development)
- **Git**: v2.30 or higher

#### Production Environment
- **Server**: Ubuntu 20.04 LTS or CentOS 8
- **Node.js**: v18.x LTS
- **MongoDB**: v5.0+ (recommended) or PostgreSQL 13+
- **Nginx**: v1.18+ (for reverse proxy)
- **Docker**: v20.10+ (for containerization)
- **Docker Compose**: v2.0+ (for orchestration)

### Infrastructure Requirements

#### Minimum Production Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 10Mbps

#### Recommended Production Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Bandwidth**: 100Mbps
- **Load Balancer**: HAProxy or Nginx
- **Monitoring**: Prometheus + Grafana

---

## Environment Setup

### Development Environment

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/taskflow.git
cd taskflow
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### 4. Environment Variables
Create `.env` files for both backend and frontend:

**Backend (.env)**
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

#### 5. Start Development Servers
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm start
```

### Production Environment

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install nginx -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### 2. Application Setup
```bash
# Create application directory
sudo mkdir -p /opt/taskflow
sudo chown -R $USER:$USER /opt/taskflow

# Clone repository
cd /opt/taskflow
git clone https://github.com/your-org/taskflow.git .

# Install dependencies
cd backend
npm ci --only=production
cd ../frontend
npm ci --only=production
```

---

## Backend Deployment

### Option 1: Direct Deployment

#### 1. Build Backend
```bash
cd /opt/taskflow/backend
npm run build
```

#### 2. Create System Service
```bash
# Create systemd service file
sudo nano /etc/systemd/system/taskflow.service
```

```ini
[Unit]
Description=TaskFlow Backend Service
After=network.target mongod.service

[Service]
Type=simple
User=taskflow
WorkingDirectory=/opt/taskflow/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=MONGO_URI=mongodb://localhost:27017/taskflow
Environment=JWT_SECRET=your-production-secret-key
Environment=CORS_ORIGIN=https://your-domain.com

[Install]
WantedBy=multi-user.target
```

#### 3. Start Service
```bash
# Create user
sudo useradd -r -s /bin/false taskflow

# Set permissions
sudo chown -R taskflow:taskflow /opt/taskflow/backend

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable taskflow
sudo systemctl start taskflow

# Check status
sudo systemctl status taskflow
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S taskmanager -u 1001

# Change ownership
USER taskmanager

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

#### 2. Build Docker Image
```bash
cd /opt/taskflow/backend
docker build -t taskflow/backend:latest .
```

#### 3. Run Docker Container
```bash
docker run -d \
  --name taskflow-backend \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  taskflow/backend:latest
```

### Option 3: Kubernetes Deployment

#### 1. Create Kubernetes Manifests
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-backend
  labels:
    app: taskflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow-backend
  template:
    metadata:
      labels:
        app: taskflow-backend
    spec:
      containers:
      - name: backend
        image: taskflow/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
      restartPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: taskflow-backend-service
spec:
  selector:
    app: taskflow-backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

#### 2. Apply Manifests
```bash
kubectl apply -f k8s/backend-deployment.yaml
```

---

## Frontend Deployment

### Option 1: Static File Deployment

#### 1. Build Frontend
```bash
cd /opt/taskflow/frontend
npm run build
```

#### 2. Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/taskflow
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /opt/taskflow/frontend/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache HTML files
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO proxy
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nginx -u 1001

# Change ownership
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Start the application
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Build and Run
```bash
# Build image
cd /opt/taskflow/frontend
docker build -t taskflow/frontend:latest .

# Run container
docker run -d \
  --name taskflow-frontend \
  -p 80:80 \
  --restart unless-stopped \
  taskflow/frontend:latest
```

### Option 3: Kubernetes Deployment

#### 1. Create Kubernetes Manifests
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-frontend
  labels:
    app: taskflow-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: taskflow-frontend
  template:
    metadata:
      labels:
        app: taskflow-frontend
    spec:
      containers:
      - name: frontend
        image: taskflow/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      restartPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: taskflow-frontend-service
spec:
  selector:
    app: taskflow-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

#### 2. Apply Manifests
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

---

## Database Setup

### MongoDB Setup

#### 1. Install MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# CentOS/RHEL
sudo yum install -y mongodb-org
```

#### 2. Configure MongoDB
```bash
# Create configuration file
sudo nano /etc/mongod.conf
```

```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
net:
  port: 27017
  bindIp: 127.0.0.1
security:
  authorization: enabled
  # Enable in production
  # authorization: enabled
operationProfiling:
  slowOpThresholdMs: 100
  mode: all
```

#### 3. Start MongoDB
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

#### 4. Create Database and User
```bash
# Connect to MongoDB
mongosh

# Create database and user
use taskflow
db.createUser({
  user: "taskflow_user",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "taskflow" },
    { role: "dbAdmin", db: "taskflow" }
  ]
})

# Exit
exit
```

#### 5. Enable Authentication
```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf

# Add security section
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

### PostgreSQL Setup (Alternative)

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server
sudo postgresql-setup initdb
```

#### 2. Configure PostgreSQL
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb taskflow
sudo -u postgres psql -c "CREATE USER taskflow_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflow_user;"
```

#### 3. Configure Authentication
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/13/main/postgresql.conf

# Listen on all interfaces
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add line
host    taskflow        taskflow_user        0.0.0.0/0              md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Environment Configuration

### Production Environment Variables

#### Backend (.env.production)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://taskflow_user:your_secure_password@localhost:27017/taskflow?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
LOG_FILE=/var/log/taskflow.log
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
REACT_APP_ENV=production
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### SSL/HTTPS Configuration

#### 1. Obtain SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 2. Configure Nginx for HTTPS
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Other configuration...
}
```

---

## Monitoring & Logging

### Application Monitoring

#### 1. Prometheus Setup
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'taskflow-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'taskflow-frontend'
    static_configs:
      - targets: ['localhost:80']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

#### 2. Grafana Dashboard
```bash
# Install Grafana
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access Grafana
# http://your-server-ip:3000
# admin/admin
```

### Logging Configuration

#### 1. Backend Logging
```javascript
// logger.js
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'taskflow-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

#### 2. Log Rotation
```bash
# Install logrotate
sudo apt-get install logrotate

# Create logrotate configuration
sudo nano /etc/logrotate.d/taskflow
```

```
/opt/taskflow/backend/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 taskflow taskflow
    postrotate
        systemctl reload taskflow
    endscript
}
```

### Health Checks

#### 1. Backend Health Check
```javascript
// health.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
```

#### 2. Frontend Health Check
```javascript
// public/health.html
<!DOCTYPE html>
<html>
<head>
    <title>TaskFlow Health Check</title>
</head>
<body>
    <h1>TaskFlow Frontend</h1>
    <p>Status: <span id="status">Checking...</span></p>
    <script>
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('status').textContent = data.status;
            })
            .catch(error => {
                document.getElementById('status').textContent = 'Error';
            });
    </script>
</body>
</html>
```

---

## Scaling & Performance

### Horizontal Scaling

#### 1. Load Balancer Setup
```nginx
# /etc/nginx/conf.d/load-balancer.conf
upstream taskflow_backend {
    least_conn;
    server 10.0.1.10:5000 weight=3;
    server 10.0.1.11:5000 weight=3;
    server 10.0.1.12:5000 weight=3;
}

upstream taskflow_frontend {
    least_conn;
    server 10.0.2.10:80 weight=2;
    server 10.0.2.11:80 weight=2;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://taskflow_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://taskflow_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. Auto Scaling with Kubernetes
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: taskflow-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: taskflow-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

#### 1. MongoDB Replica Set
```bash
# Configure replica set
mongosh --eval "
rs.initiate({
  _id: 'taskflow-replica',
  members: [
    { _id: 0, host: '10.0.3.10:27017' },
    { _id: 1, host: '10.0.3.11:27017' },
    { _id: 2, host: '10.0.3.12:27017', arbiterOnly: true }
  ]
})
"
```

#### 2. Connection Pooling
```javascript
// database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Caching Strategy

#### 1. Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

```
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

```bash
# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### 2. Redis Integration
```javascript
// cache.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    
    try {
      const cachedData = await client.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = { cache, client };
```

---

## Backup & Recovery

### Database Backup

#### 1. MongoDB Backup
```bash
# Create backup script
nano /opt/taskflow/scripts/backup-mongodb.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/taskflow/backups/mongodb"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="taskflow"

mkdir -p $BACKUP_DIR

mongodump --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB \
  --out $BACKUP_DIR/mongodb_$DATE

tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE

rm -rf $BACKUP_DIR/mongodb_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/mongodb_$DATE.tar.gz"
```

```bash
# Make script executable
chmod +x /opt/taskflow/scripts/backup-mongodb.sh

# Add to crontab
crontab -e
```

```
# Daily backup at 2 AM
0 2 * * * /opt/taskflow/scripts/backup-mongodb.sh
```

#### 2. PostgreSQL Backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/taskflow/backups/postgresql"
DB_NAME="taskflow"
DB_USER="taskflow_user"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/postgresql_$DATE.sql

gzip $BACKUP_DIR/postgresql_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "postgresql_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/postgresql_$DATE.sql.gz"
```

### Application Backup

#### 1. Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/taskflow/backups/application"
APP_DIR="/opt/taskflow"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/application_$DATE.tar.gz -C $APP_DIR .

# Backup environment files
cp $APP_DIR/backend/.env $BACKUP_DIR/backend_env_$DATE.env
cp $APP_DIR/frontend/.env $BACKUP_DIR/frontend_env_$DATE.env

# Keep only last 7 days of backups
find $BACKUP_DIR -name "application_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*_env_*.env" -mtime +7 -delete

echo "Application backup completed: $BACKUP_DIR/application_$DATE.tar.gz"
```

### Recovery Procedures

#### 1. Database Recovery
```bash
# MongoDB Recovery
mongorestore --host localhost --port 27017 --db taskflow /opt/taskflow/backups/mongodb/mongodb_20240120_020000/taskflow

# PostgreSQL Recovery
gunzip /opt/taskflow/backups/postgresql/postgresql_20240120_020000.sql.gz
psql -h localhost -U taskflow_user -d taskflow < /opt/taskflow/backups/postgresql/postgresql_20240120_020000.sql
```

#### 2. Application Recovery
```bash
# Stop services
sudo systemctl stop taskflow
sudo systemctl stop nginx

# Restore application
tar -xzf /opt/taskflow/backups/application/application_20240120_020000.tar.gz -C /opt/taskflow

# Restore environment files
cp /opt/taskflow/backups/backend_env_20240120_020000.env /opt/taskflow/backend/.env
cp /opt/taskflow/backups/frontend_env_20240120_020000.env /opt/taskflow/frontend/.env

# Start services
sudo systemctl start taskflow
sudo systemctl start nginx
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
sudo journalctl -u taskflow -f

# Check dependencies
cd /opt/taskflow/backend
npm install

# Check environment variables
cat .env

# Check port availability
netstat -tulpn | grep :5000
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh "mongodb://localhost:27017/taskflow"

# Check network connectivity
telnet localhost 27017
```

#### 3. Frontend Issues
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
sudo tail -f /var/log/nginx/access.log

# Test frontend access
curl -I http://localhost
```

### Debug Mode

#### 1. Backend Debug Mode
```bash
# Enable debug logging
export DEBUG=taskflow:*
npm run dev

# Or in production
export LOG_LEVEL=debug
sudo systemctl restart taskflow
```

#### 2. Database Debug Mode
```bash
# MongoDB debug
mongosh --eval "db.setLogLevel(2)"

# PostgreSQL debug
sudo -u postgres psql -c "SET log_statement = 'all';"
```

### Performance Issues

#### 1. Slow API Responses
```bash
# Check system resources
top
htop
free -h

# Check database performance
mongosh --eval "db.runCommand({currentOp: 1})"

# Check application performance
node --inspect server.js
```

#### 2. Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check Node.js memory
node --inspect server.js
# Then open Chrome DevTools to analyze memory
```

---

## Maintenance

### Regular Maintenance Tasks

#### 1. System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Update MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### 2. Application Updates
```bash
# Update application code
cd /opt/taskflow
git pull origin main

# Update dependencies
cd backend && npm update
cd ../frontend && npm update

# Rebuild application
cd backend && npm run build
cd ../frontend && npm run build

# Restart services
sudo systemctl restart taskflow
sudo systemctl restart nginx
```

#### 3. Database Maintenance
```bash
# MongoDB maintenance
mongosh --eval "
db.runCommand({compact: 'tasks'})
db.runCommand({repairDatabase: 1})
"

# PostgreSQL maintenance
sudo -u postgres vacuumdb --analyze taskflow
sudo -u postgres reindexdb taskflow
```

### Log Management

#### 1. Log Rotation
```bash
# Check log rotation
sudo logrotate -f /etc/logrotate.d/taskflow

# Monitor log sizes
du -sh /var/log/taskflow*
du -sh /opt/taskflow/backups/*
```

#### 2. Log Analysis
```bash
# Analyze application logs
grep "ERROR" /var/log/taskflow.log | tail -20

# Analyze access logs
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Monitor error rates
grep "ERROR" /var/log/taskflow.log | wc -l
```

### Security Maintenance

#### 1. Security Updates
```bash
# Update system security packages
sudo apt-get update
sudo apt-get upgrade --with-new-pkgs

# Check for security vulnerabilities
npm audit
npm audit fix

# Update SSL certificates
sudo certbot renew --dry-run
sudo certbot renew
```

#### 2. User Management
```bash
# Update user passwords
passwd taskflow

# Review user permissions
ls -la /opt/taskflow

# Check file permissions
find /opt/taskflow -type f -exec ls -la {} \;
```

### Performance Monitoring

#### 1. System Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor disk usage
df -h
du -sh /opt/taskflow/*

# Monitor network connections
netstat -tulpn
ss -tulpn
```

#### 2. Application Monitoring
```bash
# Monitor application performance
pm2 list
pm2 monit

# Monitor database performance
mongosh --eval "db.runCommand({serverStatus: 1})"

# Monitor API response times
curl -o /dev/null -s -w '%{time_total}\n' http://localhost:5000/api/health
```

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying and maintaining the TaskFlow application in production environments. The guide covers:

1. **Environment Setup**: Development and production environment configuration
2. **Deployment Options**: Multiple deployment strategies (direct, Docker, Kubernetes)
3. **Database Setup**: MongoDB and PostgreSQL configuration
4. **Security**: SSL/HTTPS configuration and security best practices
5. **Monitoring**: Application and system monitoring setup
6. **Scaling**: Horizontal scaling and performance optimization
7. **Backup & Recovery**: Database and application backup procedures
8. **Troubleshooting**: Common issues and debugging techniques
9. **Maintenance**: Regular maintenance tasks and procedures

Following this guide will ensure a successful deployment and ongoing maintenance of the TaskFlow application in production environments.

### Best Practices

1. **Always backup** before making changes
2. **Test in staging** before deploying to production
3. **Monitor performance** regularly
4. **Keep systems updated** with security patches
5. **Document changes** and procedures
6. **Have a disaster recovery plan** in place
7. **Regular security audits** and vulnerability assessments
8. **Performance testing** before major releases

### Support

For deployment support and questions:
- Email: support@taskflow.com
- Documentation: https://docs.taskflow.com
- Status Page: https://status.taskflow.com
- Community: https://community.taskflow.com

---

## Appendix

### A. Quick Reference Commands

#### System Commands
```bash
# System information
uname -a
uptime
free -h
df -h
top

# Network
ip addr show
netstat -tulpn
ss -tulpn

# Process management
systemctl status taskflow
journalctl -u taskflow -f
```

#### Application Commands
```bash
# Backend
cd /opt/taskflow/backend
npm start
npm run dev
npm test

# Frontend
cd /opt/taskflow/frontend
npm start
npm run build
npm test

# Database
mongosh
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```

#### Docker Commands
```bash
# Build and run
docker build -t taskflow/backend:latest .
docker run -d --name taskflow-backend -p 5000:5000 taskflow/backend:latest

# Manage containers
docker ps
docker logs taskflow-backend
docker restart taskflow-backend
docker stop taskflow-backend
```

### B. Configuration Templates

#### Nginx Configuration Template
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /path/to/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Docker Compose Template
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/taskflow
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### C. Monitoring Dashboard Setup

#### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'taskflow-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'taskflow-frontend'
    static_configs:
      - targets: ['localhost:80']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

#### Grafana Dashboard JSON
```json
{
  "dashboard": {
    "title": "TaskFlow Monitoring",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_ms_sum{job=\"taskflow-backend\"} / http_request_duration_ms_count{job=\"taskflow-backend\"}",
            "legendFormat": "Response Time"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"taskflow-backend\"}[5m])",
            "legendFormat": "Requests per second"
          }
        ]
      }
    ]
  }
}
```