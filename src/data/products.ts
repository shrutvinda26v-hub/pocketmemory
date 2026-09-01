export type Product = {
  id: string
  name: string
  price: number
  image: string
  category: string
  blurb: string
}

export const products: Product[] = [
  {
    id: 'cat-house',
    name: 'Cozy Cat House',
    price: 49.99,
    image: '/images/cat-house.png',
    category: 'Beds',
    blurb: 'A two-level hideaway in plush sherpa for afternoon naps.',
  },
  {
    id: 'dog-bed',
    name: 'Cloud Sherpa Bed',
    price: 79,
    image: '/images/dog-bed.png',
    category: 'Beds',
    blurb: 'Bolstered rim, washable cover, cloud-soft fill.',
  },
  {
    id: 'bowl',
    name: 'Forest Ceramic Bowl',
    price: 24,
    image: '/images/pet-bowl.png',
    category: 'Dining',
    blurb: 'Matte glaze, weighted base, made for slow meals.',
  },
  {
    id: 'fox',
    name: 'Fox Plush Toy',
    price: 21,
    image: '/images/fox-toy.png',
    category: 'Toys',
    blurb: 'Squeaky core, gentle on teeth, endlessly tossable.',
  },
]

export const formatPrice = (value: number) =>
  value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`
