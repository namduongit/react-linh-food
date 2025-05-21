import React from 'react';
import ReactDOM from 'react-dom/client';
// toast script
import './services/toast.js';
// toast css
import './assets/css/toast.css';
// show Message script
import './services/showNotification';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
