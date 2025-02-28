/**
 * 寺庙网站数据模拟器
 * 此脚本直接通过后端API添加模拟数据
 * 可以通过以下命令使用: node dataSimulator.js [数量]
 */

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// 配置参数
const CONFIG = {
  apiUrl: 'http://localhost:3000/api/prayer/simulate', // 后端模拟API端点
  defaultCount: 3000, // 默认生成数量
  batchSize: 100, // 每批发送的记录数
  delayBetweenBatches: 50, // 批次间延迟(毫秒)
};

// 区域及其权重配置
const REGIONS = {
  asia: { weight: 60 },
  europe: { weight: 15 },
  america: { weight: 20 },
  others: { weight: 5 }
};

/**
 * 根据权重选择区域
 * @returns {string} 区域代码
 */
function selectRegionByWeight() {
  const rand = Math.random() * 100;
  let cumulativeWeight = 0;
  
  for (const [region, data] of Object.entries(REGIONS)) {
    cumulativeWeight += data.weight;
    if (rand <= cumulativeWeight) {
      return region;
    }
  }
  
  return 'asia'; // 默认
}

/**
 * 生成随机IP地址
 * @returns {string} 随机IPv4地址
 */
function generateRandomIp() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

/**
 * 生成一个模拟数据批次
 * @param {number} count - 批次大小
 * @returns {Array} - 数据批次
 */
function generateBatch(count) {
  const batch = [];
  
  for (let i = 0; i < count; i++) {
    const region = selectRegionByWeight();
    const ip = generateRandomIp();
    
    batch.push({
      ip,
      region,
      timestamp: new Date().toISOString()
    });
  }
  
  return batch;
}

/**
 * 发送数据批次到API
 * @param {Array} batch - 数据批次
 * @returns {Promise} - API响应
 */
async function sendBatch(batch) {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulator-Token': 'temple-simulator-token', // 安全令牌，防止未授权使用
      },
      body: JSON.stringify({ records: batch }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发送批次失败:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 生成并发送模拟数据
 * @param {number} totalCount - 要生成的总记录数
 */
async function simulateData(totalCount) {
  console.log(`开始生成 ${totalCount} 条模拟祈福记录...`);
  const startTime = performance.now();
  
  const batches = Math.ceil(totalCount / CONFIG.batchSize);
  let recordsSent = 0;
  let successfulRecords = 0;
  
  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(CONFIG.batchSize, totalCount - recordsSent);
    const batch = generateBatch(batchSize);
    recordsSent += batchSize;
    
    try {
      const response = await sendBatch(batch);
      
      if (response.success) {
        successfulRecords += response.processedCount || batchSize;
        const progress = Math.round((recordsSent / totalCount) * 100);
        console.log(`进度: ${progress}% - 批次 ${i+1}/${batches} 成功 (${successfulRecords}/${recordsSent}记录)`);
      } else {
        console.warn(`批次 ${i+1}/${batches} 失败: ${response.message || '未知错误'}`);
      }
    } catch (error) {
      console.error(`批次 ${i+1}/${batches} 发送异常:`, error.message);
    }
    
    // 批次间添加短暂延迟
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  const endTime = performance.now();
  const durationSec = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('========== 模拟完成 ==========');
  console.log(`总记录: ${totalCount}`);
  console.log(`成功记录: ${successfulRecords}`);
  console.log(`失败记录: ${totalCount - successfulRecords}`);
  console.log(`耗时: ${durationSec} 秒`);
  console.log(`速率: ${Math.round(successfulRecords / parseFloat(durationSec))} 记录/秒`);
}

/**
 * 主函数
 */
function main() {
  // 从命令行参数获取记录数量
  const args = process.argv.slice(2);
  let count = CONFIG.defaultCount;
  
  if (args.length > 0 && !isNaN(parseInt(args[0]))) {
    count = parseInt(args[0]);
  }
  
  // 如果参数为0, 则使用随机数量(3000-5000)
  if (count === 0) {
    count = 3000 + Math.floor(Math.random() * 2000);
    console.log(`使用随机数量: ${count}`);
  }
  
  simulateData(count)
    .then(() => {
      console.log('模拟器已完成任务');
      process.exit(0);
    })
    .catch(error => {
      console.error('模拟过程中发生错误:', error);
      process.exit(1);
    });
}

// 检查是否直接运行此脚本
if (require.main === module) {
  main();
} else {
  // 作为模块导出
  module.exports = {
    simulateData,
    generateBatch,
    selectRegionByWeight,
    generateRandomIp,
  };
} 