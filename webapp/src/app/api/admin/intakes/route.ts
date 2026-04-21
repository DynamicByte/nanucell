import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  if (!token || !parseSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('medical_intakes')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: intakes, error } = await query

  if (error) {
    console.error('Failed to fetch intakes:', error)
    return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 })
  }

  return NextResponse.json({ intakes })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { data: intake, error } = await supabaseAdmin
      .from('medical_intakes')
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        region: data.region,
        package: data.package,
        consultation_type: data.consultation_type,
        health_goals: data.health_goals || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create intake:', error)
      return NextResponse.json({ error: 'Failed to create intake' }, { status: 500 })
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      type: 'intake',
      message: `New medical intake from ${data.full_name}`,
      reference_id: intake.id,
    })

    return NextResponse.json({ intake })
  } catch (error) {
    console.error('Create intake error:', error)
    return NextResponse.json({ error: 'Failed to create intake' }, { status: 500 })
  }
}
