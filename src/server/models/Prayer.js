const { sequelize, Sequelize } = require('../config/db');

// 定义祈福记录模型
const Prayer = sequelize.define('Prayer', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip_address: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: '用户IP地址'
  },
  user_agent: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: '用户浏览器信息'
  },
  region: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'unknown',
    comment: '用户所在区域：asia, europe, america, others'
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: '用户所在国家'
  },
  language: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: '用户语言设置'
  },
  ref_url: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: '引荐来源URL'
  },
  prayer_time: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    comment: '祈福时间'
  }
}, {
  tableName: 'prayers',
  timestamps: true,
  indexes: [
    {
      name: 'prayer_time_idx',
      fields: ['prayer_time']
    },
    {
      name: 'region_idx',
      fields: ['region']
    }
  ]
});

module.exports = Prayer; 