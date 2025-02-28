const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/prayerController');

// 获取客户端真实IP的中间件
const getRealIP = (req, res, next) => {
  req.realIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // 处理IPv6格式的本地地址
  if (req.realIP.includes('::ffff:')) {
    req.realIP = req.realIP.replace('::ffff:', '');
  }
  next();
};

// 应用中间件
router.use(getRealIP);

// API路由定义
router.post('/prayer', prayerController.recordPrayer);
router.get('/stats', prayerController.getStats);

module.exports = router; 