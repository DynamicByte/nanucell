'use client'

import { useState, useEffect } from 'react'
import { Reseller } from '@/lib/supabase'

const DOMAIN = 'nanucell.science'

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResellers()
  }, [])

  const fetchResellers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/resellers')
      if (res.ok) {
        const data = await res.json()
        setResellers(data.resellers || [])
      }
    } catch (error) {
      console.error('Failed to fetch resellers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, referral_code: referralCode }),
      })

      if (res.ok) {
        setName('')
        setReferralCode('')
        fetchResellers()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create reseller')
      }
    } catch (error) {
      setError('Failed to create reseller')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reseller?')) return

    try {
      const res = await fetch(`/api/admin/resellers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchResellers()
      }
    } catch (error) {
      console.error('Failed to delete reseller:', error)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`https://${DOMAIN}/ref/${code}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Resellers</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Reseller</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Reseller Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
          <div className="flex-1 flex items-center gap-2">
            <span className="text-slate-500 text-sm whitespace-nowrap">{DOMAIN}/ref/</span>
            <input
              type="text"
              placeholder="link-extension"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Reseller'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : resellers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No resellers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Referral Link</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Created</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resellers.map(reseller => (
                  <tr key={reseller.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{reseller.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {DOMAIN}/ref/{reseller.referral_code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(reseller.referral_code)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy link"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reseller.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {reseller.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(reseller.created_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(reseller.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
