# Frontend Integration Patterns

Patterns for integrating Better Auth with frontend frameworks that run separately from the auth server.

## When to Use These Patterns

Use these patterns when:
- Frontend runs on a different domain/port than auth server
- Not using Next.js (which has built-in integration)
- Building with React, Vue, Docusaurus, or vanilla JS

## Direct Fetch Pattern (No createAuthClient)

Instead of using the Better Auth client library, make direct API calls with proper cookie handling:

### Core Service Class
```typescript
class AuthService {
  private API_BASE: string;

  constructor(authServerUrl: string) {
    this.API_BASE = `${authServerUrl}/api`;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.API_BASE}/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // CRITICAL for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    // Optionally cache user in localStorage for quick access
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data.user;
  }

  async signup(email: string, password: string, name: string, customFields?: object) {
    const response = await fetch(`${this.API_BASE}/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, ...customFields }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data.user;
  }

  async logout() {
    await fetch(`${this.API_BASE}/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('auth_user');
  }

  async getSession() {
    const response = await fetch(`${this.API_BASE}/auth/get-session`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    return response.json();
  }

  // Quick check from localStorage (doesn't verify with server)
  getCachedUser() {
    const cached = localStorage.getItem('auth_user');
    return cached ? JSON.parse(cached) : null;
  }
}

export const authService = new AuthService(
  process.env.AUTH_SERVER_URL || 'http://localhost:3001'
);
```

## React Context Pattern

For React/Docusaurus apps, wrap auth state in a context:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: any; // Custom fields
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const cached = authService.getCachedUser();
    if (cached) {
      setUser(cached);
      // Verify with server in background
      authService.getSession()
        .then(session => {
          if (session?.user) setUser(session.user);
          else {
            setUser(null);
            localStorage.removeItem('auth_user');
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const user = await authService.signup(email, password, name);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Vue Composition API Pattern

```typescript
import { ref, computed, onMounted } from 'vue';
import { authService } from '../services/authService';

export function useAuth() {
  const user = ref(null);
  const loading = ref(true);

  onMounted(async () => {
    const cached = authService.getCachedUser();
    if (cached) user.value = cached;
    loading.value = false;
  });

  const login = async (email: string, password: string) => {
    user.value = await authService.login(email, password);
  };

  const logout = async () => {
    await authService.logout();
    user.value = null;
  };

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated: computed(() => !!user.value),
    login,
    logout,
  };
}
```

## Key Points

1. **Always use `credentials: 'include'`** - Without this, cookies won't be sent cross-origin
2. **CORS must allow credentials** - Server must have `credentials: true` in CORS config
3. **Same-origin issues** - For production, consider using a proxy or same-origin deployment
4. **localStorage caching** - Improves UX but always verify with server for protected routes
