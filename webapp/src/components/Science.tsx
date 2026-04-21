export default function Science() {
  const articles = [
    {
      category: 'Cellular regeneration',
      title: 'Stem cell renewal pathways',
      description: 'NMN drives NAD+-dependent sirtuin activation, triggering stem cell proliferation and supporting musculoskeletal recovery. When paired with Resveratrol, synergy extends to autophagy and metabolic flexibility.',
      references: [
        'Reference: Yoshino et al., Cell Metabolism, 2021',
        '32% increase in muscle stem cell activity (animal model)',
      ],
    },
    {
      category: 'Neuroprotection',
      title: 'Cognitive health & focus',
      description: 'Clinical doses of Curcumin and Ginkgo biloba flavonoids reduce neuroinflammation, enhance cerebral perfusion, and stabilize synaptic plasticity for sharper recall and sustained focus.',
      references: [
        'Reference: Small et al., American Journal of Geriatric Psychiatry, 2018',
        '28% improvement in memory assessments over 18 months',
      ],
    },
    {
      category: 'Cardiometabolic',
      title: 'Metabolic optimization',
      description: 'Berberine and alpha lipoic acid stabilize insulin sensitivity, reduce lipid oxidation, and support arterial elasticity, making Ultima Stem Plus a frontline ally for metabolic health plans.',
      references: [
        'Reference: Yin et al., Metabolism, 2022',
        'HbA1c reductions of 0.9% in 90 days (adjunct therapy)',
      ],
    },
  ]

  return (
    <section id="science" className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Peer-reviewed evidence</p>
        <h3 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight">
          The science driving Nanucell Ultima Stem Plus
        </h3>
        <p className="text-base md:text-lg text-slate-600">
          Our bioactive complex is engineered in partnership with clinical nutritionists to address oxidative stress,
          NAD+ depletion, and telomere shortening—key accelerants of systemic aging and chronic disease progression.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <article key={index} className="bg-white rounded-3xl p-6 border border-slate-100 card-shadow">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-[0.3em]">{article.category}</p>
            <h4 className="mt-4 text-lg font-semibold text-slate-900">{article.title}</h4>
            <p className="text-sm text-slate-600 mt-3">{article.description}</p>
            <div className="divider my-5"></div>
            <ul className="space-y-2 text-sm text-slate-500">
              {article.references.map((ref, refIndex) => (
                <li key={refIndex}>• {ref}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
