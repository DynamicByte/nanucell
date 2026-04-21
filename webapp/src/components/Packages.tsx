import Link from 'next/link'

export default function Packages() {
  const packages = [
    {
      type: 'Business',
      title: 'Personal renewal plan',
      price: '₱11,940',
      subtitle: 'Introductory',
      features: [
        '1 bottle Ultima Stem Plus (30-day supply)',
        'Lifetime Nanucell membership',
        '25% off all future therapeutic orders',
      ],
      cta: 'Begin intake',
      featured: false,
    },
    {
      type: 'Executive',
      title: 'Advanced care plan',
      price: '₱47,760',
      subtitle: 'Best for couples',
      features: [
        '4 bottles Ultima Stem Plus (120-day supply)',
        'Quarterly telehealth consults',
        'Complementary metabolic labs (annually)',
      ],
      cta: 'Schedule consult',
      featured: true,
    },
    {
      type: 'Elite',
      title: 'Comprehensive longevity',
      price: '₱149,000',
      subtitle: 'Physician-guided',
      features: [
        '12 bottles Ultima Stem Plus',
        'Berberine & BerryOrac bundles',
        'Bi-annual comprehensive labs + concierge support',
      ],
      cta: 'Talk to medical team',
      featured: false,
    },
  ]

  return (
    <section id="packages" className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Tailored membership</p>
        <h3 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight">Choose your cellular reset path</h3>
        <p className="text-base md:text-lg text-slate-600">
          Every package includes lifetime membership, clinical monitoring, and preferred pricing on Nanucell therapeutics.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className={`rounded-3xl p-8 card-shadow flex flex-col ${
              pkg.featured
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'bg-white border border-slate-100'
            }`}
          >
            <p
              className={`text-sm font-semibold uppercase tracking-[0.25em] ${
                pkg.featured ? 'text-purple-300' : 'text-purple-700'
              }`}
            >
              {pkg.type}
            </p>
            <h4 className={`text-2xl font-semibold mt-3 ${pkg.featured ? 'text-white' : 'text-slate-900'}`}>
              {pkg.title}
            </h4>
            <p className={`text-4xl font-semibold mt-6 ${pkg.featured ? 'text-white' : 'text-slate-900'}`}>
              {pkg.price}
            </p>
            <p
              className={`text-xs uppercase tracking-[0.35em] ${
                pkg.featured ? 'text-purple-200' : 'text-slate-500'
              }`}
            >
              {pkg.subtitle}
            </p>
            <ul className={`mt-6 space-y-3 text-sm flex-1 ${pkg.featured ? 'text-slate-200' : 'text-slate-600'}`}>
              {pkg.features.map((feature, featureIndex) => (
                <li key={featureIndex}>• {feature}</li>
              ))}
            </ul>
            <Link
              href="#consult"
              className={`mt-6 inline-flex justify-center items-center gap-2 py-3 rounded-full font-semibold ${
                pkg.featured
                  ? 'bg-purple-300 text-slate-900'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {pkg.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
