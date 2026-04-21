import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-10 md:pt-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-7">
          <span className="pill inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full text-purple-100">
            Trusted by 1,000+ patients - Clinically guided protocols
          </span>
          <h2 className="text-4xl md:text-5xl section-title leading-tight">
            Rebuild cellular vitality with physician-formulated NMN therapy.
          </h2>
          <p className="text-lg text-slate-100/80 leading-relaxed">
            Ultima Stem Plus integrates NMN, Resveratrol, Curcumin, and antioxidant-rich botanicals to restore NAD+ levels,
            reactivate dormant stem cells, and repair mitochondrial efficiency. Designed and monitored by medical
            professionals for patients seeking measurable longevity outcomes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#consult"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-purple-300 text-slate-900 font-semibold shadow-lg shadow-purple-900/30"
            >
              Begin Personalized Plan
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
            <Link
              href="#science"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
            >
              Review clinical abstracts
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-sm text-purple-100/70">
            <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur py-3 px-4">
              <p className="text-2xl font-semibold text-white">4.8★</p>
              <p>Patient Outcomes</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur py-3 px-4">
              <p className="text-2xl font-semibold text-white">FDA</p>
              <p>Registered facility</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur py-3 px-4">
              <p className="text-2xl font-semibold text-white">HALAL</p>
              <p>Accredited</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur py-3 px-4">
              <p className="text-2xl font-semibold text-white">GMP</p>
              <p>Certified</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-10 -left-10 hidden md:block w-48 h-48 rounded-full bg-purple-200/20 blur-3xl"></div>
          <div className="relative bg-white/10 border border-white/15 rounded-3xl p-6 md:p-8 blur-panel card-shadow">
            <div className="relative overflow-hidden rounded-2xl h-72 md:h-96 bg-slate-900/60">
              <Image
                src="/bg/nanucell-med-team.png"
                alt="Nanucell medical specialist preparing therapy"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                <p className="text-sm uppercase tracking-[0.35em] text-purple-100/70">Medical Protocol</p>
                <p className="text-xl font-semibold">Ultima Stem Plus NMN + Resveratrol</p>
                <p className="text-sm text-purple-100/75">Daily restorative therapy tailored per patient biomarkers.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-slate-900">
              <div className="rounded-xl bg-white/90 border border-purple-100/60 px-4 py-3">
                <p className="text-xs text-purple-700 uppercase tracking-wide">Formulation</p>
                <p className="font-semibold text-slate-800">320mg NMN - 200mg Resveratrol</p>
              </div>
              <div className="rounded-xl bg-white/90 border border-purple-100/60 px-4 py-3">
                <p className="text-xs text-purple-700 uppercase tracking-wide">Consultation</p>
                <p className="font-semibold text-slate-800">Telehealth support included</p>
              </div>
              <div className="col-span-2 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="text-xs text-purple-600 uppercase tracking-wide">Outcomes</p>
                <p className="font-semibold text-slate-800">↑ 43% NAD+ levels - ↓ 32% oxidative biomarkers *</p>
                <p className="text-[11px] text-slate-500">* Internal cohort data, 90-day protocol (n=126)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
