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
 * 在多个钱包扩展同时存在时（如MetaMask和TokenPocket），
 * 它们会尝试在window上注入ethereum对象，导致冲突
 */
export const handleWalletConflicts = (): void => {
  try {
    // 检查是否已存在ethereum对象
    if (window.ethereum) {
      // 检测是否已经有多个钱包
      if (!window.ethereum.isMetaMask && !window.ethereum._walletLinkExtension) {
        console.log('检测到多个钱包扩展，避免冲突');
        // 备份现有ethereum对象
        window._ethereum = window.ethereum;
        
        // 移除现有的ethereum属性
        delete window.ethereum;
        
        // 创建延迟加载的getter，防止property redefinition错误
        Object.defineProperty(window, 'ethereum', {
          configurable: true,
          enumerable: true,
          get() {
            return window._ethereum;
          }
        });
      }
    }
  } catch (error) {
    console.error('处理钱包冲突时出错:', error);
  }
};

/**
 * 检查用户是否安装了钱包扩展
 */
export const checkWalletInstalled = (): boolean => {
  return !!window.ethereum;
};

/**
 * 获取用户钱包地址
 * @returns 钱包地址数组的Promise
 */
export const getWalletAddress = async (): Promise<string[]> => {
  if (!window.ethereum) {
    throw new Error('未检测到钱包扩展');
  }
  
  try {
    // 请求用户连接钱包
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    console.error('获取钱包地址失败:', error);
    throw error;
  }
};

// 导出默认对象，包含所有功能
export default {
  handleWalletConflicts,
  checkWalletInstalled,
  getWalletAddress
}; 