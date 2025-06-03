const VisitLog = require('../models/VisitLog');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// 记录访问日志
const logVisit = async (req, res, next) => {
  try {
    const ipAddress = req.realIP || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    const urlPath = req.originalUrl || req.url;
    
    // 生成简单的会话ID (基于IP和时间)
    const sessionId = require('crypto')
      .createHash('md5')
      .update(`${ipAddress}_${new Date().toDateString()}`)
      .digest('hex');

    // 异步记录访问日志，不阻塞请求
    setImmediate(async () => {
      try {
        await VisitLog.create({
          ip_address: ipAddress.replace('::ffff:', ''),
          user_agent: userAgent,
          referrer: referrer,
          url_path: urlPath,
          session_id: sessionId,
          visit_time: new Date()
        });
      } catch (error) {
        console.error('记录访问日志失败:', error);
      }
    });

    next();
  } catch (error) {
    console.error('访问日志中间件错误:', error);
    next(); // 继续处理请求，不因为日志失败而中断
  }
};

// 获取访问统计数据
const getVisitStats = async (req, res) => {
  try {
    const { timeRange = '24h', startDate, endDate } = req.query;
    
    let whereCondition = {};
    let groupBy = '';
    let timeFormat = '';
    
    const now = new Date();
    
    // 根据时间范围设置查询条件
    switch (timeRange) {
      case '24h':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        whereCondition.visit_time = { [Op.gte]: yesterday };
        groupBy = sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "visit_time"'));
        timeFormat = 'hour';
        break;
      case '7d':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        whereCondition.visit_time = { [Op.gte]: weekAgo };
        groupBy = sequelize.fn('DATE_TRUNC', 'day', sequelize.col('visit_time'));
        timeFormat = 'day';
        break;
      case '30d':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        whereCondition.visit_time = { [Op.gte]: monthAgo };
        groupBy = sequelize.fn('DATE_TRUNC', 'day', sequelize.col('visit_time'));
        timeFormat = 'day';
        break;
      case '365d':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        whereCondition.visit_time = { [Op.gte]: yearAgo };
        groupBy = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('visit_time'));
        timeFormat = 'month';
        break;
      case 'custom':
        if (startDate && endDate) {
          whereCondition.visit_time = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          };
          groupBy = sequelize.fn('DATE_TRUNC', 'day', sequelize.col('visit_time'));
          timeFormat = 'day';
        }
        break;
    }

    // 查询总访问数（按时间分组）
    const totalVisitsQuery = await VisitLog.findAll({
      attributes: [
        [groupBy, 'time_unit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_visits']
      ],
      where: whereCondition,
      group: [groupBy],
      order: [[groupBy, 'ASC']],
      raw: true
    });

    // 查询独立IP数（按时间分组）
    const uniqueIPsQuery = await VisitLog.findAll({
      attributes: [
        [groupBy, 'time_unit'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ip_address'))), 'unique_ips']
      ],
      where: whereCondition,
      group: [groupBy],
      order: [[groupBy, 'ASC']],
      raw: true
    });

    // 合并数据
    const statsMap = new Map();
    
    totalVisitsQuery.forEach(item => {
      const timeUnit = item.time_unit;
      if (!statsMap.has(timeUnit)) {
        statsMap.set(timeUnit, { time_unit: timeUnit, total_visits: 0, unique_ips: 0 });
      }
      statsMap.get(timeUnit).total_visits = parseInt(item.total_visits);
    });

    uniqueIPsQuery.forEach(item => {
      const timeUnit = item.time_unit;
      if (!statsMap.has(timeUnit)) {
        statsMap.set(timeUnit, { time_unit: timeUnit, total_visits: 0, unique_ips: 0 });
      }
      statsMap.get(timeUnit).unique_ips = parseInt(item.unique_ips);
    });

    const chartData = Array.from(statsMap.values()).map(item => ({
      time: timeRange === '24h' ? `${item.time_unit}:00` : item.time_unit,
      totalVisits: item.total_visits,
      uniqueIPs: item.unique_ips
    }));

    // 获取汇总统计
    const totalStats = await VisitLog.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_visits'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ip_address'))), 'total_unique_ips']
      ],
      where: whereCondition,
      raw: true
    });

    // 获取今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = await VisitLog.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'today_visits'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ip_address'))), 'today_unique_ips']
      ],
      where: {
        visit_time: { [Op.gte]: today }
      },
      raw: true
    });

    // 获取增长率（与前一周期比较）
    let growthRate = 0;
    if (timeRange === '24h') {
      const yesterdayStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const yesterdayEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const yesterdayCount = await VisitLog.count({
        where: {
          visit_time: { [Op.between]: [yesterdayStart, yesterdayEnd] }
        }
      });
      
      const todayCount = parseInt(todayStats[0].today_visits);
      if (yesterdayCount > 0) {
        growthRate = ((todayCount - yesterdayCount) / yesterdayCount * 100).toFixed(1);
      }
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalVisits: parseInt(totalStats[0].total_visits),
          uniqueIPs: parseInt(totalStats[0].total_unique_ips),
          todayVisits: parseInt(todayStats[0].today_visits),
          todayUniqueIPs: parseInt(todayStats[0].today_unique_ips),
          growthRate: `${growthRate > 0 ? '+' : ''}${growthRate}%`
        },
        chartData: chartData,
        timeFormat: timeFormat
      }
    });

  } catch (error) {
    console.error('获取访问统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取访问统计数据失败',
      error: error.message
    });
  }
};

// 获取访问详情
const getVisitDetails = async (req, res) => {
  try {
    const { page = 1, limit = 50, ip, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    let whereCondition = {};
    
    if (ip) {
      whereCondition.ip_address = { [Op.like]: `%${ip}%` };
    }
    
    if (startDate && endDate) {
      whereCondition.visit_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await VisitLog.findAndCountAll({
      where: whereCondition,
      order: [['visit_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        visits: rows
      }
    });

  } catch (error) {
    console.error('获取访问详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取访问详情失败',
      error: error.message
    });
  }
};

module.exports = {
  logVisit,
  getVisitStats,
  getVisitDetails
}; 