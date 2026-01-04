/**
 * Better Auth API Route
 *
 * Handles all authentication-related API requests using Better Auth's Next.js handler.
 * This replaces the previous proxy implementation with direct Better Auth integration.
 */

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

// Use Better Auth's built-in Next.js handler
export const { GET, POST } = toNextJsHandler(auth);