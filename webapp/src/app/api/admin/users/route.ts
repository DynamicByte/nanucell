import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken, hasPermission } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null
  
  if (!session || !hasPermission(session.role, 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: users, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null
  
  if (!session || !hasPermission(session.role, 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, name, role } = await request.json()

  if (!email || !name || !role) {
    return NextResponse.json({ error: 'Email, name, and role required' }, { status: 400 })
  }

  const { data: user, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ email, name, role })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return NextResponse.json({ user })
}
