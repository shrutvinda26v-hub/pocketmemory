import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Header } from './Header'
import { PawIcon } from './icons'

const footerLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Journal' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <Link to="/" className="brand footer-brand" aria-label="CozyPaws home">
        <span className="brand-mark" aria-hidden="true">
          <PawIcon />
        </span>
        <span className="brand-name">CozyPaws</span>
      </Link>
      <nav className="footer-nav" aria-label="Footer">
        {footerLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="footer-note">Quiet essentials for pets who live in the house.</p>
    </footer>
  )
}

export function PageShell({
  children,
  narrow = false,
}: {
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <div className="canvas canvas-page">
      <Header />
      <main className={narrow ? 'page-main page-main-narrow' : 'page-main'}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
