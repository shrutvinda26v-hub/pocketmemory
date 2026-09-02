export type Post = {
  slug: string
  title: string
  date: string
  excerpt: string
  image: string
  body: string[]
}

export const posts: Post[] = [
  {
    slug: 'new-bed-without-the-side-eye',
    title: 'How to introduce a new bed without the side-eye',
    date: '12 Aug 2026',
    excerpt: 'Place it where they already nap. Rub a worn T-shirt on the rim. Wait.',
    image: '/images/dog-bed.png',
    body: [
      'A new bed is furniture to you and a suspicious object to them. Do not make a ceremony of it. Put it where they already collapse — the sun stripe, the hallway corner, the place they already chose.',
      'Rub a worn shirt on the rim. Leave a toy they already like in the middle. Then ignore it. The fastest way to delay adoption is to hover, clap, or film the first sit.',
      'If they still prefer the sofa, that is information. Move the bed closer to the sofa, not the other way around. Most of our studio dogs switched by the third quiet evening.',
    ],
  },
  {
    slug: 'one-excellent-bowl',
    title: 'The case for one excellent bowl',
    date: '28 Jul 2026',
    excerpt: 'Plastic scratches. Stainless sings. Ceramic, if it is heavy enough, simply works.',
    image: '/images/pet-bowl.png',
    body: [
      'Plastic bowls scratch and hold onto last night. Stainless is honest, but it rings on tile and skates when they eat with purpose. Ceramic, if the foot is wide and the glaze is quiet, just sits there.',
      'We carry one bowl because most kitchens do not need a set. One for water, one for food if you insist. Wash it. Put it back. That is the whole ritual.',
      'Weighted bases matter more than color. A matte forest glaze is simply the one that disappears into our rooms.',
    ],
  },
  {
    slug: 'quieter-toys',
    title: 'Why our studio dogs prefer quieter toys',
    date: '03 Jul 2026',
    excerpt: 'A squeak is a tool, not a personality. We like toys that survive the third week.',
    image: '/images/fox-toy.png',
    body: [
      'A squeak is useful. A siren is not. The toys that last here have a muffled voice and seams that do not surrender on day four.',
      'We stopped buying novelty shapes. A fox, a knot, a ball they can actually hold. The studio dogs decide in about ninety seconds whether something is worth keeping.',
      'If it still looks like itself after the third week, it stays on the floor. Everything else is a story we tell ourselves at the register.',
    ],
  },
]

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function searchPosts(query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return posts.filter((post) =>
    [post.title, post.excerpt].some((field) => field.toLowerCase().includes(needle)),
  )
}
