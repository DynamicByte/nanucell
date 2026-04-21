export default function Protocol() {
  const phases = [
    {
      number: 1,
      label: 'Activate',
      title: 'Take 1 capsule, 3x daily',
      description: 'Preferably before meals with purified water to maximize subcellular absorption and NAD+ repletion within the first 14 days.',
      note: 'Contraindicated for pregnant or lactating patients without physician clearance.',
    },
    {
      number: 2,
      label: 'Absorb',
      title: 'Support with hydration & nutrition',
      description: 'Pair with high-antioxidant meals and probiotic support to accelerate DNA repair, telomerase activation, and stem cell renewal.',
      note: 'Clinicians recommend ≥8 glasses of water and Mediterranean-style macro balance.',
    },
    {
      number: 3,
      label: 'Sustain',
      title: 'Maintain long-term cellular defense',
      description: 'Continue daily intake for chronic oxidative load reduction, improved mitochondrial output, and continued tissue repair.',
      note: 'Quarterly labs recommended for liver enzymes, inflammatory markers, and NAD+ monitoring.',
    },
  ]

  return (
    <section id="protocol" className="max-w-6xl mx-auto px-6">
      <div className="rounded-3xl bg-white card-shadow p-8 md:p-12 space-y-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Dosage architecture</p>
            <h3 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight">Medical protocol in three phases</h3>
            <p className="text-base md:text-lg text-slate-600">
              Designed for lasting cell renewal, the Nanucell protocol combines daily supplementation with lifestyle checkpoints
              and biomarker monitoring.
            </p>
          </div>
          <div className="mt-6 md:mt-0 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-800">
            <p className="font-semibold">Clinical oversight</p>
            <p className="text-slate-600">All patients receive telehealth guidance, labs, and dosage adjustments every 60 days.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {phases.map((phase) => (
            <div key={phase.number} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-slate-900 text-purple-100 flex items-center justify-center font-semibold">
                  {phase.number}
                </span>
                <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{phase.label}</p>
              </div>
              <h4 className="text-lg font-semibold text-slate-900">{phase.title}</h4>
              <p className="text-sm text-slate-600">{phase.description}</p>
              <p className="text-xs text-slate-500 italic">{phase.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
