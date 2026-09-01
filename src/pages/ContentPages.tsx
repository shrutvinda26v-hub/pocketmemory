import { type ReactNode } from 'react'
import { Header } from '../Header'

type ContentPageProps = {
  kicker: string
  title: string
  lead: string
  children: ReactNode
}

export function ContentPage({ kicker, title, lead, children }: ContentPageProps) {
  return (
    <div className="canvas canvas-page">
      <Header />
      <main className="page-main page-main-narrow">
        <header className="page-intro">
          <p className="page-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="page-lead">{lead}</p>
        </header>
        <div className="prose">{children}</div>
      </main>
    </div>
  )
}

export function DeliveryPage() {
  return (
    <ContentPage
      kicker="Delivery and payment"
      title="Arrives quietly. Paid simply."
      lead="Complimentary carbon-offset shipping on every order over $40, packed in recycled fiber."
    >
      <section>
        <h2>Shipping</h2>
        <p>
          Orders placed before 2pm local time leave the same day. Standard delivery is
          two to four days. Overnight exists for last-minute birthdays and sudden
          chew-toy emergencies.
        </p>
      </section>
      <section>
        <h2>Payment</h2>
        <p>
          Cards, Apple Pay, Google Pay, and Shop Pay. We never store full card numbers
          on CozyPaws servers. Gift notes are handwritten on unbleached card stock.
        </p>
      </section>
      <section>
        <h2>Returns</h2>
        <p>
          Thirty days, unused, in original packaging. Beds and bowls come back easily.
          Toys that have clearly been loved are ours to keep — consider them a donation
          to the studio dogs.
        </p>
      </section>
    </ContentPage>
  )
}

export function BrandsPage() {
  const houses = [
    { name: 'Wildernest', note: 'Outdoor-ready wool layers.' },
    { name: 'Paw & Co', note: 'Ceramic bowls, quiet glazes.' },
    { name: 'Nibble', note: 'Small-batch treats, short labels.' },
    { name: 'Oak & Fur', note: 'Solid-wood frames, linen beds.' },
    { name: 'Lumen Leash', note: 'Vegetable-tanned leather goods.' },
    { name: 'Soft Circuit', note: 'GPS tags that do not shout.' },
  ]

  return (
    <ContentPage
      kicker="Brands"
      title="A short list of houses we trust."
      lead="We carry fewer names on purpose. Each one is chosen for material honesty and how it feels in a real living room."
    >
      <ul className="brand-list">
        {houses.map((house) => (
          <li key={house.name}>
            <h2>{house.name}</h2>
            <p>{house.note}</p>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function BlogPage() {
  const posts = [
    {
      title: 'How to introduce a new bed without the side-eye',
      date: '12 Aug 2026',
      excerpt: 'Place it where they already nap. Rub a worn T-shirt on the rim. Wait.',
    },
    {
      title: 'The case for one excellent bowl',
      date: '28 Jul 2026',
      excerpt: 'Plastic scratches. Stainless sings. Ceramic, if it is heavy enough, simply works.',
    },
    {
      title: 'Why our studio dogs prefer quieter toys',
      date: '03 Jul 2026',
      excerpt: 'A squeak is a tool, not a personality. We like toys that survive the third week.',
    },
  ]

  return (
    <ContentPage
      kicker="Journal"
      title="Notes from the studio floor."
      lead="Short pieces on materials, manners, and living with animals who have opinions."
    >
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.title} className="post-card">
            <span>{post.date}</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}
