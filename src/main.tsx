import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import './polyfills';
import { handleWalletConflicts } from './utils/walletHelper';

// 处理可能的钱包扩展冲突
handleWalletConflicts();

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
