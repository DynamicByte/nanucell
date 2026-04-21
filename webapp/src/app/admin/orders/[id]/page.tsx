'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'
import { Order, OrderItem, OrderStatus, PaymentStatus } from '@/lib/supabase'

const orderStatusOptions: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const paymentStatusOptions: PaymentStatus[] = ['pending', 'paid', 'failed']

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order & { order_number: string } | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
        setItems(data.items || [])
        setNotes(data.order.notes || '')
        setOrderStatus(data.order.order_status)
        setPaymentStatus(data.order.payment_status)
      } else {
        router.push('/admin/orders')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: orderStatus, payment_status: paymentStatus, notes }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
        alert('Saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {order.order_number}</h1>
          <p className="text-slate-500">{order.customer_name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={order.payment_status} type="payment" />
          <StatusBadge status={order.order_status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
                <p className="font-semibold text-slate-900">Total</p>
                <p className="text-xl font-bold text-slate-900">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Customer Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Name</label>
                <p className="font-medium text-slate-900">{order.customer_name}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Phone</label>
                <p className="font-medium text-slate-900">{order.phone}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Email</label>
                <p className="font-medium text-slate-900">{order.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Payment Method</label>
                <p className="font-medium text-slate-900 uppercase">{order.payment_method}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 uppercase">Delivery Address</label>
                <p className="font-medium text-slate-900">{order.address}, {order.city}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Admin Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="Add notes about this order..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase mb-1 block">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  {orderStatusOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase mb-1 block">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  {paymentStatusOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Created</p>
                <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Updated</p>
                <p className="font-medium text-slate-900">{formatDate(order.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
