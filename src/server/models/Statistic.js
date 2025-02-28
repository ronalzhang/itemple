const { sequelize, Sequelize } = require('../config/db');

// 定义统计数据模型
const Statistic = sequelize.define('Statistic', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    unique: true,
    comment: '统计日期'
  },
  total_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '当日祈福总次数'
  },
  asia_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '亚洲地区祈福次数'
  },
  europe_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '欧洲地区祈福次数'
  },
  america_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '美洲地区祈福次数'
  },
  others_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '其他地区祈福次数'
  },
  cumulative_total: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '截至当日的累计祈福总次数'
  }
}, {
  tableName: 'statistics',
  timestamps: true,
  indexes: [
    {
      name: 'date_idx',
      unique: true,
      fields: ['date']
    }
  ]
});

module.exports = Statistic; 