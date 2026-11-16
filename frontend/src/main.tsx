import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Canonical con el dominio donde realmente está publicado el sitio.
const canonical = document.createElement('link');
canonical.rel = 'canonical';
canonical.href = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
document.head.appendChild(canonical);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
