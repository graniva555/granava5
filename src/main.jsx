import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

// Signal the inline preloader (index.html) that the app has mounted and painted,
// so it can fade out at the earliest correct moment. Double rAF = after first paint.
requestAnimationFrame(() => requestAnimationFrame(() => {
  if (typeof window !== 'undefined' && window.__granavaReady) window.__granavaReady()
}))
