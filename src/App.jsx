import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArchiveView } from './views/ArchiveView.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ArchiveView />
  </React.StrictMode>,
);

