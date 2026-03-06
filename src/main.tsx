import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedDemoRecipes } from './storage/seed'

const mount = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

seedDemoRecipes().then(mount).catch((err) => {
  console.error('[Simmer] Demo seed failed, mounting anyway:', err)
  mount()
})
