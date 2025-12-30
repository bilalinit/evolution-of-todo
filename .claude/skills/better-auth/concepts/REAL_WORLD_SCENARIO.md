# Better Auth - Real World Scenarios

## Scenario 1: Next.js SaaS Application with Multi-Tenant Support

### Problem
A SaaS company needs to implement secure authentication with organization support, role-based access control, and social login for their Next.js application while ensuring data isolation between tenants.

### Solution
```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    accountModel: {
      additionalFields: {
        company: {
          type: "string",
          required: true,
        },
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Only allow paying customers to create organizations
        return user.hasActiveSubscription;
      },
      defaultRole: "member",
      roles: ["owner", "admin", "member"],
    }),
  ],
});

// lib/auth/client.ts
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [
    organizationClient()
  ]
});

// app/api/auth/[...auth]/route.ts
import { auth } from "@/lib/auth/auth";

export const {
  GET,
  POST
} = auth.handler;
```

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export default auth.middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/(api/auth)(.*)",
  ],
};
```

## Scenario 2: E-commerce Platform with Customer and Admin Authentication

### Problem
An e-commerce platform needs separate authentication systems for customers and administrators with different permissions, session management, and security requirements.

### Solution
```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expires: 7 * 24 * 60 * 60 * 1000, // 7 days for regular users
    slidingExpiration: true,
  },
  plugins: [
    admin({
      adminRoles: ["admin", "superadmin"],
      adminSessionExpiresIn: 2 * 60 * 60 * 1000, // 2 hours for admin sessions
    }),
  ],
});

// Custom role-based middleware
export const adminMiddleware = auth.middleware.extend({
  async middleware(ctx) {
    const session = await auth.$ctx.getSession(ctx.request);
    if (!session || !session.user?.role || !["admin", "superadmin"].includes(session.user.role)) {
      return new Response("Unauthorized", { status: 401 });
    }
    return ctx.next();
  },
});
```

```typescript
// components/auth/CustomerAuth.tsx
"use client";
import { useAuth } from "better-auth/react";
import { useState } from "react";

export function CustomerAuth() {
  const { signIn, signUp, signOut, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const result = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (!result?.error) {
      // Redirect to dashboard
    }
  };

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome, {session.user.name}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      )}
    </div>
  );
}
```

## Scenario 3: Mobile App with Cross-Platform Authentication

### Problem
A mobile app needs to support authentication across iOS, Android, and web platforms with a consistent user experience and secure token management.

### Solution
```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
  session: {
    expires: 30 * 24 * 60 * 60 * 1000, // 30 days for mobile
    updateAge: 24 * 60 * 60 * 1000, // Refresh every 24 hours
  },
  rateLimit: {
    window: 60000, // 1 minute
    max: 10, // 10 requests per minute
  },
});

// lib/auth/client.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.myapp.com",
});
```

```typescript
// services/authService.ts
import { authClient } from "@/lib/auth/client";

class AuthService {
  async signInWithEmail(email: string, password: string) {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });
      return response;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  async signOut() {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await authClient.getSession();
      return response?.session?.user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
```

## Scenario 4: Enterprise Application with SSO and MFA

### Problem
An enterprise application requires Single Sign-On (SSO) integration with existing corporate identity providers and mandatory multi-factor authentication for enhanced security.

### Solution
```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { saml } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expires: 8 * 60 * 60 * 1000, // 8 hours for enterprise
  },
  plugins: [
    saml({
      idp: {
        metadata: process.env.SAML_IDP_METADATA_URL,
        cert: process.env.SAML_IDP_CERT,
      },
      sp: {
        entityId: process.env.SAML_ENTITY_ID,
        callbackUrl: process.env.SAML_CALLBACK_URL,
      },
    }),
    twoFactor({
      issuer: "MyEnterpriseApp",
      window: 1, // Allow one previous token
    }),
  ],
});

// Custom enterprise middleware
export const enterpriseMiddleware = auth.middleware.extend({
  async middleware(ctx) {
    const session = await auth.$ctx.getSession(ctx.request);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if user has completed 2FA
    if (session.user.twoFactorEnabled && !session.user.twoFactorVerified) {
      // Redirect to 2FA verification page
      return Response.redirect(new URL("/verify-2fa", ctx.request.url));
    }

    return ctx.next();
  },
});
```

```typescript
// components/auth/TwoFactorAuth.tsx
"use client";
import { useAuth } from "better-auth/react";
import { useState } from "react";

export function TwoFactorAuth() {
  const { session } = useAuth();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const verifyToken = async () => {
    try {
      const result = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (result.ok) {
        // Redirect to dashboard
      } else {
        setError("Invalid token");
      }
    } catch (err) {
      setError("Verification failed");
    }
  };

  if (!session?.user?.twoFactorEnabled) {
    return null; // Don't show if 2FA not enabled
  }

  return (
    <div className="two-factor-container">
      <h2>Two-Factor Authentication</h2>
      <p>Please enter your authentication code</p>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="123456"
        maxLength={6}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={verifyToken}>Verify</button>
    </div>
  );
}
```

## Scenario 5: Multi-tenant SaaS with Custom Branding

### Problem
A multi-tenant SaaS platform needs to support different authentication configurations, branding, and user management per tenant while maintaining security and data isolation.

### Solution
```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    // Providers configured per tenant
  },
  account: {
    accountModel: {
      additionalFields: {
        tenantId: {
          type: "string",
          required: true,
        },
        tenantConfig: {
          type: "json",
          required: false,
        },
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Check tenant permissions
        const tenant = await getTenantById(user.tenantId);
        return tenant.allowOrgCreation;
      },
    }),
  ],
});

// lib/tenantAuth.ts
import { auth } from "./auth";

export function createTenantAuth(tenantId: string) {
  return auth.extend({
    hooks: {
      beforeAuth: [
        {
          middleware: async (ctx) => {
            // Validate tenant-specific configurations
            const tenant = await getTenantById(tenantId);
            if (!tenant.isActive) {
              return new Response("Tenant not active", { status: 403 });
            }
            return ctx.next();
          },
        },
      ],
    },
  });
}
```

## Scenario 6: Express Auth Server with Separate Frontend (Docusaurus/React/Vue)

### Problem
A project requires a standalone authentication server separate from the frontend application. The frontend (React, Vue, Docusaurus, etc.) runs on a different domain/port and needs to communicate with the auth server via API calls.

### Solution

#### Auth Server (auth.ts)
```typescript
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.JWT_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      companyId: { type: 'string', required: false },
      role: { type: 'string', required: false },
    },
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
    updateAge: 24 * 60 * 60,
    cookieCache: { enabled: false },
  },
  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  },
});
```

#### Express Server (index.ts)
```typescript
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';

const app = express();

// CORS MUST be first - before any routes
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Better Auth handler - MUST be before body parsers
app.all("/api/auth/*", toNodeHandler(auth));

// Body parsers
app.use(express.json());

// Custom routes
app.use('/api/user', userRoutes);

app.listen(3001, () => console.log('Auth server on port 3001'));
```

#### Protected Routes (routes/user.ts)
```typescript
import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

const router = express.Router();

const verifyUser = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session.user;
  next();
};

router.get('/profile', verifyUser, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/update', verifyUser, async (req, res) => {
  await auth.api.updateUser({
    body: req.body,
    headers: fromNodeHeaders(req.headers)
  });
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });
  res.json({ user: session.user });
});

export default router;
```

#### Frontend Service (authService.ts)
```typescript
const API_BASE = process.env.AUTH_SERVER_URL || 'http://localhost:3001/api';

class AuthService {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE}/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include', // CRITICAL: Include cookies
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async signup(userData: { email: string; password: string; name: string }) {
    const response = await fetch(`${API_BASE}/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  }

  async logout() {
    await fetch(`${API_BASE}/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getProfile() {
    const response = await fetch(`${API_BASE}/user/profile`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  }
}

export const authService = new AuthService();
```

#### React Auth Context (AuthContext.tsx)
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getProfile()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Key Implementation Patterns

### 1. Progressive Enhancement
- Start with basic email/password authentication
- Add social providers as needed
- Implement advanced features like MFA and SSO progressively
- Ensure core functionality works without JavaScript

### 2. Security-First Approach
- Implement strong password requirements
- Use secure session management
- Enable rate limiting to prevent abuse
- Regularly audit authentication flows

### 3. Performance Optimization
- Optimize database queries for authentication
- Implement caching for frequently accessed data
- Use CDN for static authentication assets
- Minimize bundle size for client libraries

### 4. Maintainable Architecture
- Separate server and client authentication logic
- Use consistent error handling patterns
- Implement proper logging and monitoring
- Create clear documentation for authentication flows