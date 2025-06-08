import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import Font Awesome (jeśli nie chcesz używać CDN)
// import '@fortawesome/fontawesome-free/css/all.min.css';

// Opcjonalnie: Import reportWebVitals dla monitorowania wydajności
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Opcjonalnie: Monitorowanie wydajności aplikacji
// reportWebVitals(console.log);

// Service Worker (opcjonalnie dla PWA)
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }