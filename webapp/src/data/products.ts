export type Product = {
  id: string
  title: string
  category: string
  description: string
  price: number
  priceDisplay: string
  image: string
  expertise: string[]
}

export const products: Product[] = [
  {
    id: 'ultima-stem-plus',
    title: 'Ultima Stem Plus',
    category: 'Flagship',
    description: 'NMN + Resveratrol + Curcumin + Berberine complex for comprehensive cellular renewal.',
    price: 11940,
    priceDisplay: '₱11,940',
    image: '/images/ultima-stem-plus.jpg',
    expertise: ['anti-aging', 'metabolic'],
  },
  {
    id: 'berberine',
    title: 'Berberine Pro Complex',
    category: 'Metabolic',
    description: '500mg clinical dose to stabilize insulin signaling and lipid metabolism.',
    price: 5950,
    priceDisplay: '₱5,950',
    image: '/images/berberine.jpg',
    expertise: ['metabolic'],
  },
  {
    id: 'bloom-gluta',
    title: 'Bloom Gluta',
    category: 'Detox & Skin',
    description: 'Glutathione precursors and collagen peptides for liver detox and dermal radiance.',
    price: 1804,
    priceDisplay: '₱1,804',
    image: '/images/bloom-gluta.jpg',
    expertise: ['detox'],
  },
  {
    id: 'carvacrol',
    title: 'Carvacrol',
    category: 'Immune Support',
    description: 'Natural oregano-derived compound for antimicrobial and immune system support.',
    price: 1795,
    priceDisplay: '₱1,795',
    image: '/images/carvacrol.jpg',
    expertise: ['immune'],
  },
  {
    id: 'spirulina',
    title: 'Spirulina',
    category: 'Superfood',
    description: 'Nutrient-dense blue-green algae for energy, detox, and antioxidant protection.',
    price: 1698,
    priceDisplay: '₱1,698',
    image: '/images/spirulina.jpg',
    expertise: ['immune', 'detox', 'anti-aging'],
  },
  {
    id: 'berry-orac',
    title: 'BerryORAC',
    category: 'Antioxidant',
    description: 'High-ORAC berry blend for powerful antioxidant protection and cellular defense.',
    price: 1608,
    priceDisplay: '₱1,608',
    image: '/images/berry-orac.jpg',
    expertise: ['immune', 'anti-aging'],
  },
  {
    id: 'nucleanse',
    title: 'Nucleanse',
    category: 'Cellular Cleanse',
    description: 'Advanced cellular cleansing formula for DNA repair and metabolic optimization.',
    price: 2220,
    priceDisplay: '₱2,220',
    image: '/images/nucleanse-detox.jpg',
    expertise: ['detox', 'metabolic'],
  },
  {
    id: 'equi-c',
    title: 'Equi-C Camu Camu Berry',
    category: 'Vitamin C',
    description: 'Your daily dose of Vitamin C na 3x stronger kaysa ordinary sources.',
    price: 1625,
    priceDisplay: '₱1,625',
    image: '/images/equi=c.jpg',
    expertise: ['immune'],
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const getProductsByExpertise = (expertise: string): Product[] => {
  return products.filter(p => p.expertise.includes(expertise))
}
