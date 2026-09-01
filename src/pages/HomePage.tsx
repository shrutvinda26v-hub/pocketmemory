import { Link } from 'react-router-dom'
import { Header } from '../Header'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
} from '../icons'

export function HomePage() {
  return (
    <div className="canvas canvas-home">
      <Header />

      <div className="stage">
        <h1 className="headline">
          Everything
          <br />
          Your Pets Love
        </h1>

        <article className="product-card">
          <div className="product-visual">
            <img src="/images/cat-house.png" alt="Two-level orange sherpa cat house" />
            <Link
              to="/shop"
              className="product-go"
              aria-label="View Cozy Cat House"
            >
              <ArrowUpRightIcon />
            </Link>
          </div>
          <h2>Cozy Cat House</h2>
          <p>$49.99</p>
        </article>

        <article className="video-card">
          <div className="video-visual">
            <img
              src="/images/product-review.jpg"
              alt="A golden retriever nuzzling its owner"
            />
            <a
              className="play-btn"
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Watch product reviews"
            >
              <PlayIcon />
            </a>
          </div>
          <p>
            Watch Product
            <br />
            Reviews on TikTok
            <br />
            and YouTube
          </p>
        </article>

        <img
          className="pet pet-doxie"
          src="/images/dachshund.png"
          alt="Brown dachshund peeking over the page"
        />
        <picture className="pet pet-retriever">
          <source srcSet="/images/golden-retriever.webp" type="image/webp" />
          <img src="/images/golden-retriever.png" alt="Golden retriever looking at the camera" />
        </picture>
        <img
          className="pet pet-cat"
          src="/images/tabby-cat.png"
          alt="Orange tabby cat peeking over the page"
        />

        <section className="bottom" aria-label="Store highlights">
          <div className="panel panel-mint">
            <div className="clients-row">
              <p className="stat">98K+</p>
              <img
                className="mini-avatar"
                src="/images/customer-avatar.jpg"
                alt=""
              />
              <span className="plus-btn" aria-hidden="true">
                <PlusIcon />
              </span>
            </div>
            <p className="panel-copy">
              Happy Clients and Their Pets
              <br />
              Who Love Our Products
            </p>
          </div>

          <div className="panel panel-forest">
            <h2>
              Best Products
              <br />
              for Your Pet
            </h2>
            <Link to="/shop" className="cta">
              <span>Explore Products</span>
              <span className="cta-arrow">
                <ArrowRightIcon />
              </span>
            </Link>
          </div>

          <div className="panel panel-mint">
            <p className="stat rating-stat">
              4.6 <StarIcon />
            </p>
            <p className="panel-copy">
              Based on Reviews from Happy
              <br />
              Pet Owners Worldwide
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
