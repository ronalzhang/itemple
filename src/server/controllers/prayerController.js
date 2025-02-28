const Prayer = require('../models/Prayer');
const Statistic = require('../models/Statistic');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const { calculateLunarDate } = require('../../utils/lunarCalendar.cjs');

// 根据IP地址判断用户所在区域
const classifyRegion = (ip) => {
  // 这里只是一个简单的示例，实际项目中可能需要更复杂的IP地址库
  // 可以使用geoip-lite或类似的库来获取更准确的位置信息
  
  // 简单规则：中国和亚洲IP通常以特定段开头
  if (ip.startsWith('1.') || ip.startsWith('14.') || ip.startsWith('27.') || 
      ip.startsWith('36.') || ip.startsWith('39.') || ip.startsWith('42.') || 
      ip.startsWith('49.') || ip.startsWith('58.') || ip.startsWith('59.') || 
      ip.startsWith('60.') || ip.startsWith('61.') || ip.startsWith('101.') || 
      ip.startsWith('103.') || ip.startsWith('106.') || ip.startsWith('110.') || 
      ip.startsWith('111.') || ip.startsWith('112.') || ip.startsWith('113.') || 
      ip.startsWith('114.') || ip.startsWith('115.') || ip.startsWith('116.') || 
      ip.startsWith('117.') || ip.startsWith('118.') || ip.startsWith('119.') || 
      ip.startsWith('120.') || ip.startsWith('121.') || ip.startsWith('122.') || 
      ip.startsWith('123.') || ip.startsWith('124.') || ip.startsWith('125.') || 
      ip.startsWith('139.') || ip.startsWith('171.') || ip.startsWith('175.') || 
      ip.startsWith('180.') || ip.startsWith('182.') || ip.startsWith('183.') || 
      ip.startsWith('202.') || ip.startsWith('203.') || ip.startsWith('210.') || 
      ip.startsWith('211.') || ip.startsWith('218.') || ip.startsWith('219.') || 
      ip.startsWith('220.') || ip.startsWith('221.') || ip.startsWith('222.') || 
      ip.startsWith('223.')) {
    return 'asia';
  }
  
  // 欧洲IP通常以特定段开头
  if (ip.startsWith('2.') || ip.startsWith('5.') || ip.startsWith('31.') || 
      ip.startsWith('46.') || ip.startsWith('62.') || ip.startsWith('77.') || 
      ip.startsWith('78.') || ip.startsWith('79.') || ip.startsWith('80.') || 
      ip.startsWith('81.') || ip.startsWith('82.') || ip.startsWith('83.') || 
      ip.startsWith('84.') || ip.startsWith('85.') || ip.startsWith('86.') || 
      ip.startsWith('87.') || ip.startsWith('88.') || ip.startsWith('89.') || 
      ip.startsWith('90.') || ip.startsWith('91.') || ip.startsWith('92.') || 
      ip.startsWith('93.') || ip.startsWith('94.') || ip.startsWith('95.') || 
      ip.startsWith('141.') || ip.startsWith('145.') || ip.startsWith('149.') || 
      ip.startsWith('151.') || ip.startsWith('176.') || ip.startsWith('178.') || 
      ip.startsWith('188.') || ip.startsWith('193.') || ip.startsWith('194.') || 
      ip.startsWith('195.') || ip.startsWith('212.') || ip.startsWith('213.') || 
      ip.startsWith('217.')) {
    return 'europe';
  }
  
  // 美洲IP通常以特定段开头
  if (ip.startsWith('23.') || ip.startsWith('24.') || ip.startsWith('50.') || 
      ip.startsWith('63.') || ip.startsWith('64.') || ip.startsWith('65.') || 
      ip.startsWith('66.') || ip.startsWith('67.') || ip.startsWith('68.') || 
      ip.startsWith('69.') || ip.startsWith('70.') || ip.startsWith('71.') || 
      ip.startsWith('72.') || ip.startsWith('73.') || ip.startsWith('74.') || 
      ip.startsWith('75.') || ip.startsWith('76.') || ip.startsWith('96.') || 
      ip.startsWith('97.') || ip.startsWith('98.') || ip.startsWith('99.') || 
      ip.startsWith('104.') || ip.startsWith('107.') || ip.startsWith('108.') || 
      ip.startsWith('173.') || ip.startsWith('174.') || ip.startsWith('184.') || 
      ip.startsWith('198.') || ip.startsWith('199.') || ip.startsWith('204.') || 
      ip.startsWith('205.') || ip.startsWith('206.') || ip.startsWith('207.') || 
      ip.startsWith('208.') || ip.startsWith('209.')) {
    return 'america';
  }
  
  // 其他地区
  return 'others';
};

// 获取当天日期（YYYY-MM-DD格式）
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 记录祈福数据
exports.recordPrayer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // 获取用户信息
    const ipAddress = req.realIP || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const refUrl = req.headers['referer'] || '';
    const language = req.headers['accept-language'] || '';
    
    // 确定用户所在区域
    const region = classifyRegion(ipAddress.replace('::ffff:', ''));
    
    // 创建祈福记录
    await Prayer.create({
      ip_address: ipAddress,
      user_agent: userAgent,
      region: region,
      language: language,
      ref_url: refUrl,
      prayer_time: new Date()
    }, { transaction });
    
    // 更新当日统计
    const today = getTodayDate();
    
    // 查找或创建当日统计记录
    let [dailyStat, created] = await Statistic.findOrCreate({
      where: { date: today },
      defaults: {
        date: today,
        total_count: 0,
        asia_count: 0,
        europe_count: 0,
        america_count: 0,
        others_count: 0,
        cumulative_total: 0
      },
      transaction
    });
    
    // 更新对应区域的计数
    const regionCountField = `${region}_count`;
    
    // 增加当日总计数和区域计数
    dailyStat.total_count += 1;
    dailyStat[regionCountField] += 1;
    
    // 如果是新创建的统计记录，需要计算累计总数
    if (created) {
      // 获取前一天的累计总数
      const previousDay = new Date(today);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStr = previousDay.toISOString().split('T')[0];
      
      const prevStat = await Statistic.findOne({
        where: { date: previousDayStr },
        transaction
      });
      
      if (prevStat) {
        dailyStat.cumulative_total = prevStat.cumulative_total + 1;
      } else {
        // 如果没有前一天的记录，则计算所有历史记录总和
        const totalCount = await Prayer.count({ transaction });
        dailyStat.cumulative_total = totalCount;
      }
    } else {
      // 如果不是新创建的，直接增加累计总数
      dailyStat.cumulative_total += 1;
    }
    
    // 保存更新后的统计数据
    await dailyStat.save({ transaction });
    
    // 提交事务
    await transaction.commit();
    
    // 响应客户端
    res.status(200).json({
      success: true,
      message: '祈福记录已保存',
      data: {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        region: region
      }
    });
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    
    console.error('记录祈福失败:', error);
    res.status(500).json({
      success: false,
      message: '无法处理您的祈福请求',
      error: error.message
    });
  }
};

// 获取统计数据
exports.getStats = async (req, res) => {
  try {
    // 获取当天日期
    const today = getTodayDate();
    
    // 查找当天的统计记录
    let dailyStat = await Statistic.findOne({
      where: { date: today }
    });
    
    // 如果当天没有统计记录，初始化一个
    if (!dailyStat) {
      // 获取前一天的累计总数
      const previousDay = new Date(today);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStr = previousDay.toISOString().split('T')[0];
      
      const prevStat = await Statistic.findOne({
        where: { date: previousDayStr }
      });
      
      let cumulativeTotal = 0;
      if (prevStat) {
        cumulativeTotal = prevStat.cumulative_total;
      } else {
        // 如果没有前一天的记录，计算所有历史记录
        cumulativeTotal = await Prayer.count();
      }
      
      // 创建今天的统计记录
      dailyStat = await Statistic.create({
        date: today,
        total_count: 0,
        asia_count: 0,
        europe_count: 0,
        america_count: 0,
        others_count: 0,
        cumulative_total: cumulativeTotal
      });
    }
    
    // 获取全局区域分布数据（总数据，而不是今日数据）
    const regionCounts = await Prayer.findAll({
      attributes: [
        'region',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: ['region']
    });
    
    // 将结果转换为所需格式
    const regionDistribution = {
      asia: 0,
      europe: 0,
      america: 0,
      others: 0
    };
    
    regionCounts.forEach(item => {
      const data = item.get({ plain: true });
      const region = data.region;
      const count = parseInt(data.count);
      regionDistribution[region] = count;
    });
    
    // 格式化响应数据
    const statsData = {
      todayCount: dailyStat.total_count,
      totalCount: dailyStat.cumulative_total,
      regions: [
        { name: 'asia', value: regionDistribution.asia },
        { name: 'europe', value: regionDistribution.europe },
        { name: 'america', value: regionDistribution.america },
        { name: 'others', value: regionDistribution.others }
      ]
    };
    
    // 响应客户端
    res.status(200).json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '无法获取统计数据',
      error: error.message
    });
  }
}; 