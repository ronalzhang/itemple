const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./config/db');
const apiRoutes = require('./routes/api');
const { initDatabase } = require('./utils/initDatabase');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // 为了简化开发，在生产环境应该配置适当的CSP
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 静态文件服务 - 指向构建后的前端文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// API路由
app.use('/api', apiRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 在生产环境中，将所有未匹配的路由重定向到前端应用
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({ 
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    console.log('正在初始化数据库...');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('数据库初始化失败，服务器将不会启动');
      process.exit(1);
    }
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 导出app用于测试
module.exports = { app, startServer };

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  startServer();
} 