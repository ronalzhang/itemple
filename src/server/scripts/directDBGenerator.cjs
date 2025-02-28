/**
 * 寺庙祈福数据直接数据库生成器
 * 此脚本直接操作数据库生成祈福记录，不需要启动API服务器
 * 用法: node directDBGenerator.cjs [count]
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { sequelize } = require('../config/db');
const Prayer = require('../models/Prayer');
const Statistic = require('../models/Statistic');

// 配置
const DEFAULT_COUNT = 3000; // 默认生成3000条记录
const BATCH_SIZE = 100; // 每批次插入100条记录

// 区域权重配置
const REGION_WEIGHTS = {
  asia: 60,  // 亚洲权重60%
  europe: 15, // 欧洲权重15%
  america: 20, // 美洲权重20%
  others: 5   // 其他地区权重5%
};

// IP地址段配置
const IP_RANGES = {
  asia: [
    { start: '1.0.0.0', end: '126.255.255.255' },
    { start: '202.0.0.0', end: '223.255.255.255' }
  ],
  europe: [
    { start: '77.0.0.0', end: '95.255.255.255' },
    { start: '193.0.0.0', end: '195.255.255.255' }
  ],
  america: [
    { start: '24.0.0.0', end: '76.255.255.255' },
    { start: '96.0.0.0', end: '107.255.255.255' }
  ],
  others: [
    { start: '196.0.0.0', end: '197.255.255.255' },
    { start: '41.0.0.0', end: '42.255.255.255' }
  ]
};

// IP地址转换工具函数
function ipToNumber(ip) {
  return ip.split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numberToIp(number) {
  return [
    (number >>> 24) & 0xff,
    (number >>> 16) & 0xff,
    (number >>> 8) & 0xff,
    number & 0xff
  ].join('.');
}

// 随机选择区域
function selectRegion() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const [region, weight] of Object.entries(REGION_WEIGHTS)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return region;
    }
  }
  return 'asia'; // 默认返回亚洲
}

// 为指定区域生成随机IP
function generateRandomIpForRegion(region) {
  const ranges = IP_RANGES[region];
  const rangeIndex = Math.floor(Math.random() * ranges.length);
  const range = ranges[rangeIndex];
  
  const startIp = ipToNumber(range.start);
  const endIp = ipToNumber(range.end);
  const randomIp = startIp + Math.floor(Math.random() * (endIp - startIp));
  
  return numberToIp(randomIp);
}

// 生成浏览器用户代理
function generateRandomUserAgent() {
  const browsers = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/89.0'
  ];
  
  return browsers[Math.floor(Math.random() * browsers.length)];
}

// 生成随机Accept-Language头
function generateRandomLanguage() {
  const languages = [
    'zh-CN,zh;q=0.9,en;q=0.8',
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'ja-JP,ja;q=0.9,en;q=0.8',
    'ko-KR,ko;q=0.9,en;q=0.8',
    'fr-FR,fr;q=0.9,en;q=0.8',
    'de-DE,de;q=0.9,en;q=0.8',
    'ru-RU,ru;q=0.9,en;q=0.8',
    'es-ES,es;q=0.9,en;q=0.8'
  ];
  
  return languages[Math.floor(Math.random() * languages.length)];
}

// 生成随机Referer
function generateRandomReferer() {
  const referers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://search.yahoo.com/',
    'https://www.baidu.com/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://www.instagram.com/',
    '',  // 直接访问
    ''   // 直接访问
  ];
  
  return referers[Math.floor(Math.random() * referers.length)];
}

// 生成随机日期（过去30天内）
function generateRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const result = new Date(now);
  result.setDate(result.getDate() - daysAgo);
  
  // 随机设置小时和分钟
  result.setHours(Math.floor(Math.random() * 24));
  result.setMinutes(Math.floor(Math.random() * 60));
  result.setSeconds(Math.floor(Math.random() * 60));
  
  return result;
}

// 生成祈福记录数据
function generatePrayerData(count) {
  const records = [];
  
  for (let i = 0; i < count; i++) {
    const region = selectRegion();
    const ip = generateRandomIpForRegion(region);
    
    records.push({
      ip_address: ip,
      user_agent: generateRandomUserAgent(),
      region: region,
      country: region === 'asia' ? 'China' : (region === 'europe' ? 'France' : (region === 'america' ? 'USA' : 'Other')),
      language: generateRandomLanguage(),
      ref_url: generateRandomReferer(),
      prayer_time: generateRandomDate()
    });
  }
  
  return records;
}

// 更新统计数据
async function updateStatistics() {
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
    
    // 删除已有的统计数据
    await Statistic.destroy({ where: {} });
    
    // 生成新的统计数据
    let cumulativeTotal = 0;
    for (const date of sortedDates) {
      const stat = dateStats[date];
      cumulativeTotal += stat.total_count;
      
      await Statistic.create({
        ...stat,
        cumulative_total: cumulativeTotal
      });
    }
    
    console.log(`已更新 ${sortedDates.length} 天的统计数据`);
    return true;
  } catch (error) {
    console.error('更新统计数据失败:', error);
    return false;
  }
}

// 生成祈福记录
async function generatePrayerRecords(count = DEFAULT_COUNT) {
  const startTime = Date.now();
  let successCount = 0;
  
  try {
    // 计算批次数
    const batches = Math.ceil(count / BATCH_SIZE);
    console.log(`开始生成 ${count} 条祈福记录，分 ${batches} 批处理...\n`);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, count);
      const batchSize = batchEnd - batchStart;
      
      console.log(`处理批次 ${batchIndex + 1}/${batches} (${batchSize} 条记录)...`);
      
      // 生成这个批次的数据
      const batchData = generatePrayerData(batchSize);
      
      // 批量插入数据库
      await Prayer.bulkCreate(batchData);
      
      successCount += batchSize;
      
      // 显示当前批次进度
      const progress = Math.round((batchIndex + 1) / batches * 100);
      console.log(`批次 ${batchIndex + 1} 完成: ${batchSize} 条记录已插入 (进度: ${progress}%)`);
      
      // 每5个批次更新一次统计数据
      if ((batchIndex + 1) % 5 === 0 || batchIndex === batches - 1) {
        await updateStatistics();
      }
    }
    
    // 计算总耗时
    const totalTime = (Date.now() - startTime) / 1000;
    
    // 输出结果
    console.log('\n---------- 生成结果 ----------');
    console.log(`总记录数: ${count}`);
    console.log(`成功: ${successCount}`);
    console.log(`总耗时: ${totalTime.toFixed(2)}秒`);
    console.log(`平均每条记录耗时: ${(totalTime / count * 1000).toFixed(2)}毫秒`);
    
    return true;
  } catch (error) {
    console.error('生成祈福记录失败:', error);
    return false;
  }
}

// 重置数据库表
async function resetDatabase() {
  try {
    console.log('开始重置数据库表...');
    
    // 使用force: true强制重建所有表
    await sequelize.sync({ force: true });
    
    // 创建今日初始统计记录
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    await Statistic.create({
      date: todayStr,
      total_count: 0,
      asia_count: 0,
      europe_count: 0, 
      america_count: 0,
      others_count: 0,
      cumulative_total: 0
    });
    
    console.log('今日统计初始记录已创建');
    console.log('数据库表已成功重置!');
    return true;
  } catch (error) {
    console.error('重置数据库表失败:', error);
    return false;
  }
}

// 从命令行获取参数
function getCommandLineArgs() {
  // 获取参数
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  let shouldReset = false; // 修改默认值为false，不重置数据库
  
  if (args.length > 0) {
    if (args[0] === '--reset') {
      shouldReset = true;
      if (args.length > 1 && !isNaN(parseInt(args[1]))) {
        count = parseInt(args[1]);
      }
    } else if (!isNaN(parseInt(args[0]))) {
      count = parseInt(args[0]);
    }
  }
  
  return { count, shouldReset };
}

// 主函数
async function main() {
  console.log('\n===================================');
  console.log('寺庙祈福数据直接数据库生成器 v1.0');
  console.log('===================================\n');
  
  const { count, shouldReset } = getCommandLineArgs();
  
  try {
    // 测试数据库连接
    try {
      await sequelize.authenticate();
      console.log('数据库连接成功!');
    } catch (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }
    
    // 重置数据库表
    if (shouldReset) {
      const resetSuccess = await resetDatabase();
      if (!resetSuccess) {
        throw new Error('数据库表重置失败，无法继续生成数据');
      }
    } else {
      console.log('跳过数据库重置...');
    }
    
    // 生成数据
    console.log(`\n准备生成 ${count} 条祈福记录...\n`);
    const generateSuccess = await generatePrayerRecords(count);
    
    if (generateSuccess) {
      console.log('\n全部操作已完成!');
    } else {
      throw new Error('生成祈福记录失败');
    }
  } catch (error) {
    console.error('\n程序执行失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行主函数
if (require.main === module) {
  main();
} else {
  // 如果作为模块导入，则导出函数
  module.exports = {
    generatePrayerRecords,
    resetDatabase,
    updateStatistics
  };
} 