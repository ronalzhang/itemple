const { sequelize } = require('../config/db');
const Prayer = require('../models/Prayer');
const Statistic = require('../models/Statistic');

// 获取当天日期（YYYY-MM-DD格式）
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 初始化数据库
const initDatabase = async () => {
  try {
    console.log('开始同步数据库模型...');
    
    // 删除可能存在的问题索引
    try {
      await sequelize.query('DROP INDEX IF EXISTS daily_stats_idx');
      console.log('已删除问题索引 daily_stats_idx（如果存在）');
    } catch (error) {
      console.log('删除索引时出现错误（可能索引不存在）:', error.message);
    }
    
    // 同步所有模型到数据库，不强制重建表
    await sequelize.sync({ 
      force: false, // 不删除现有表
      alter: false  // 不自动修改表结构
    });
    
    console.log('数据库模型同步完成');
    
    // 检查是否有今日统计记录
    const today = getTodayDate();
    const todayStats = await Statistic.findOne({ where: { date: today } });
    
    // 如果没有今日统计记录，创建初始记录
    if (!todayStats) {
      console.log('创建今日统计初始记录...');
      
      // 检查之前的统计记录
      const lastStat = await Statistic.findOne({
        order: [['date', 'DESC']]
      });
      
      // 获取上一条记录的累计总数，如果没有则为0
      const lastTotal = lastStat ? lastStat.cumulative_total : 0;
      
      // 创建今日统计记录
      await Statistic.create({
        date: today,
        total_count: 0,
        asia_count: 0,
        europe_count: 0,
        america_count: 0,
        others_count: 0,
        cumulative_total: lastTotal
      });
      
      console.log('今日统计初始记录创建成功');
    } else {
      console.log('今日统计记录已存在，无需创建');
    }
    
    // 如果数据库为空，创建一些初始数据
    const prayerCount = await Prayer.count();
    if (prayerCount === 0) {
      console.log('数据库为空，创建初始样本数据...');
      
      // 生成一些随机的祈福记录
      const regions = ['asia', 'europe', 'america', 'others'];
      const now = new Date();
      const sampleData = [];
      
      // 生成过去30天的随机数据
      for (let i = 0; i < 1000; i++) {
        const randomDayOffset = Math.floor(Math.random() * 30);
        const prayerDate = new Date(now);
        prayerDate.setDate(prayerDate.getDate() - randomDayOffset);
        
        sampleData.push({
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: 'Mozilla/5.0 (Sample Data)',
          region: regions[Math.floor(Math.random() * regions.length)],
          country: 'Sample',
          language: 'zh-CN',
          prayer_time: prayerDate
        });
      }
      
      // 批量插入样本数据
      await Prayer.bulkCreate(sampleData);
      console.log(`已创建 ${sampleData.length} 条样本祈福记录`);
      
      // 更新统计数据
      await updateStatistics();
    }
    
    console.log('数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

// 更新统计数据
const updateStatistics = async () => {
  try {
    console.log('开始更新统计数据...');
    
    // 获取所有祈福记录的日期
    const prayers = await Prayer.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('prayer_time')), 'prayer_date'],
        [sequelize.fn('count', sequelize.col('id')), 'count'],
        'region'
      ],
      group: [
        sequelize.fn('date', sequelize.col('prayer_time')),
        'region'
      ],
      order: [
        [sequelize.fn('date', sequelize.col('prayer_time')), 'ASC']
      ]
    });
    
    // 按日期整理数据
    const dateStats = {};
    prayers.forEach(prayer => {
      const data = prayer.get({ plain: true });
      const date = data.prayer_date;
      const region = data.region;
      const count = parseInt(data.count);
      
      if (!dateStats[date]) {
        dateStats[date] = {
          date,
          total_count: 0,
          asia_count: 0,
          europe_count: 0,
          america_count: 0,
          others_count: 0
        };
      }
      
      dateStats[date][`${region}_count`] = count;
      dateStats[date].total_count += count;
    });
    
    // 按日期排序
    const sortedDates = Object.keys(dateStats).sort();
    
    // 不再删除已有数据，而是更新或添加
    // 获取所有现有的统计记录
    const existingStats = await Statistic.findAll();
    const existingDates = {};
    
    existingStats.forEach(stat => {
      existingDates[stat.date] = stat;
    });
    
    // 计算累计总数
    let cumulativeTotal = 0;
    
    // 如果有现有数据，找出最早日期之前的累计总数
    if (existingStats.length > 0 && sortedDates.length > 0) {
      const earliestNewDate = sortedDates[0];
      const earlierStats = existingStats.filter(stat => 
        stat.date < earliestNewDate
      ).sort((a, b) => a.date.localeCompare(b.date));
      
      if (earlierStats.length > 0) {
        cumulativeTotal = earlierStats[earlierStats.length - 1].cumulative_total;
      }
    }
    
    // 更新或创建每天的统计记录
    for (const date of sortedDates) {
      const stat = dateStats[date];
      cumulativeTotal += stat.total_count;
      
      if (existingDates[date]) {
        // 更新现有记录
        await existingDates[date].update({
          ...stat,
          cumulative_total: cumulativeTotal
        });
      } else {
        // 创建新记录
        await Statistic.create({
          ...stat,
          cumulative_total: cumulativeTotal
        });
      }
    }
    
    console.log(`已更新 ${sortedDates.length} 天的统计数据`);
    return true;
  } catch (error) {
    console.error('更新统计数据失败:', error);
    return false;
  }
};

module.exports = {
  initDatabase,
  updateStatistics
}; 