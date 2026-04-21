import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  if (!token || !parseSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: intake, error } = await supabaseAdmin
    .from('medical_intakes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !intake) {
    return NextResponse.json({ error: 'Intake not found' }, { status: 404 })
  }

  return NextResponse.json({ intake })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null
  
  if (!session || session.role === 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const updates = await request.json()

  const { data: intake, error } = await supabaseAdmin
    .from('medical_intakes')
    .update({
      status: updates.status,
      notes: updates.notes,
      assigned_to: updates.assigned_to,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update intake:', error)
    return NextResponse.json({ error: 'Failed to update intake' }, { status: 500 })
  }

  return NextResponse.json({ intake })
}
