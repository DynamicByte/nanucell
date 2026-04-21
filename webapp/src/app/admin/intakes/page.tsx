'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'
import { MedicalIntake, IntakeStatus } from '@/lib/supabase'

const statusOptions: IntakeStatus[] = ['new', 'contacted', 'scheduled', 'completed', 'cancelled']

export default function IntakesPage() {
  const [intakes, setIntakes] = useState<MedicalIntake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<IntakeStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchIntakes()
  }, [filter])

  const fetchIntakes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      
      const res = await fetch(`/api/admin/intakes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setIntakes(data.intakes || [])
      }
    } catch (error) {
      console.error('Failed to fetch intakes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredIntakes = intakes.filter(intake => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      intake.full_name.toLowerCase().includes(searchLower) ||
      intake.phone.toLowerCase().includes(searchLower) ||
      (intake.email && intake.email.toLowerCase().includes(searchLower))
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Medical Intakes</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as IntakeStatus | 'all')}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status} className="capitalize">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredIntakes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No intakes found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Package</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIntakes.map(intake => (
                  <tr key={intake.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{intake.full_name}</p>
                      <p className="text-sm text-slate-500">{intake.region}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900">{intake.phone}</p>
                      <p className="text-sm text-slate-500">{intake.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{intake.package}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{intake.consultation_type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={intake.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(intake.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/intakes/${intake.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        View
                      </Link>
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
