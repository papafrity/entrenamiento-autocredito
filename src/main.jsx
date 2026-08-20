import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Aplicar tema guardado antes del primer render para evitar flash
try {
  const savedTheme = localStorage.getItem('autocredito_theme') || 'naranja';
  document.documentElement.setAttribute('data-theme', savedTheme);
} catch (e) { /* ignore */ }

// Registrar service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
