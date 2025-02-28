/**
 * 钱包助手工具，用于处理不同钱包扩展之间的冲突
 * 特别是解决 "Cannot redefine property: ethereum" 错误
 */

// 声明全局window类型，使TypeScript识别ethereum
declare global {
  interface Window {
    ethereum?: any;
    _ethereum?: any;
  }
}

/**
 * 检测并处理钱包扩展冲突
 * 此功能已禁用，防止与浏览器扩展冲突
 */
export const handleWalletConflicts = (): void => {
  // 完全禁用钱包功能处理
  console.log('钱包功能已禁用，避免浏览器冲突');
};

/**
 * 检查用户是否安装了钱包扩展
 * 此功能已禁用，始终返回false
 */
export const checkWalletInstalled = (): boolean => {
  // 始终返回false，表示未安装钱包
  return false;
};

/**
 * 获取用户钱包地址
 * 此功能已禁用，始终返回空数组
 */
export const getWalletAddress = async (): Promise<string[]> => {
  // 直接返回空数组，不访问window.ethereum
  return [];
};

/**
 * 连接到用户钱包
 * 此功能已禁用，返回空对象
 */
export const connectWallet = async (): Promise<{success: boolean, address?: string, error?: string}> => {
  // 返回成功连接状态，但无地址
  return {
    success: false,
    error: '钱包功能已禁用'
  };
};

/**
 * 发送交易
 * 此功能已禁用，返回失败结果
 */
export const sendTransaction = async (params: any): Promise<{success: boolean, hash?: string, error?: string}> => {
  // 返回失败结果
  return {
    success: false,
    error: '钱包功能已禁用'
  };
};

// 导出默认对象，包含所有功能
export default {
  handleWalletConflicts,
  checkWalletInstalled,
  getWalletAddress,
  connectWallet,
  sendTransaction
}; 