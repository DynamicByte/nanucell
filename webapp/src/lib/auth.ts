import { cookies } from 'next/headers'
import { UserRole } from './supabase'

const ADMIN_PASSWORDS: Record<UserRole, string> = {
  superadmin: process.env.ADMIN_SUPERADMIN_PASSWORD || 'superadmin123',
  admin: process.env.ADMIN_ADMIN_PASSWORD || 'admin123',
  user: process.env.ADMIN_USER_PASSWORD || 'user123',
}

const SESSION_COOKIE = 'nanucell_admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export type AdminSession = {
  email: string
  name: string
  role: UserRole
  expiresAt: number
}

export function validatePassword(password: string): UserRole | null {
  for (const [role, pwd] of Object.entries(ADMIN_PASSWORDS)) {
    if (password === pwd) {
      return role as UserRole
    }
  }
  return null
}

export function createSessionToken(session: AdminSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64')
}

export function parseSessionToken(token: string): AdminSession | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const session = JSON.parse(decoded) as AdminSession
    if (session.expiresAt < Date.now()) {
      return null
    }
    return session
  } catch {
    return null
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return parseSessionToken(token)
}

export async function createSession(email: string, name: string, role: UserRole): Promise<string> {
  const session: AdminSession = {
    email,
    name,
    role,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  return createSessionToken(session)
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  }
}

export function hasPermission(role: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    superadmin: 3,
    admin: 2,
    user: 1,
  }
  return roleHierarchy[role] >= roleHierarchy[requiredRole]
}
