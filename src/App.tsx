import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './cart'
import { BlogPage, BrandsPage, DeliveryPage } from './pages/ContentPages'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="frame">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}
