import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart'
import { formatPrice, shippingFor } from '../data/products'
import { PageShell } from '../layout'

export function CheckoutPage() {
  const { items, total, clear, setQty, remove } = useCart()
  const [placed, setPlaced] = useState<string | null>(null)
  const shipping = shippingFor(total)
  const grand = total + shipping

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || 'Maya').split(' ')[0]
    const order = `CP-${Date.now().toString().slice(-6)}`
    clear()
    setPlaced(`${name} · ${order}`)
  }

  if (placed) {
    return (
      <PageShell narrow>
        <header className="page-intro">
          <p className="page-kicker">Order placed</p>
          <h1>It is on its way.</h1>
          <p className="page-lead">
            {placed}. Packed in recycled fiber, usually out the same day if you
            ordered before 2pm.
          </p>
        </header>
        <Link to="/shop" className="cta">
          <span>Back to the collection</span>
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="page-intro">
        <p className="page-kicker">Checkout</p>
        <h1>A quiet bag. A simple send.</h1>
        <p className="page-lead">
          Complimentary shipping over $40. This is a studio preview — no card is
          charged.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="empty-note">
          Your bag is empty.{' '}
          <Link to="/shop" className="text-link">
            Choose something they will actually use.
          </Link>
        </p>
      ) : (
        <div className="checkout">
          <form className="checkout-form" onSubmit={onSubmit}>
            <label>
              Full name
              <input name="name" required defaultValue="Maya Chen" autoComplete="name" />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue="maya@cozypaws.studio"
                autoComplete="email"
              />
            </label>
            <label>
              Address
              <input
                name="address"
                required
                defaultValue="18 Grove Lane, Portland"
                autoComplete="street-address"
              />
            </label>
            <div className="field-row">
              <label>
                City
                <input name="city" required defaultValue="Portland" autoComplete="address-level2" />
              </label>
              <label>
                Postal
                <input name="zip" required defaultValue="97201" autoComplete="postal-code" />
              </label>
            </div>
            <label>
              Card
              <input
                name="card"
                required
                inputMode="numeric"
                defaultValue="4242 4242 4242 4242"
                autoComplete="cc-number"
              />
            </label>
            <button type="submit" className="cta checkout-submit">
              <span>Place order · {formatPrice(grand)}</span>
            </button>
          </form>

          <aside className="checkout-bag">
            <p className="overlay-kicker">Bag</p>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-row">
                  <img src={item.image} alt="" />
                  <div>
                    <p>{item.name}</p>
                    <div className="qty">
                      <button type="button" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">
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
            <div className="cart-footer">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="cart-footer">
              <span>Shipping</span>
              <strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong>
            </div>
            <div className="cart-footer">
              <span>Total</span>
              <strong>{formatPrice(grand)}</strong>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  )
}
