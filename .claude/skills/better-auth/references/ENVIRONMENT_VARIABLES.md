# Better Auth Environment Variables Reference

Complete reference for all environment variables used in Better Auth projects.

## Required Variables

```bash
# Database connection string
DATABASE_URL="postgresql://user:password@host:5432/database"

# Secret for signing sessions (32+ characters recommended)
# Use either BETTER_AUTH_SECRET or JWT_SECRET
BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-chars"
# or
JWT_SECRET="your-super-secret-key-at-least-32-chars"
```

## Cross-Origin Configuration

```bash
# URLs allowed to make requests (CORS)
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

# Production example
FRONTEND_URL="https://myapp.com"
BACKEND_URL="https://api.myapp.com"
```

## Social Providers (Optional)

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Apple Sign In
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

## Email Configuration (Optional)

```bash
# SMTP settings for email verification / password reset
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Production Settings

```bash
# Node environment
NODE_ENV="production"

# Server port
PORT="3001"
```

## Example .env File

```bash
# Required
DATABASE_URL="postgresql://user:pass@host:5432/mydb?sslmode=require"
BETTER_AUTH_SECRET="use-a-random-32-character-string-here"

# CORS
FRONTEND_URL="https://myapp.com"

# Optional: Social Login
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Production
NODE_ENV="production"
PORT="3001"
```

## Security Notes

> **⚠️ Important**
> - Never commit `.env` files to version control
> - Use different secrets for development and production
> - Rotate secrets periodically
> - Use `secure: true` for cookies in production (HTTPS only)
