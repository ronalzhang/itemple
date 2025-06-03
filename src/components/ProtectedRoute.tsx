import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const adminWallet = localStorage.getItem('admin_wallet');
  
  // 如果没有登录信息，重定向到登录页面
  if (!adminWallet) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // 验证钱包地址是否为管理员地址
  const ADMIN_WALLET = '6UrwhN2rqQvo2tBfc9FZCdUbt9JLs3BJiEm7pv4NM41b';
  if (adminWallet !== ADMIN_WALLET) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 