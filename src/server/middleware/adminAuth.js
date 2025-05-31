const crypto = require('crypto');

// 管理员钱包地址
const ADMIN_WALLET = '6UrwhN2rqQvo2tBfc9FZCdUbt9JLs3BJiEm7pv4NM41b';

// 生成会话token
const generateSessionToken = (walletAddress) => {
  const timestamp = Date.now();
  const data = `${walletAddress}_${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// 验证管理员权限的中间件
const adminAuth = (req, res, next) => {
  try {
    // 检查是否提供了钱包地址
    const walletAddress = req.headers['x-wallet-address'] || req.query.wallet || req.body.wallet;
    
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        message: '需要提供钱包地址进行身份验证'
      });
    }

    // 验证钱包地址是否为管理员地址
    if (walletAddress !== ADMIN_WALLET) {
      return res.status(403).json({
        success: false,
        message: '无权限访问后台管理系统'
      });
    }

    // 通过验证，将钱包地址添加到请求对象中
    req.adminWallet = walletAddress;
    next();
  } catch (error) {
    console.error('管理员身份验证失败:', error);
    return res.status(500).json({
      success: false,
      message: '身份验证过程中发生错误'
    });
  }
};

// 验证钱包地址的接口
const verifyWallet = (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: '缺少钱包地址'
    });
  }

  if (walletAddress === ADMIN_WALLET) {
    const sessionToken = generateSessionToken(walletAddress);
    return res.status(200).json({
      success: true,
      message: '钱包地址验证成功',
      data: {
        token: sessionToken,
        wallet: walletAddress,
        role: 'admin'
      }
    });
  } else {
    return res.status(403).json({
      success: false,
      message: '该钱包地址无管理员权限'
    });
  }
};

module.exports = {
  adminAuth,
  verifyWallet,
  ADMIN_WALLET
}; 