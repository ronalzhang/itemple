const express = require('express');
const router = express.Router();
const { adminAuth, verifyWallet } = require('../middleware/adminAuth');
const { getVisitStats, getVisitDetails } = require('../controllers/adminController');

// 钱包地址验证接口 (无需认证)
router.post('/auth/verify', verifyWallet);

// 以下所有路由都需要管理员认证
router.use(adminAuth);

// 获取访问统计数据
router.get('/stats/visits', getVisitStats);

// 获取访问详情
router.get('/visits', getVisitDetails);

// 系统健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '后台管理系统运行正常',
    timestamp: new Date().toISOString(),
    admin: req.adminWallet
  });
});

module.exports = router; 