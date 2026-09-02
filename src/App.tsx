import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './cart'
import { BlogPage, BlogPostPage, BrandsPage, DeliveryPage } from './pages/ContentPages'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'
import { ShopPage } from './pages/ShopPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="frame">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}
