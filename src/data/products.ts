export type Product = {
  id: string
  name: string
  price: number
  image: string
  category: string
  brand: string
  blurb: string
  description: string
  details: string[]
  rating: number
  reviews: number
}

export const products: Product[] = [
  {
    id: 'cat-house',
    name: 'Cozy Cat House',
    price: 49.99,
    image: '/images/cat-house.png',
    category: 'Beds',
    brand: 'Oak & Fur',
    blurb: 'A two-level hideaway in plush sherpa for afternoon naps.',
    description:
      'Two stacked dens in warm sherpa, sized for cats who like a loft and a cave. The lower room stays dim. The upper perch looks out over the room without asking for attention.',
    details: [
      'Machine-washable sherpa cover',
      'Firmed base so it does not collapse mid-nap',
      'Works as a side table if you are that kind of household',
    ],
    rating: 4.8,
    reviews: 214,
  },
  {
    id: 'dog-bed',
    name: 'Cloud Sherpa Bed',
    price: 79,
    image: '/images/dog-bed.png',
    category: 'Beds',
    brand: 'Oak & Fur',
    blurb: 'Bolstered rim, washable cover, cloud-soft fill.',
    description:
      'A low nest with a bolster they can use as a chin rest. The fill is dense enough for joints, soft enough that they stop shopping the sofa.',
    details: [
      'Removable cover, cold wash',
      'Hidden zipper so it does not get chewed for sport',
      'Fits most medium dogs and ambitious cats',
    ],
    rating: 4.7,
    reviews: 168,
  },
  {
    id: 'bowl',
    name: 'Forest Ceramic Bowl',
    price: 24,
    image: '/images/pet-bowl.png',
    category: 'Dining',
    brand: 'Paw & Co',
    blurb: 'Matte glaze, weighted base, made for slow meals.',
    description:
      'A heavy ceramic bowl in forest glaze. It stays put when they eat like they have somewhere to be. No ringing stainless. No scratched plastic.',
    details: [
      'Lead-free matte glaze',
      'Wide foot so it does not skate on tile',
      'Dishwasher safe, if you must',
    ],
    rating: 4.9,
    reviews: 96,
  },
  {
    id: 'fox',
    name: 'Fox Plush Toy',
    price: 21,
    image: '/images/fox-toy.png',
    category: 'Toys',
    brand: 'Nibble',
    blurb: 'Squeaky core, gentle on teeth, endlessly tossable.',
    description:
      'A small fox with a soft squeak, not a siren. The plush holds up past the first enthusiastic week. Designed for indoor fetch and the quiet hours after dinner.',
    details: [
      'Hidden squeaker, medium voice',
      'Reinforced seams at the ears',
      'Suitable for gentle to moderate chewers',
    ],
    rating: 4.6,
    reviews: 142,
  },
]

export const formatPrice = (value: number) =>
  value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`

export const shippingFor = (subtotal: number) =>
  subtotal >= 40 || subtotal === 0 ? 0 : 6

export function getProduct(id: string) {
  return products.find((product) => product.id === id)
}

export function relatedProducts(id: string, limit = 3) {
  return products.filter((product) => product.id !== id).slice(0, limit)
}

export function searchProducts(query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return products.filter((product) =>
    [product.name, product.blurb, product.category, product.brand].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  )
}
