import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DiscoveryApp from './discovery/App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DiscoveryApp />
  </StrictMode>
);
