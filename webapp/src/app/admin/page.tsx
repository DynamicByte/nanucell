import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import StatsCard from '@/components/admin/StatsCard'
import StatusBadge from '@/components/admin/StatusBadge'
import Link from 'next/link'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString()

  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthAgoISO = monthAgo.toISOString()

  const [
    { count: todayIntakes },
    { count: todayOrders },
    { count: pendingIntakes },
    { count: pendingOrders },
    { data: todayRevenue },
    { data: weekRevenue },
    { data: monthRevenue },
    { data: recentIntakes },
    { data: recentOrders },
  ] = await Promise.all([
    supabaseAdmin.from('medical_intakes').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('medical_intakes').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
    supabaseAdmin.from('orders').select('total').gte('created_at', todayISO).in('payment_status', ['paid', 'pending']),
    supabaseAdmin.from('orders').select('total').gte('created_at', weekAgoISO).in('payment_status', ['paid', 'pending']),
    supabaseAdmin.from('orders').select('total').gte('created_at', monthAgoISO).in('payment_status', ['paid', 'pending']),
    supabaseAdmin.from('medical_intakes').select('*').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const todayRevenueTotal = todayRevenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0
  const weekRevenueTotal = weekRevenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0
  const monthRevenueTotal = monthRevenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  return {
    todayIntakes: todayIntakes || 0,
    todayOrders: todayOrders || 0,
    pendingIntakes: pendingIntakes || 0,
    pendingOrders: pendingOrders || 0,
    todayRevenue: todayRevenueTotal,
    weekRevenue: weekRevenueTotal,
    monthRevenue: monthRevenueTotal,
    recentIntakes: recentIntakes || [],
    recentOrders: recentOrders || [],
  }
}

function formatPrice(price: number) {
  return `₱${price.toLocaleString()}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value
  const session = token ? parseSessionToken(token) : null

  let stats = {
    todayIntakes: 0,
    todayOrders: 0,
    pendingIntakes: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    recentIntakes: [] as any[],
    recentOrders: [] as any[],
  }

  try {
    stats = await getStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Intakes"
          value={stats.todayIntakes}
          icon="intakes"
        />
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon="orders"
        />
        <StatsCard
          title="Pending Actions"
          value={stats.pendingIntakes + stats.pendingOrders}
          subtitle={`${stats.pendingIntakes} intakes, ${stats.pendingOrders} orders`}
          icon="pending"
        />
        <StatsCard
          title="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
          subtitle={`Week: ${formatPrice(stats.weekRevenue)} | Month: ${formatPrice(stats.monthRevenue)}`}
          icon="revenue"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Intakes</h3>
            <Link href="/admin/intakes" className="text-sm text-purple-600 hover:text-purple-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentIntakes.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No intakes yet</p>
            ) : (
              stats.recentIntakes.map((intake: any) => (
                <Link
                  key={intake.id}
                  href={`/admin/intakes/${intake.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{intake.full_name}</p>
                    <p className="text-sm text-slate-500">{intake.phone}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={intake.status} />
                    <p className="text-xs text-slate-400 mt-1">{formatDate(intake.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-purple-600 hover:text-purple-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentOrders.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No orders yet</p>
            ) : (
              stats.recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{order.customer_name}</p>
                    <p className="text-sm text-slate-500">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatPrice(order.total)}</p>
                    <StatusBadge status={order.order_status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
