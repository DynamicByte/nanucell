'use client'

import { useState } from 'react'
import Link from 'next/link'

type BookingLog = {
  message: string
  status: string
  created_at: string
}

type TrackingResult = {
  id: number
  tracking_number: string
  delivery_type: string
  cod_payment: number
  proof_of_delivery: string | null
  pickup_address: {
    firstname: string
    lastname: string
    mobile_number: string
    complete_address: string | null
    province: { name: string }
    municipality: { name: string }
    barangay: { name: string }
  }
  delivery_address: {
    firstname: string
    lastname: string
    mobile_number: string
    complete_address: string | null
    province: { name: string }
    municipality: { name: string }
    barangay: { name: string }
  }
  parcel: {
    weight: number
    type: string
    price: number
    declared_value: number
    description: string
  }
  booking_logs: BookingLog[]
  created_at: string
  updated_at: string
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [tracking, setTracking] = useState<TrackingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    setError('')
    setTracking(null)

    try {
      const response = await fetch('/api/philex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track',
          trackingNumber: trackingNumber.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTracking(data.tracking)
      } else {
        setError(data.error || 'Failed to track shipment')
      }
    } catch {
      setError('Failed to connect to tracking service')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadWaybill = async () => {
    if (!tracking?.tracking_number) return

    setIsDownloading(true)

    try {
      const response = await fetch('/api/philex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'waybill',
          trackingNumbers: [tracking.tracking_number],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to download waybill')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `waybill-${tracking.tracking_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Failed to download waybill. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('delivered')) return 'bg-green-100 text-green-800'
    if (status.toLowerCase().includes('transit')) return 'bg-blue-100 text-blue-800'
    if (status.toLowerCase().includes('pickup')) return 'bg-yellow-100 text-yellow-800'
    if (status.toLowerCase().includes('pending')) return 'bg-gray-100 text-gray-800'
    return 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-purple-600">
            Nanucell Science
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-purple-600">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Order</h1>
          <p className="text-slate-600">Enter your tracking number to see your shipment status</p>
        </div>

        <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number (e.g., PH1000013069)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Tracking...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        {tracking && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tracking Number</p>
                    <p className="text-2xl font-bold text-slate-900">{tracking.tracking_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(tracking.booking_logs[0]?.status || 'Pending')}`}>
                      {tracking.booking_logs[0]?.status || 'Pending'}
                    </span>
                    <button
                      onClick={handleDownloadWaybill}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                      </svg>
                      {isDownloading ? 'Downloading...' : 'Print Waybill'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pickup Address</h3>
                  <p className="font-medium text-slate-900">{tracking.pickup_address.firstname} {tracking.pickup_address.lastname}</p>
                  <p className="text-slate-600 text-sm">{tracking.pickup_address.mobile_number}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {tracking.pickup_address.complete_address || `${tracking.pickup_address.barangay.name}, ${tracking.pickup_address.municipality.name}, ${tracking.pickup_address.province.name}`}
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Delivery Address</h3>
                  <p className="font-medium text-slate-900">{tracking.delivery_address.firstname} {tracking.delivery_address.lastname}</p>
                  <p className="text-slate-600 text-sm">{tracking.delivery_address.mobile_number}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {tracking.delivery_address.complete_address || `${tracking.delivery_address.barangay.name}, ${tracking.delivery_address.municipality.name}, ${tracking.delivery_address.province.name}`}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Type</p>
                    <p className="font-medium text-slate-900 capitalize">{tracking.delivery_type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Package</p>
                    <p className="font-medium text-slate-900 capitalize">{tracking.parcel.type} ({tracking.parcel.weight}kg)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Shipping Fee</p>
                    <p className="font-medium text-slate-900">{formatPrice(tracking.parcel.price)}</p>
                  </div>
                  {tracking.cod_payment > 0 && (
                    <div>
                      <p className="text-slate-500">COD Amount</p>
                      <p className="font-medium text-green-600">{formatPrice(tracking.cod_payment)}</p>
                    </div>
                  )}
                </div>
                {tracking.parcel.description && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-500 text-sm">Description</p>
                    <p className="text-slate-900">{tracking.parcel.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Tracking History</h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-6">
                  {tracking.booking_logs.map((log, index) => (
                    <div key={index} className="relative pl-10">
                      <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-purple-600' : 'bg-slate-300'}`}>
                        {index === 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${index === 0 ? 'text-purple-600' : 'text-slate-700'}`}>
                          {log.status}
                        </p>
                        <p className="text-slate-600 text-sm">{log.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{formatDate(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!tracking && !error && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <p className="text-slate-500">Enter a tracking number above to see shipment details</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 mt-12 py-6 text-center text-sm text-slate-500">
        <p>Powered by PhilEx Shipping</p>
      </footer>
    </div>
  )
}
