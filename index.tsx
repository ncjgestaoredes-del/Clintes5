
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const render = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Pequeno delay para garantir que o DOM e os módulos esm.sh estejam prontos
if (document.readyState === 'complete') {
  render();
} else {
  window.addEventListener('load', render);
}
