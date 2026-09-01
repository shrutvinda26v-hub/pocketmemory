import { Header } from '../Header'
import { useCart } from '../cart'
import { formatPrice, products } from '../data/products'

export function ShopPage() {
  const { add } = useCart()

  return (
    <div className="canvas canvas-page">
      <Header />
      <main className="page-main">
        <header className="page-intro">
          <p className="page-kicker">The collection</p>
          <h1>Quiet luxury for everyday paws.</h1>
          <p className="page-lead">
            Four essentials, edited tightly. No noise — just pieces pets actually use.
          </p>
        </header>

        <ul className="product-grid">
          {products.map((product) => (
            <li key={product.id} className="shop-card">
              <div className="shop-visual">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="shop-meta">
                <span>{product.category}</span>
                <h2>{product.name}</h2>
                <p>{product.blurb}</p>
                <div className="shop-row">
                  <strong>{formatPrice(product.price)}</strong>
                  <button type="button" className="ghost-btn" onClick={() => add(product)}>
                    Add to bag
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
