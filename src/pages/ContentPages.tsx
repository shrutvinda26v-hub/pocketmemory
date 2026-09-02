import { type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getPost, posts } from '../data/posts'
import { PageShell } from '../layout'

type ContentPageProps = {
  kicker: string
  title: string
  lead: string
  children: ReactNode
}

export function ContentPage({ kicker, title, lead, children }: ContentPageProps) {
  return (
    <PageShell narrow>
      <header className="page-intro">
        <p className="page-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="page-lead">{lead}</p>
      </header>
      <div className="prose">{children}</div>
    </PageShell>
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
        <ul className="rate-list">
          <li>
            <span>Standard</span>
            <strong>Free over $40 · 2–4 days</strong>
          </li>
          <li>
            <span>Under $40</span>
            <strong>$6 · 2–4 days</strong>
          </li>
          <li>
            <span>Overnight</span>
            <strong>$18 · next morning</strong>
          </li>
        </ul>
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
            <Link to="/shop" className="text-mini">
              See the collection
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function BlogPage() {
  return (
    <ContentPage
      kicker="Journal"
      title="Notes from the studio floor."
      lead="Short pieces on materials, manners, and living with animals who have opinions."
    >
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug} className="post-card">
            <span>{post.date}</span>
            <h2>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`} className="text-mini">
              Read note
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined
  if (!post) return <Navigate to="/blog" replace />

  return (
    <PageShell narrow>
      <nav className="crumb">
        <Link to="/blog">Journal</Link>
        <span>/</span>
        <span>{post.title}</span>
      </nav>
      <header className="page-intro">
        <p className="page-kicker">{post.date}</p>
        <h1>{post.title}</h1>
        <p className="page-lead">{post.excerpt}</p>
      </header>
      <div className="post-hero">
        <img src={post.image} alt="" />
      </div>
      <div className="prose">
        {post.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </PageShell>
  )
}
