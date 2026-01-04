/**
 * Better Auth Server Configuration
 *
 * Server-side authentication configuration for Next.js with Neon PostgreSQL.
 * This file creates the Better Auth instance with database connection.
 * Includes JWT plugin for FastAPI backend integration.
 */

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

// Create PostgreSQL connection pool for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 10, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000ms to 10000ms
});

// Create Better Auth instance
export const auth = betterAuth({
  database: pool,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // Can be enabled later
  },

  // Session configuration
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Refresh every 24 hours
  },

  // JWT plugin for FastAPI backend integration
  // Tokens are signed with BETTER_AUTH_SECRET
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d", // Same as session expiration
      }
    })
  ],

  // Next.js compatibility
  trustedOrigins: [
    "http://localhost:3000",
    // Add production domain when ready
    // "https://yourdomain.com"
  ],

  // Custom user fields (optional)
  user: {
    additionalFields: {
      // Add any custom user fields here
      // educationLevel: { type: 'string', required: false },
      // programmingExperience: { type: 'string', required: false },
    },
  },
});