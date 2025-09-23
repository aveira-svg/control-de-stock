import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppLayout } from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ConfigPage from './components/Configuration/ConfigPage'
import { useDarkMode } from './hooks/useDarkMode'

function Root() {
  useDarkMode(false)
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  { path: '/config', element: <AppLayout><ConfigPage /></AppLayout> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
