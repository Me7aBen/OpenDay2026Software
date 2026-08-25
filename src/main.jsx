import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// GitHub Pages no reescribe rutas: al recargar /carreras/x sirve `404.html`,
// que guarda la ruta pedida y redirige acá. Recuperarla antes de montar la app
// es lo que hace que las URLs profundas funcionen igual que en un servidor
// normal. Ver `public/404.html`.
const rutaPendiente = sessionStorage.getItem('ruta-pendiente');
if (rutaPendiente) {
  sessionStorage.removeItem('ruta-pendiente');
  window.history.replaceState({}, '', rutaPendiente);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
