const { sequelize, Sequelize } = require('../config/db');

// 定义访问日志模型
const VisitLog = sequelize.define('VisitLog', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip_address: {
    type: Sequelize.STRING(45),
    allowNull: false,
    comment: '访问者IP地址'
  },
  user_agent: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: '用户代理信息'
  },
  referrer: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: '来源页面'
  },
  url_path: {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: '访问的URL路径'
  },
  session_id: {
    type: Sequelize.STRING(64),
    allowNull: true,
    comment: '会话ID'
  },
  visit_time: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    comment: '访问时间'
  },
  region: {
    type: Sequelize.STRING(50),
    allowNull: true,
    comment: '地理区域'
  }
}, {
  tableName: 'visit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'ip_time_idx',
      fields: ['ip_address', 'visit_time']
    },
    {
      name: 'visit_time_idx',
      fields: ['visit_time']
    }
  ]
});

module.exports = VisitLog; 