/**
 * 寺庙祈福数据数据库生成器
 * 这个脚本直接通过API调用生成大量祈福记录，并将数据持久化到数据库中
 * 用法: node dbDataGenerator.js [count]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// 配置
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/prayer'
  : `http://localhost:${process.env.PORT || 3000}/api/prayer`;

const DEFAULT_COUNT = 3000; // 默认生成3000条记录
const BATCH_SIZE = 50; // 每批次发送50条请求
const DELAY_BETWEEN_BATCHES = 200; // 每批次间隔200毫秒

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

// 生成祈福记录
async function generatePrayerRecord(ip) {
  try {
    const headers = {
      'User-Agent': generateRandomUserAgent(),
      'Accept-Language': generateRandomLanguage(),
      'Referer': generateRandomReferer(),
      'X-Forwarded-For': ip,
      'X-Real-IP': ip
    };
    
    const response = await axios.post(API_URL, {}, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`生成祈福记录失败 (IP: ${ip}):`, error.message);
    return { success: false, error: error.message };
  }
}

// 生成批量祈福记录
async function generatePrayerRecords(count = DEFAULT_COUNT) {
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  
  // 计算批次数
  const batches = Math.ceil(count / BATCH_SIZE);
  console.log(`开始生成 ${count} 条祈福记录，分 ${batches} 批处理...\n`);
  
  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const batchStart = batchIndex * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, count);
    const batchSize = batchEnd - batchStart;
    
    console.log(`处理批次 ${batchIndex + 1}/${batches} (${batchSize} 条记录)...`);
    
    // 为这个批次生成祈福记录
    const batchPromises = [];
    for (let i = 0; i < batchSize; i++) {
      const region = selectRegion();
      const ip = generateRandomIpForRegion(region);
      batchPromises.push(generatePrayerRecord(ip));
    }
    
    // 等待所有请求完成
    const results = await Promise.all(batchPromises);
    
    // 统计成功和失败
    const batchSuccess = results.filter(r => r.success).length;
    const batchFail = results.filter(r => !r.success).length;
    
    successCount += batchSuccess;
    failCount += batchFail;
    
    // 收集前5个错误
    const batchErrors = results.filter(r => !r.success).slice(0, 5);
    if (batchErrors.length > 0 && errors.length < 5) {
      errors.push(...batchErrors.slice(0, 5 - errors.length));
    }
    
    // 显示当前批次进度
    const progress = Math.round((batchIndex + 1) / batches * 100);
    const successRate = Math.round((successCount / (successCount + failCount)) * 100);
    console.log(`批次 ${batchIndex + 1} 完成: ${batchSuccess} 成功, ${batchFail} 失败 (进度: ${progress}%, 成功率: ${successRate}%)`);
    
    // 延迟下一批次，避免过度占用服务器资源
    if (batchIndex < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // 计算总耗时和每条记录平均耗时
  const totalTime = (Date.now() - startTime) / 1000;
  const avgTimePerRecord = totalTime / count * 1000;
  
  // 输出结果
  console.log('\n---------- 生成结果 ----------');
  console.log(`总记录数: ${count}`);
  console.log(`成功: ${successCount} (${Math.round(successCount / count * 100)}%)`);
  console.log(`失败: ${failCount} (${Math.round(failCount / count * 100)}%)`);
  console.log(`总耗时: ${totalTime.toFixed(2)}秒`);
  console.log(`平均每条记录耗时: ${avgTimePerRecord.toFixed(2)}毫秒`);
  
  // 如果有错误，显示错误信息
  if (errors.length > 0) {
    console.log('\n前5个错误:');
    errors.forEach((error, index) => {
      console.log(`#${index + 1}: ${error.error}`);
    });
  }
}

// 从命令行获取参数
function getCommandLineArgs() {
  // 获取参数
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  
  if (args.length > 0 && !isNaN(parseInt(args[0]))) {
    count = parseInt(args[0]);
  }
  
  return { count };
}

// 主函数
async function main() {
  console.log('寺庙祈福数据数据库生成器 v1.0');
  console.log('----------------------------');
  
  const { count } = getCommandLineArgs();
  
  try {
    console.log(`使用API端点: ${API_URL}`);
    console.log(`准备生成 ${count} 条祈福记录...`);
    
    await generatePrayerRecords(count);
    
    console.log('\n生成完成!');
  } catch (error) {
    console.error('程序执行失败:', error);
    process.exit(1);
  }
}

// 如果直接执行此脚本，则运行主函数
if (require.main === module) {
  main();
} else {
  // 如果作为模块导入，则导出函数
  module.exports = {
    generatePrayerRecords,
    selectRegion,
    generateRandomIpForRegion
  };
} 