import { useEffect, useId, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from './cart'
import { formatPrice } from './data/products'
import {
  BagIcon,
  CloseIcon,
  MenuIcon,
  PawIcon,
  SearchIcon,
  StarIcon,
} from './icons'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/delivery', label: 'Delivery and payment' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Blog' },
]

type Overlay = 'search' | 'cart' | 'menu' | 'account' | 'wishlist' | null

export function Header() {
  const { items, count, total, remove } = useCart()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const searchId = useId()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('overlay-open', overlay !== null)
  }, [overlay])

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="CozyPaws home">
          <span className="brand-mark" aria-hidden="true">
            <PawIcon />
          </span>
          <span className="brand-name">CozyPaws</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-round"
            aria-label="Search"
            onClick={() => setOverlay('search')}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className="wishlist-btn"
            aria-label="Wishlist, 4 saved items"
            onClick={() => setOverlay('wishlist')}
          >
            <StarIcon />
            <span className="wishlist-count">4</span>
          </button>

          <button
            type="button"
            className="cart-control"
            aria-label={`Shopping cart, ${count} items, ${formatPrice(total)}`}
            onClick={() => setOverlay('cart')}
          >
            <span className="cart-icon-wrap">
              <BagIcon />
              <span className="cart-badge">{count}</span>
            </span>
            <span className="cart-total">{formatPrice(total)}</span>
          </button>

          <button
            type="button"
            className="avatar-btn"
            aria-label="Account"
            onClick={() => setOverlay('account')}
          >
            <img src="/images/user-profile.jpg" alt="" />
          </button>

          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            onClick={() => setOverlay('menu')}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {overlay ? (
        <div className="overlay" role="presentation" onClick={() => setOverlay(null)}>
          <div
            className={`overlay-panel overlay-${overlay}`}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close"
              aria-label="Close"
              onClick={() => setOverlay(null)}
            >
              <CloseIcon />
            </button>

            {overlay === 'search' ? (
              <>
                <p className="overlay-kicker">Search the collection</p>
                <label className="sr-only" htmlFor={searchId}>
                  Search products
                </label>
                <input
                  id={searchId}
                  className="search-input"
                  placeholder="Beds, toys, bowls…"
                  autoFocus
                />
                <p className="overlay-hint">Try “cat house” or “sherpa bed”.</p>
              </>
            ) : null}

            {overlay === 'cart' ? (
              <>
                <p className="overlay-kicker">Your bag</p>
                {items.length === 0 ? (
                  <p className="overlay-hint">Your bag is empty.</p>
                ) : (
                  <ul className="cart-list">
                    {items.map((item) => (
                      <li key={item.id} className="cart-row">
                        <img src={item.image} alt="" />
                        <div>
                          <p>{item.name}</p>
                          <span>
                            {item.qty} × {formatPrice(item.price)}
                          </span>
                        </div>
                        <button type="button" onClick={() => remove(item.id)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="cart-footer">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
                <Link to="/shop" className="cta overlay-cta" onClick={() => setOverlay(null)}>
                  <span>Continue shopping</span>
                  <span className="cta-arrow">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path
                        d="M13 6.5 18.5 12 13 17.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </>
            ) : null}

            {overlay === 'wishlist' ? (
              <>
                <p className="overlay-kicker">Saved for later</p>
                <p className="overlay-hint">
                  Four quiet favorites waiting for the next treat run.
                </p>
                <ul className="cart-list">
                  <li className="cart-row">
                    <img src="/images/cat-house.png" alt="" />
                    <div>
                      <p>Cozy Cat House</p>
                      <span>$49.99</span>
                    </div>
                  </li>
                  <li className="cart-row">
                    <img src="/images/dog-bed.png" alt="" />
                    <div>
                      <p>Cloud Sherpa Bed</p>
                      <span>$79</span>
                    </div>
                  </li>
                  <li className="cart-row">
                    <img src="/images/pet-bowl.png" alt="" />
                    <div>
                      <p>Forest Ceramic Bowl</p>
                      <span>$24</span>
                    </div>
                  </li>
                  <li className="cart-row">
                    <img src="/images/fox-toy.png" alt="" />
                    <div>
                      <p>Fox Plush Toy</p>
                      <span>$21</span>
                    </div>
                  </li>
                </ul>
              </>
            ) : null}

            {overlay === 'account' ? (
              <>
                <p className="overlay-kicker">Hello, Maya</p>
                <p className="overlay-hint">
                  Orders, saved addresses, and the treats your pets reorder most.
                </p>
                <Link to="/shop" className="text-link" onClick={() => setOverlay(null)}>
                  Browse new arrivals
                </Link>
              </>
            ) : null}

            {overlay === 'menu' ? (
              <nav className="mobile-nav" aria-label="Mobile">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
                    end={link.to === '/'}
                    onClick={() => setOverlay(null)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
