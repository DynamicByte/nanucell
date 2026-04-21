import Link from 'next/link'

export default function Overview() {
  return (
    <section id="overview" className="max-w-6xl mx-auto px-6">
      <div className="bg-white rounded-3xl p-8 md:p-12 card-shadow">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          <div className="space-y-6 md:w-1/2">
            <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Cellular medicine overview</p>
            <h3 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight">
              Fight degeneration at its source—your cells.
            </h3>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Ultima Stem Plus is a physician-supervised formulation that harnesses Beta-Nicotinamide Mononucleotide (NMN)
              to replenish NAD+ reserves, supported by Resveratrol, Curcumin, and adaptogenic botanicals. Together they
              reactivate mitochondrial respiration, protect telomere length, and initiate stem cell repair pathways.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="check-icon text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">DNA repair & telomerase support</p>
                  <p className="text-slate-600">Safeguard genomic integrity to slow biological aging clocks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="check-icon text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Mitochondrial performance</p>
                  <p className="text-slate-600">Increase ATP availability and cellular resilience against stress.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 text-slate-100">
              <p className="text-xs text-purple-300 uppercase tracking-[0.35em]">Clinical scorecard</p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl py-6">
                  <p className="text-3xl font-semibold text-white">92%</p>
                  <p className="text-xs text-purple-200">Improved vitality</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-6">
                  <p className="text-3xl font-semibold text-white">87%</p>
                  <p className="text-xs text-purple-200">Cognitive uplift</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-6">
                  <p className="text-3xl font-semibold text-white">71%</p>
                  <p className="text-xs text-purple-200">Inflammation drop</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 mt-4">
                Data based on physician-reported outcomes & patient self-assessments, 2024 cohort (n=212).
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6">
              <p className="text-sm font-semibold text-purple-800">Lifetime Clinical Membership</p>
              <p className="text-slate-600 text-sm mt-2">
                Enroll today and secure continuous discounts on all Nanucell medical-grade nutraceuticals, priority access to
                bloodwork panels, and physician follow-ups every quarter.
              </p>
              <Link href="#consult" className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-purple-700">
                View membership inclusions
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
