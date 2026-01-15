const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const fixTables = async () => {
  console.log('Fixing Better Auth tables...');

  const queries = [
    // Drop existing tables
    'DROP TABLE IF EXISTS "verification" CASCADE;',
    'DROP TABLE IF EXISTS "account" CASCADE;',
    'DROP TABLE IF EXISTS "session" CASCADE;',
    'DROP TABLE IF EXISTS "user" CASCADE;',

    // User Table (with TEXT id)
    `CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN DEFAULT FALSE,
      "image" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Session Table
    `CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT
    );`,

    // Account Table
    `CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "providerId" TEXT NOT NULL,
      "accountId" TEXT NOT NULL,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
      "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE("userId", "providerId")
    );`,

    // Verification Table
    `CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("userId");`,
    `CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);`,
    `CREATE INDEX IF NOT EXISTS idx_account_user_provider ON "account"("userId", "providerId");`,
    `CREATE INDEX IF NOT EXISTS idx_account_provider_account ON "account"("providerId", "accountId");`,
    `CREATE INDEX IF NOT EXISTS idx_verification_token ON "verification"(token);`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
      const shortQuery = query.substring(0, 60) + (query.length > 60 ? '...' : '');
      console.log('✓ Executed:', shortQuery);
    }
    console.log('✅ All tables fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing tables:', error.message);
  } finally {
    await pool.end();
  }
};

fixTables();