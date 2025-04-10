mport { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../9by4app/src/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
