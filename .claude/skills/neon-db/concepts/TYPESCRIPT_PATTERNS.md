# TypeScript/Node.js Patterns for Neon PostgreSQL

## Connection Pool Setup

The standard pattern for connecting to Neon PostgreSQL from TypeScript/Node.js:

```typescript
import { Pool } from 'pg';

// Create a connection pool for Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon SSL
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };
```

## Pool Configuration Options

| Option | Description | Recommended Value |
|--------|-------------|-------------------|
| `max` | Maximum pool clients | 20 |
| `idleTimeoutMillis` | Close idle connections after | 30000 (30s) |
| `connectionTimeoutMillis` | Connection timeout | 2000 (2s) |
| `ssl.rejectUnauthorized` | Accept self-signed certs | false (for Neon) |

---

## Better Auth Integration

When using with Better Auth, pass the pool directly:

```typescript
import { betterAuth } from 'better-auth';
import { pool } from './database/neon';

export const auth = betterAuth({
  database: pool,
  secret: process.env.JWT_SECRET || 'your-secret',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      educationLevel: { type: 'string', required: false },
      programmingExperience: { type: 'string', required: false },
    },
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
});
```

---

## Query Patterns

### Basic Query

```typescript
const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [userId]);
const user = result.rows[0];
```

### Transaction Pattern

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query('INSERT INTO "user" (id, name) VALUES ($1, $2)', [id, name]);
  await client.query('INSERT INTO "session" ("userId") VALUES ($1)', [id]);
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## Error Handling

```typescript
try {
  const result = await pool.query('SELECT * FROM "user"');
} catch (error) {
  if (error.code === '42P01') {
    // Table doesn't exist
    console.error('Table not found, run migrations');
  } else if (error.code === '23505') {
    // Unique constraint violation
    console.error('Duplicate key');
  } else {
    throw error;
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `42P01` | Undefined table |
| `23505` | Unique violation |
| `23503` | Foreign key violation |
| `08P01` | Protocol violation |
| `28P01` | Invalid password |

---

## Express.js Middleware Order

> ⚠️ **IMPORTANT**: When using with Better Auth, middleware order matters!

```typescript
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';

const app = express();

// 1. CORS must be FIRST
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// 2. Auth handler BEFORE body parsers
app.all('/api/auth/*', toNodeHandler(auth));

// 3. Body parsers AFTER auth
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```
