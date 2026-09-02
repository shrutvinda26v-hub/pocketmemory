import { useEffect, useId, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from './cart'
import { searchPosts } from './data/posts'
import { formatPrice, searchProducts } from './data/products'
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
  const { items, count, total, remove, setQty, saved, savedCount, toggleSaved } = useCart()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [query, setQuery] = useState('')
  const searchId = useId()
  const navigate = useNavigate()

  const productHits = useMemo(() => searchProducts(query), [query])
  const postHits = useMemo(() => searchPosts(query), [query])

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

  const go = (path: string) => {
    setOverlay(null)
    setQuery('')
    navigate(path)
  }

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
            aria-label={`Wishlist, ${savedCount} saved items`}
            onClick={() => setOverlay('wishlist')}
          >
            <StarIcon />
            <span className="wishlist-count">{savedCount}</span>
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
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    go(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
                  }}
                >
                  <label className="sr-only" htmlFor={searchId}>
                    Search products
                  </label>
                  <input
                    id={searchId}
                    className="search-input"
                    placeholder="Beds, toys, bowls…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus
                  />
                </form>
                {query.trim() ? (
                  <div className="search-hits">
                    {productHits.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="search-hit"
                        onClick={() => go(`/shop/${product.id}`)}
                      >
                        <img src={product.image} alt="" />
                        <span>{product.name}</span>
                      </button>
                    ))}
                    {postHits.map((post) => (
                      <button
                        key={post.slug}
                        type="button"
                        className="search-hit"
                        onClick={() => go(`/blog/${post.slug}`)}
                      >
                        <img src={post.image} alt="" />
                        <span>{post.title}</span>
                      </button>
                    ))}
                    {productHits.length === 0 && postHits.length === 0 ? (
                      <p className="overlay-hint">No matches. Try “bed” or “bowl”.</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="overlay-hint">Try “cat house” or “sherpa bed”.</p>
                )}
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
                          <div className="qty">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label={`Decrease ${item.name}`}
                            >
                              −
                            </button>
                            <span>{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label={`Increase ${item.name}`}
                            >
                              +
                            </button>
                          </div>
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
                {items.length > 0 ? (
                  <Link to="/checkout" className="cta overlay-cta" onClick={() => setOverlay(null)}>
                    <span>Checkout</span>
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
                ) : (
                  <Link to="/shop" className="cta overlay-cta" onClick={() => setOverlay(null)}>
                    <span>Continue shopping</span>
                  </Link>
                )}
              </>
            ) : null}

            {overlay === 'wishlist' ? (
              <>
                <p className="overlay-kicker">Saved for later</p>
                {saved.length === 0 ? (
                  <p className="overlay-hint">Nothing saved yet. Star a piece from the shop.</p>
                ) : (
                  <ul className="cart-list">
                    {saved.map((item) => (
                      <li key={item.id} className="cart-row">
                        <img src={item.image} alt="" />
                        <div>
                          <p>{item.name}</p>
                          <span>{formatPrice(item.price)}</span>
                        </div>
                        <button type="button" onClick={() => toggleSaved(item)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/shop" className="text-link" onClick={() => setOverlay(null)}>
                  Browse the collection
                </Link>
              </>
            ) : null}

            {overlay === 'account' ? (
              <>
                <p className="overlay-kicker">Hello, Maya</p>
                <p className="overlay-hint">
                  Studio preview account. Orders, saved addresses, and the treats
                  your pets reorder most.
                </p>
                <p className="account-order">Last order · Fox Plush Toy · In transit</p>
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
