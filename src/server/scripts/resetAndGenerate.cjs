/**
 * 寺庙祈福数据库重置和数据生成工具
 * 此脚本会清空所有表并重新生成数据
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { sequelize } = require('../config/db');
const Prayer = require('../models/Prayer');
const Statistic = require('../models/Statistic');
const dbDataGenerator = require('./dbDataGenerator.cjs');

// 配置
const DEFAULT_COUNT = 3000; // 默认生成3000条记录
const API_URL = `http://localhost:${process.env.PORT || 3000}/api/prayer`;

// 获取命令行参数
function getCommandLineArgs() {
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  
  if (args.length > 0 && !isNaN(parseInt(args[0]))) {
    count = parseInt(args[0]);
  }
  
  return { count };
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

// 主函数
async function main() {
  console.log('\n===================================');
  console.log('寺庙祈福数据库重置和数据生成工具 v1.0');
  console.log('===================================\n');
  
  const { count } = getCommandLineArgs();
  
  try {
    // 重置数据库表
    const resetSuccess = await resetDatabase();
    if (!resetSuccess) {
      throw new Error('数据库表重置失败，无法继续生成数据');
    }
    
    // 生成数据
    console.log(`\n准备生成 ${count} 条祈福记录...\n`);
    await dbDataGenerator.generatePrayerRecords(count);
    
    console.log('\n全部操作已完成!');
  } catch (error) {
    console.error('\n程序执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
} 