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
    .from('orders')
    .select('*, reseller:resellers(id, name, referral_code)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('order_status', status)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  return NextResponse.json({ orders })
}
