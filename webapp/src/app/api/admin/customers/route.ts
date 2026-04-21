import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('customer_name, phone, email, total, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    const customerMap = new Map<string, {
      customer_name: string
      phone: string
      email: string | null
      order_count: number
      total_spent: number
      last_order: string
    }>()

    for (const order of orders || []) {
      const key = order.phone
      const existing = customerMap.get(key)
      
      if (existing) {
        existing.order_count += 1
        existing.total_spent += Number(order.total)
        if (new Date(order.created_at) > new Date(existing.last_order)) {
          existing.last_order = order.created_at
          existing.customer_name = order.customer_name
          existing.email = order.email || existing.email
        }
      } else {
        customerMap.set(key, {
          customer_name: order.customer_name,
          phone: order.phone,
          email: order.email,
          order_count: 1,
          total_spent: Number(order.total),
          last_order: order.created_at,
        })
      }
    }

    const customers = Array.from(customerMap.values())
      .sort((a, b) => new Date(b.last_order).getTime() - new Date(a.last_order).getTime())

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
