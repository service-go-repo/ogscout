# Docker Setup Guide

## Environment Variables Setup

This project uses environment variables for configuration. Follow these steps:

### 1. For Local Development (without Docker)
Use `.env.local` file - this is already configured and working.

### 2. For Docker Deployment

#### Step 1: Configure Environment Variables
Copy your environment variables to `.env.production`:

```bash
# The .env.production file has been created with your values
# Update any production-specific values as needed
```

**Important Notes:**
- `.env.production` is **NOT** committed to git (for security)
- The `MONGODB_URI` in `.env.production` should use `mongodb://mongodb:27017/repair-connect` (Docker service name)
- Update `NEXTAUTH_URL` to your production domain when deploying

#### Step 2: Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

#### Step 3: Access the Application
- Application: http://localhost:3000
- MongoDB: localhost:27017

## Environment Variables Reference

Required variables in `.env.production`:

### Authentication
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Full URL of your application

### Database
- `MONGODB_URI` - MongoDB connection string

### Cloudinary (File Uploads)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### Email (Optional)
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### Google Maps (Optional)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Troubleshooting

### Issue: "Invalid/Missing environment variable"
**Solution:** Make sure `.env.production` file exists and contains all required variables.

### Issue: Cannot connect to MongoDB
**Solution:**
1. Check if MongoDB container is running: `docker ps`
2. Wait for MongoDB to be healthy (check logs: `docker-compose logs mongodb`)
3. Ensure `MONGODB_URI` uses the Docker service name: `mongodb://mongodb:27017/repair-connect`

### Issue: Build fails
**Solution:**
1. Clean Docker cache: `docker-compose down -v`
2. Remove old images: `docker image prune -a`
3. Rebuild: `docker-compose up --build`

## Security Notes

⚠️ **Never commit these files to version control:**
- `.env.local`
- `.env.production`
- Any file containing real API keys or secrets

✅ **Safe to commit:**
- `.env.example` (template with placeholder values)
- `docker-compose.yml`
- `Dockerfile`
