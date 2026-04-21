export default function Reviews() {
  const reviews = [
    {
      category: 'Breast health recovery',
      text: '"Three months into Ultima Stem Plus and adjunct therapies, MRI confirmed regression of a benign mass. Energy levels stabilized and inflammatory markers normalized."',
      author: 'Anonymized patient • Manila',
    },
    {
      category: 'Kidney stone relief',
      text: '"With our hydration protocol and Nanucell supplements, lithotripsy fragments were expelled naturally within weeks. Zero hospital readmissions since."',
      author: 'Anonymized patient • Cebu',
    },
    {
      category: 'Metabolic reset',
      text: '"Combining Berberine and Ultima Stem Plus, I reversed fatigue, stabilized glucose, and improved lipid panels. I feel younger, stronger, and more focused."',
      author: 'Willie Del Rosario • Seattle',
    },
  ]

  return (
    <section id="reviews" className="max-w-6xl mx-auto px-6">
      <div className="rounded-3xl bg-slate-900 text-slate-100 p-8 md:p-12 card-shadow">
        <div className="md:flex md:items-end md:justify-between gap-10">
          <div className="space-y-4">
            <p className="text-purple-400 font-semibold tracking-[0.45em] text-xs uppercase">Patient experiences</p>
            <h3 className="section-title text-3xl md:text-4xl leading-tight">Clinical outcome narratives</h3>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              We track every patient&apos;s journey through digital health dashboards. Here are a few anonymized accounts from our
              cellular renewal program.
            </p>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-2xl px-6 py-4 text-center">
            <p className="text-4xl font-semibold text-white">4.6 ★</p>
            <p className="text-xs text-purple-100 uppercase tracking-[0.35em]">Average satisfaction</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {reviews.map((review, index) => (
            <article key={index} className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3">
              <p className="text-purple-200 text-xs uppercase tracking-[0.35em]">{review.category}</p>
              <p className="text-sm text-slate-100 leading-relaxed">{review.text}</p>
              <p className="text-xs text-purple-100/70">{review.author}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
