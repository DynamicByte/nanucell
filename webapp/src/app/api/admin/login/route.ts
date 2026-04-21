import { NextRequest, NextResponse } from 'next/server'
import { validatePassword, createSession, getSessionCookieOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const role = validatePassword(password)
    if (!role) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Check if user exists in database
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    let userName = email.split('@')[0]
    let userRole = role

    if (user) {
      userName = user.name
      userRole = user.role
    } else {
      // Create user if doesn't exist
      const { data: newUser } = await supabaseAdmin
        .from('admin_users')
        .insert({ email, name: userName, role })
        .select()
        .single()
      
      if (newUser) {
        userName = newUser.name
        userRole = newUser.role
      }
    }

    const token = await createSession(email, userName, userRole)
    const cookieOptions = getSessionCookieOptions()

    const response = NextResponse.json({ success: true, role: userRole })
    response.cookies.set(cookieOptions.name, token, cookieOptions)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
