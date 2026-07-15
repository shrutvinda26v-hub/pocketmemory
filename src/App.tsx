import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { WardrobeProvider } from './context/WardrobeContext'
import { ClosetPage } from './pages/ClosetPage'
import { MemoryPage } from './pages/MemoryPage'
import { OutfitsPage } from './pages/OutfitsPage'
import { TodayPage } from './pages/TodayPage'

export default function App() {
  return (
    <WardrobeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/closet" element={<ClosetPage />} />
            <Route path="/outfits" element={<OutfitsPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </WardrobeProvider>
  )
}
