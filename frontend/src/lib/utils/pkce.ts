/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Implements RFC 7636 for secure OAuth flows in SPAs
 */

/**
 * Generate a cryptographically secure random string for PKCE
 * @param length - Length of the string (43-128 characters per RFC 7636)
 * @returns Base64URL-encoded random string
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  
  return result;
}

/**
 * Base64URL encode a string (without padding)
 * @param str - String to encode
 * @returns Base64URL-encoded string
 */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate SHA256 hash of a string
 * @param plain - Plain text string to hash
 * @returns Promise resolving to ArrayBuffer containing hash
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Generate PKCE code verifier and code challenge
 * @returns Object containing code verifier and code challenge
 */
export async function generatePkceChallenge(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  // Generate code verifier (43-128 characters)
  const codeVerifier = generateRandomString(128);
  
  // Generate code challenge (SHA256 hash of code verifier, base64url encoded)
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(hashed))
  );
  
  return {
    codeVerifier,
    codeChallenge
  };
}

/**
 * Generate a random state parameter for CSRF protection
 * @returns Random state string
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Store PKCE data in session storage for OAuth callback
 * @param data - PKCE data to store
 */
export function storePkceData(data: {
  codeVerifier: string;
  state: string;
}): void {
  sessionStorage.setItem('pkce_code_verifier', data.codeVerifier);
  sessionStorage.setItem('pkce_state', data.state);
}

/**
 * Retrieve and clear PKCE data from session storage
 * @returns PKCE data if available, null otherwise
 */
export function retrieveAndClearPkceData(): {
  codeVerifier: string;
  state: string;
} | null {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  const state = sessionStorage.getItem('pkce_state');
  
  if (!codeVerifier || !state) {
    return null;
  }
  
  // Clear stored data
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');
  
  return {
    codeVerifier,
    state
  };
}

/**
 * Build Google OAuth authorization URL with PKCE parameters
 * @param clientId - Google OAuth client ID
 * @param redirectUri - Redirect URI for OAuth callback
 * @param codeChallenge - PKCE code challenge
 * @param state - CSRF protection state parameter
 * @returns Complete OAuth authorization URL
 */
export function buildGoogleOAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Initiate Google OAuth PKCE flow
 * @param clientId - Google OAuth client ID  
 * @param redirectUri - Redirect URI for OAuth callback
 */
export async function initiateGooglePkceFlow(
  clientId: string,
  redirectUri: string
): Promise<void> {
  try {
    // Generate PKCE challenge and state
    const { codeVerifier, codeChallenge } = await generatePkceChallenge();
    const state = generateState();
    
    // Store PKCE data for callback
    storePkceData({ codeVerifier, state });
    
    // Build OAuth URL and redirect
    const oauthUrl = buildGoogleOAuthUrl(clientId, redirectUri, codeChallenge, state);
    window.location.href = oauthUrl;
  } catch (error) {
    console.error('Failed to initiate PKCE OAuth flow:', error);
    throw new Error('Failed to initiate OAuth flow');
  }
}