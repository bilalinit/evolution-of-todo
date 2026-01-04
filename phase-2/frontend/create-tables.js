const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const createTables = async () => {
  console.log('Creating Better Auth tables...');

  const queries = [
    // User Table
    `CREATE TABLE IF NOT EXISTS "user" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN DEFAULT FALSE,
      "image" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Session Table
    `CREATE TABLE IF NOT EXISTS "session" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    // Account Table
    `CREATE TABLE IF NOT EXISTS "account" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "provider" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "expiresAt" TIMESTAMP WITH TIME ZONE,
      UNIQUE("userId", provider)
    );`,

    // Verification Table
    `CREATE TABLE IF NOT EXISTS "verification" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL
    );`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("userId");`,
    `CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);`,
    `CREATE INDEX IF NOT EXISTS idx_account_user_provider ON "account"("userId", provider);`,
    `CREATE INDEX IF NOT EXISTS idx_verification_token ON "verification"(token);`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
      console.log('✓ Executed:', query.substring(0, 50) + '...');
    }
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
};

createTables();