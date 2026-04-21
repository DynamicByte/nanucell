'use client'

import { useState } from 'react'

export default function Consult() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    region: 'Metro Manila',
    package: 'Preferred package',
    consultation_type: 'Consultation type',
    health_goals: '',
    agreed: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.phone) {
      alert('Please fill in your name and phone number')
      return
    }
    if (!formData.agreed) {
      alert('Please acknowledge the disclaimer')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormSuccess(true)
        setFormData({
          full_name: '',
          phone: '',
          email: '',
          region: 'Metro Manila',
          package: 'Preferred package',
          consultation_type: 'Consultation type',
          health_goals: '',
          agreed: false,
        })
      } else {
        alert('Failed to submit form. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="consult" className="max-w-4xl mx-auto px-6">
      <div className="form-backdrop rounded-3xl p-8 md:p-10">
          <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Medical intake form</p>
          <h3 className="section-title text-3xl text-slate-900 leading-tight mt-4">Schedule your cellular health consult</h3>
          <p className="text-sm text-slate-600 mt-3">
            Submit your details and our clinical concierge will contact you within 24 hours. Consultations are available in person
            and via secured telehealth sessions.
          </p>
          {formSuccess ? (
            <div className="mt-6 p-6 bg-green-50 rounded-xl text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-green-800">Salamat po!</h4>
              <p className="text-green-700 mt-2">Your consultation request has been submitted. Our team will contact you within 24 hours.</p>
              <button
                onClick={() => setFormSuccess(false)}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700"
              >
                Submit Another
              </button>
            </div>
          ) : (
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                placeholder="Full name *"
                required
                className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Mobile number *"
                required
                className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Email address"
              className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <select 
                name="region"
                value={formData.region}
                onChange={handleFormChange}
                className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option>Metro Manila</option>
                <option>Luzon</option>
                <option>Visayas</option>
                <option>Mindanao</option>
                <option>International</option>
              </select>
              <select 
                name="package"
                value={formData.package}
                onChange={handleFormChange}
                className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option>Preferred package</option>
                <option>Business Package</option>
                <option>Executive Package</option>
                <option>Elite Package</option>
                <option>Custom protocol</option>
              </select>
              <select 
                name="consultation_type"
                value={formData.consultation_type}
                onChange={handleFormChange}
                className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option>Consultation type</option>
                <option>Clinic visit</option>
                <option>Telehealth</option>
                <option>Corporate wellness</option>
              </select>
            </div>
            <textarea
              name="health_goals"
              value={formData.health_goals}
              onChange={handleFormChange}
              rows={4}
              placeholder="Current health goals, diagnoses, or medications"
              className="form-field w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:border-purple-500"
            ></textarea>
            <label className="flex items-start gap-3 text-slate-500 text-xs">
              <input 
                type="checkbox" 
                name="agreed"
                checked={formData.agreed}
                onChange={handleFormChange}
                className="mt-1 h-4 w-4 rounded border-slate-300" 
              />
              <span>
                I acknowledge that Nanucell supplements are not diagnostic or curative products. All recommendations are for
                integrative wellness support and do not replace medical treatment.
              </span>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center items-center gap-3 py-3 rounded-full bg-slate-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit medical intake'}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              100% secure • HIPAA-aligned handling • Cash on delivery available nationwide
            </p>
          </form>
          )}
      </div>
    </section>
  )
}
