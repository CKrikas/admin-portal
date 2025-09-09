import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAuth } from './auth'

initAuth()
  .catch(err => console.warn('Keycloak init failed:', err))
  .finally(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode><App /></StrictMode>
    )
  })
