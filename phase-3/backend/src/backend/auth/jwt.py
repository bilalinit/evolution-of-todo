"""
JWT verification module using PyJWT with JWKS.
Verifies Better Auth JWT tokens (EdDSA/Ed25519) and extracts user information.
"""
from typing import Optional
import jwt
from jwt import PyJWKClient
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# JWKS client for fetching public keys from Better Auth
# The URL should point to your Next.js frontend's JWKS endpoint
JWKS_URL = "http://localhost:3000/api/auth/jwks"

# Cache the JWKS client
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """Get or create the JWKS client."""
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(JWKS_URL, cache_keys=True)
    return _jwks_client


def verify_jwt(token: str) -> Optional[dict]:
    """
    Verify JWT token signed by Better Auth using JWKS.

    Args:
        token: JWT token string

    Returns:
        Decoded JWT payload if valid, None if invalid
    """
    try:
        # Get the signing key from JWKS
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        # Better Auth uses EdDSA (Ed25519) by default
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA"],
            options={
                "verify_aud": False,  # Better Auth doesn't set audience by default
            }
        )
        return payload
    except jwt.exceptions.PyJWKClientError as e:
        logger.warning(f"JWKS client error: {e}")
        return None
    except jwt.exceptions.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"JWT verification error: {e}")
        return None


def extract_user_id(token: str) -> Optional[str]:
    """
    Extract user ID from JWT token.

    Args:
        token: JWT token string

    Returns:
        User ID (sub claim) if valid token, None otherwise
    """
    payload = verify_jwt(token)
    if payload:
        # Better Auth puts user ID in the 'sub' claim
        return payload.get("sub")
    return None


def validate_token(token: str) -> bool:
    """
    Validate token without extracting user info.

    Args:
        token: JWT token string

    Returns:
        True if valid, False otherwise
    """
    return verify_jwt(token) is not None


def clear_jwks_cache():
    """Clear the JWKS cache. Useful if keys are rotated."""
    global _jwks_client
    _jwks_client = None