import type { Context } from 'hono'

export type UserRole = 'customer' | 'admin'

export type User = {
  id: number
  email: string
  full_name: string
  phone: string
  address: string
  city: string
  google_id?: string | null
  avatar_url?: string
  latitude?: number | null
  longitude?: number | null
  role: UserRole
  status: 'active' | 'suspended'
  created_at: string
}

export type JwtPayload = {
  sub: number // user_id
  email: string
  name: string
  role: UserRole
  exp: number
}

export type GoogleUserPayload = {
  googleId: string
  email: string
  name: string
  avatar: string
}

// Runtime dynamic secret: Never expose or hardcode fallback secrets in public source code
let cachedRuntimeSecret: string | null = null

export function getJwtSecret(env?: any): string {
  if (env?.JWT_SECRET && typeof env.JWT_SECRET === 'string' && env.JWT_SECRET.trim().length >= 16) {
    return env.JWT_SECRET.trim()
  }
  // Generate a cryptographically secure 256-bit runtime secret if env variable not explicitly set
  if (!cachedRuntimeSecret) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    cachedRuntimeSecret = bytesToHex(bytes)
  }
  return cachedRuntimeSecret
}

// --- Hex / Base64url Helpers ---
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// --- Server-side Google ID Token Verification ---
// Authenticates ID Token directly with Google's TokenInfo endpoint
export async function verifyGoogleToken(credential: string, expectedClientId?: string): Promise<GoogleUserPayload | null> {
  try {
    if (!credential || typeof credential !== 'string') return null
    const trimmed = credential.trim()
    // Do NOT accept arbitrary JSON strings. Only valid Google JWT tokens.
    if (!trimmed || trimmed.startsWith('{') || trimmed.split('.').length !== 3) {
      return null
    }

    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(trimmed)}`
    const res = await fetch(tokenInfoUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      return null
    }

    const payload = await res.json<any>()
    if (!payload || !payload.sub || !payload.email) {
      return null
    }

    // Verify Google Issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com']
    if (!validIssuers.includes(payload.iss)) {
      return null
    }

    // Verify Email Verified
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      return null
    }

    // Verify Expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && Number(payload.exp) < now) {
      return null
    }

    // Verify Audience if configured
    if (expectedClientId && payload.aud && payload.aud !== expectedClientId) {
      return null
    }

    return {
      googleId: String(payload.sub),
      email: String(payload.email).toLowerCase().trim(),
      name: payload.name || payload.email.split('@')[0],
      avatar: payload.picture || '',
    }
  } catch (err) {
    console.error('Google ID Token verification failed:', err)
    return null
  }
}

// --- PBKDF2 Password Hashing ---
export function generateSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder()
  const saltBytes = hexToBytes(saltHex)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return bytesToHex(new Uint8Array(derivedBits))
}

export async function verifyPassword(password: string, saltHex: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPassword(password, saltHex)
  if (computed.length !== expectedHash.length) return false
  let match = 0
  for (let i = 0; i < computed.length; i++) {
    match |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return match === 0
}

// --- JWT HS256 ---
export async function signJwt(payload: Omit<JwtPayload, 'exp'> & { exp?: number }, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days

  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify({ ...payload, exp }))
  const dataToSign = `${headerEncoded}.${payloadEncoded}`

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign))
  const signatureEncoded = bytesToBase64Url(new Uint8Array(signature))

  return `${dataToSign}.${signatureEncoded}`
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts

    const enc = new TextEncoder()
    const dataToVerify = `${headerB64}.${payloadB64}`

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Decode signature
    let sigBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/')
    while (sigBase64.length % 4) sigBase64 += '='
    const binarySig = atob(sigBase64)
    const sigBytes = new Uint8Array(binarySig.length)
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(dataToVerify))
    if (!isValid) return null

    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    return payload
  } catch {
    return null
  }
}

// --- Context-aware Auth Helper ---
export const getAuthUser = async (c: Context<any>): Promise<JwtPayload | null> => {
  const authHeader = c.req.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.substring(7).trim()
  const secret = getJwtSecret(c.env)
  return verifyJwt(token, secret)
}
