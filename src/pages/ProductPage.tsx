import { Link, Navigate, useParams } from 'react-router-dom'
import { useCart } from '../cart'
import { formatPrice, getProduct, relatedProducts } from '../data/products'
import { StarIcon } from '../icons'
import { PageShell } from '../layout'

export function ProductPage() {
  const { id } = useParams()
  const product = id ? getProduct(id) : undefined
  const { add, isSaved, toggleSaved } = useCart()

  if (!product) return <Navigate to="/shop" replace />

  return (
    <PageShell>
      <nav className="crumb">
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <article className="pdp">
        <div className="pdp-visual">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="pdp-copy">
          <p className="page-kicker">
            {product.brand} · {product.category}
          </p>
          <h1>{product.name}</h1>
          <p className="pdp-rating">
            <StarIcon /> {product.rating}
            <span>{product.reviews} reviews</span>
          </p>
          <p className="page-lead">{product.description}</p>
          <p className="pdp-price">{formatPrice(product.price)}</p>
          <div className="pdp-actions">
            <button type="button" className="cta" onClick={() => add(product)}>
              <span>Add to bag</span>
            </button>
            <button
              type="button"
              className={`ghost-btn ${isSaved(product.id) ? 'is-on' : ''}`}
              onClick={() => toggleSaved(product)}
            >
              {isSaved(product.id) ? 'Saved' : 'Save'}
            </button>
          </div>
          <ul className="pdp-details">
            {product.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </article>

      <section className="related">
        <h2>Also in the studio</h2>
        <ul className="related-grid">
          {relatedProducts(product.id).map((item) => (
            <li key={item.id}>
              <Link to={`/shop/${item.id}`} className="related-card">
                <img src={item.image} alt="" />
                <p>{item.name}</p>
                <span>{formatPrice(item.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  )
}
