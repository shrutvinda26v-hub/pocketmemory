import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../cart'
import { formatPrice, products, searchProducts } from '../data/products'
import { PageShell } from '../layout'

const filters = ['All', 'Beds', 'Dining', 'Toys'] as const

export function ShopPage() {
  const { add, isSaved, toggleSaved } = useCart()
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')

  const list = useMemo(() => {
    const base = query ? searchProducts(query) : products
    if (filter === 'All') return base
    return base.filter((product) => product.category === filter)
  }, [filter, query])

  return (
    <PageShell>
      <header className="page-intro">
        <p className="page-kicker">The collection</p>
        <h1>Quiet luxury for everyday paws.</h1>
        <p className="page-lead">
          {query
            ? `Results for “${query}”. Four essentials, edited tightly.`
            : 'Four essentials, edited tightly. No noise — just pieces pets actually use.'}
        </p>
      </header>

      <div className="filter-row" role="tablist" aria-label="Product type">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            className={`filter-chip ${filter === name ? 'is-on' : ''}`}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="empty-note">Nothing in this corner. Try another word, or clear the filter.</p>
      ) : (
        <ul className="product-grid">
          {list.map((product) => (
            <li key={product.id} className="shop-card">
              <Link to={`/shop/${product.id}`} className="shop-visual">
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="shop-meta">
                <span>{product.category}</span>
                <h2>
                  <Link to={`/shop/${product.id}`}>{product.name}</Link>
                </h2>
                <p>{product.blurb}</p>
                <div className="shop-row">
                  <strong>{formatPrice(product.price)}</strong>
                  <div className="shop-actions">
                    <button
                      type="button"
                      className={`text-mini ${isSaved(product.id) ? 'is-on' : ''}`}
                      onClick={() => toggleSaved(product)}
                    >
                      {isSaved(product.id) ? 'Saved' : 'Save'}
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => add(product)}>
                      Add to bag
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
