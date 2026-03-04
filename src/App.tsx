import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CookingModeWrapper from './pages/CookingMode'
import Extract from './pages/Extract'
import RecipeDetail from './pages/RecipeDetail'
import { OfflineBanner } from './components/ui/OfflineBanner'

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/extract" element={<Extract />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/cook/:id" element={<CookingModeWrapper />} />
      </Routes>
    </BrowserRouter>
  )
}
