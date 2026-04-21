'use client'

import { useState, useEffect } from 'react'

type Order = {
  id: string
  order_number: string
  customer_name: string
  phone: string
  address: string
  city: string
  total: number
  order_status: string
  payment_method: string
  philex_booking_id: number | null
  philex_tracking_number: string | null
  shipping_status: string | null
  created_at: string
}

type TrackingInfo = {
  tracking_number: string
  status: string
  lastUpdate: string
  booking_logs: Array<{
    message: string
    status: string
    created_at: string
  }>
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [trackingInfo, setTrackingInfo] = useState<Record<string, TrackingInfo>>({})
  const [isTracking, setIsTracking] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'booked' | 'in_transit' | 'delivered'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      if (data.orders) {
        const codOrders = data.orders.filter((o: Order) => o.payment_method === 'cod')
        setOrders(codOrders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackOrder = async (trackingNumber: string) => {
    if (!trackingNumber) return

    setIsTracking(trackingNumber)

    try {
      const response = await fetch('/api/philex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track',
          trackingNumber,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTrackingInfo(prev => ({
          ...prev,
          [trackingNumber]: {
            tracking_number: data.tracking.tracking_number,
            status: data.tracking.booking_logs[0]?.status || 'Pending',
            lastUpdate: data.tracking.booking_logs[0]?.created_at || '',
            booking_logs: data.tracking.booking_logs,
          },
        }))
      }
    } catch (error) {
      console.error('Failed to track:', error)
    } finally {
      setIsTracking(null)
    }
  }

  const handlePrintWaybill = async (trackingNumbers: string[]) => {
    if (trackingNumbers.length === 0) return

    setIsPrinting(true)

    try {
      const response = await fetch('/api/philex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'waybill',
          trackingNumbers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to download waybill')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `waybills-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to print waybill:', error)
      alert('Failed to download waybill. Please try again.')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    const filteredOrders = getFilteredOrders()
    const withTracking = filteredOrders.filter(o => o.philex_tracking_number)
    if (selectedOrders.length === withTracking.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(withTracking.map(o => o.id))
    }
  }

  const getFilteredOrders = () => {
    if (filter === 'all') return orders
    if (filter === 'pending') return orders.filter(o => !o.philex_tracking_number)
    if (filter === 'booked') return orders.filter(o => o.shipping_status === 'booked')
    if (filter === 'in_transit') return orders.filter(o => {
      const info = trackingInfo[o.philex_tracking_number || '']
      return info?.status?.toLowerCase().includes('transit')
    })
    if (filter === 'delivered') return orders.filter(o => {
      const info = trackingInfo[o.philex_tracking_number || '']
      return info?.status?.toLowerCase().includes('delivered')
    })
    return orders
  }

  const getSelectedTrackingNumbers = () => {
    return orders
      .filter(o => selectedOrders.includes(o.id) && o.philex_tracking_number)
      .map(o => o.philex_tracking_number!)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  const getStatusBadge = (order: Order) => {
    const info = trackingInfo[order.philex_tracking_number || '']
    const status = info?.status || order.shipping_status || 'Not Booked'

    let colorClass = 'bg-gray-100 text-gray-800'
    if (status === 'Not Booked') colorClass = 'bg-red-100 text-red-800'
    else if (status === 'booked' || status === 'Pending') colorClass = 'bg-yellow-100 text-yellow-800'
    else if (status.toLowerCase().includes('transit')) colorClass = 'bg-blue-100 text-blue-800'
    else if (status.toLowerCase().includes('delivered')) colorClass = 'bg-green-100 text-green-800'
    else if (status.toLowerCase().includes('pickup')) colorClass = 'bg-purple-100 text-purple-800'

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status === 'booked' ? 'Booked' : status}
      </span>
    )
  }

  const filteredOrders = getFilteredOrders()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipping Management</h1>
          <p className="text-slate-600">Manage COD orders and PhilEx shipments</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedOrders.length > 0 && (
            <button
              onClick={() => handlePrintWaybill(getSelectedTrackingNumbers())}
              disabled={isPrinting || getSelectedTrackingNumbers().length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              {isPrinting ? 'Printing...' : `Print Waybills (${getSelectedTrackingNumbers().length})`}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: 'all', label: 'All Orders', count: orders.length },
          { key: 'pending', label: 'Not Booked', count: orders.filter(o => !o.philex_tracking_number).length },
          { key: 'booked', label: 'Booked', count: orders.filter(o => o.shipping_status === 'booked').length },
          { key: 'in_transit', label: 'In Transit', count: 0 },
          { key: 'delivered', label: 'Delivered', count: 0 },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as typeof filter)}
            className={`p-4 rounded-xl border transition-colors ${
              filter === item.key
                ? 'border-purple-500 bg-purple-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-bold text-slate-900">{item.count}</p>
            <p className="text-sm text-slate-600">{item.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.filter(o => o.philex_tracking_number).length && selectedOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">COD Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tracking #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {order.philex_tracking_number && (
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-slate-300"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{order.order_number}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-900">{order.customer_name}</p>
                    <p className="text-xs text-slate-500">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-900 text-sm">{order.city}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{order.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-green-600">{formatPrice(order.total)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {order.philex_tracking_number ? (
                      <p className="font-mono text-sm text-slate-900">{order.philex_tracking_number}</p>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(order)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.philex_tracking_number && (
                        <>
                          <button
                            onClick={() => handleTrackOrder(order.philex_tracking_number!)}
                            disabled={isTracking === order.philex_tracking_number}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Track"
                          >
                            {isTracking === order.philex_tracking_number ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handlePrintWaybill([order.philex_tracking_number!])}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Print Waybill"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {Object.keys(trackingInfo).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Tracking Updates</h2>
          <div className="space-y-4">
            {Object.entries(trackingInfo).map(([trackingNumber, info]) => (
              <div key={trackingNumber} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono font-medium text-slate-900">{trackingNumber}</p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {info.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {info.booking_logs.slice(0, 3).map((log, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${index === 0 ? 'bg-purple-600' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className="text-slate-700">{log.message}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(log.created_at).toLocaleString('en-PH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
