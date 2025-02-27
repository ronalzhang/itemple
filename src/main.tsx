import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 确保DOM已经加载完成
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
});
