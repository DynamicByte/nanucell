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

  const { data: resellers, error } = await supabaseAdmin
    .from('resellers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch resellers:', error)
    return NextResponse.json({ error: 'Failed to fetch resellers' }, { status: 500 })
  }

  return NextResponse.json({ resellers })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null

  if (!session || !hasPermission(session.role, 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, referral_code } = await request.json()

    if (!name || !referral_code) {
      return NextResponse.json({ error: 'Name and referral code are required' }, { status: 400 })
    }

    const sanitizedCode = referral_code.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const { data: existing } = await supabaseAdmin
      .from('resellers')
      .select('id')
      .eq('referral_code', sanitizedCode)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Referral code already exists' }, { status: 400 })
    }

    const { data: reseller, error } = await supabaseAdmin
      .from('resellers')
      .insert({
        name,
        referral_code: sanitizedCode,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create reseller:', error)
      return NextResponse.json({ error: 'Failed to create reseller' }, { status: 500 })
    }

    return NextResponse.json({ reseller })
  } catch (error) {
    console.error('Error creating reseller:', error)
    return NextResponse.json({ error: 'Failed to create reseller' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null

  if (!session || !hasPermission(session.role, 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Reseller ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('resellers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete reseller:', error)
      return NextResponse.json({ error: 'Failed to delete reseller' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reseller:', error)
    return NextResponse.json({ error: 'Failed to delete reseller' }, { status: 500 })
  }
}
