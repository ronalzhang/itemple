/**
 * 模型导出文件
 * 集中导出所有数据库模型
 */

const sequelize = require('../db/config');
const Prayer = require('./Prayer');
const Stats = require('./Stats');
const Statistic = require('./Statistic');

// 同步所有模型到数据库
// 在开发环境中，可以使用 {force: true} 来重建表
// 生产环境应避免使用 force: true
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('数据库同步完成');
    
    // 如果是强制重建表且为生产环境，则初始化一些基础数据
    if (force && process.env.NODE_ENV !== 'development') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 初始化统计数据
      await Stats.create({
        date: todayStr,
        today_count: 0,
        total_count: 0,
        asia_count: 0,
        europe_count: 0,
        america_count: 0,
        others_count: 0
      });
      
      console.log('初始化数据完成');
    }
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

module.exports = {
  sequelize,
  Prayer,
  Stats,
  syncDatabase,
  Statistic
}; 