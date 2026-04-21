'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'
import { MedicalIntake, IntakeStatus } from '@/lib/supabase'

const statusOptions: IntakeStatus[] = ['new', 'contacted', 'scheduled', 'completed', 'cancelled']

export default function IntakeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [intake, setIntake] = useState<MedicalIntake | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<IntakeStatus>('new')

  useEffect(() => {
    fetchIntake()
  }, [params.id])

  const fetchIntake = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/intakes/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setIntake(data.intake)
        setNotes(data.intake.notes || '')
        setStatus(data.intake.status)
      } else {
        router.push('/admin/intakes')
      }
    } catch (error) {
      console.error('Failed to fetch intake:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/intakes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      if (res.ok) {
        const data = await res.json()
        setIntake(data.intake)
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

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!intake) {
    return <div className="text-center py-8">Intake not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/intakes"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{intake.full_name}</h1>
          <p className="text-slate-500">Medical Intake Form</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={intake.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Full Name</label>
                <p className="font-medium text-slate-900">{intake.full_name}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Phone</label>
                <p className="font-medium text-slate-900">{intake.phone}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Email</label>
                <p className="font-medium text-slate-900">{intake.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Region</label>
                <p className="font-medium text-slate-900">{intake.region}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Consultation Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Preferred Package</label>
                <p className="font-medium text-slate-900">{intake.package}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Consultation Type</label>
                <p className="font-medium text-slate-900">{intake.consultation_type}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 uppercase">Health Goals</label>
                <p className="font-medium text-slate-900 whitespace-pre-wrap">{intake.health_goals || '-'}</p>
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
              placeholder="Add notes about this intake..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Update Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IntakeStatus)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 mb-4"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Created</p>
                <p className="font-medium text-slate-900">{formatDate(intake.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Updated</p>
                <p className="font-medium text-slate-900">{formatDate(intake.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
