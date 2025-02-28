/**
 * 寺庙网站数据生成脚本
 * 用于快速生成3000-5000条访问记录，增加网站统计数据
 */

// 模拟环境变量
const API_BASE_URL = 'http://localhost:3000/api';

// 区域代码映射到国家和IP范围
const REGIONS = {
  asia: {
    countries: ['中国', '日本', '韩国', '印度', '泰国', '新加坡', '马来西亚', '越南', '菲律宾', '印度尼西亚'],
    ipRanges: [
      { start: '1.0.0.0', end: '126.255.255.255' },       // 亚洲IP范围1
      { start: '202.0.0.0', end: '223.255.255.255' }      // 亚洲IP范围2
    ],
    weight: 60 // 权重百分比，亚洲访问量较大
  },
  europe: {
    countries: ['英国', '法国', '德国', '意大利', '西班牙', '荷兰', '比利时', '瑞士', '瑞典', '波兰'],
    ipRanges: [
      { start: '77.0.0.0', end: '95.255.255.255' },      // 欧洲IP范围1
      { start: '176.0.0.0', end: '195.255.255.255' }     // 欧洲IP范围2
    ],
    weight: 15
  },
  america: {
    countries: ['美国', '加拿大', '墨西哥', '巴西', '阿根廷', '智利', '秘鲁', '哥伦比亚', '委内瑞拉', '古巴'],
    ipRanges: [
      { start: '24.0.0.0', end: '76.255.255.255' },      // 美洲IP范围1
      { start: '96.0.0.0', end: '108.255.255.255' }      // 美洲IP范围2
    ],
    weight: 20
  },
  others: {
    countries: ['澳大利亚', '新西兰', '埃及', '南非', '肯尼亚', '尼日利亚', '以色列', '沙特阿拉伯', '阿联酋', '摩洛哥'],
    ipRanges: [
      { start: '196.0.0.0', end: '201.255.255.255' },    // 其他地区IP范围1
      { start: '41.0.0.0', end: '64.255.255.255' }       // 其他地区IP范围2
    ],
    weight: 5
  }
};

/**
 * 将IPv4地址转换为数字表示
 * @param {string} ip - IPv4地址
 * @returns {number} 数字表示的IP地址
 */
function ipToNumber(ip) {
  return ip.split('.')
    .map((octet, index) => parseInt(octet) * Math.pow(256, 3 - index))
    .reduce((acc, val) => acc + val, 0);
}

/**
 * 将数字转换为IPv4地址
 * @param {number} num - 数字表示的IP地址
 * @returns {string} IPv4地址字符串
 */
function numberToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

/**
 * 生成指定范围内的随机IP地址
 * @param {string} startIp - 起始IP地址
 * @param {string} endIp - 结束IP地址
 * @returns {string} 随机IP地址
 */
function generateRandomIpInRange(startIp, endIp) {
  const startNum = ipToNumber(startIp);
  const endNum = ipToNumber(endIp);
  const randomNum = startNum + Math.floor(Math.random() * (endNum - startNum + 1));
  return numberToIp(randomNum);
}

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
  
  return 'asia'; // 默认返回亚洲
}

/**
 * 为特定区域生成随机IP地址
 * @param {string} region - 区域代码
 * @returns {string} 随机IP地址
 */
function generateRandomIpForRegion(region) {
  const regionData = REGIONS[region];
  const ipRange = regionData.ipRanges[Math.floor(Math.random() * regionData.ipRanges.length)];
  return generateRandomIpInRange(ipRange.start, ipRange.end);
}

/**
 * 生成随机的每日访问时间分布
 * @param {number} count - 总访问量
 * @returns {Array} 每小时的访问量分布
 */
function generateHourlyDistribution(count) {
  // 创建一个24小时的数组
  const hourlyDistribution = Array(24).fill(0);
  
  // 定义高峰时段和普通时段
  const peakHours = [9, 10, 11, 12, 13, 14, 19, 20, 21, 22]; // 上午9点到下午2点，晚上7点到10点
  
  // 分配访问量
  let remaining = count;
  
  // 先给高峰时段分配70%的流量
  const peakTraffic = Math.floor(count * 0.7);
  const peakTrafficPerHour = Math.floor(peakTraffic / peakHours.length);
  
  peakHours.forEach(hour => {
    // 在基准值上增加一些随机性
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2的随机因子
    const hourCount = Math.floor(peakTrafficPerHour * randomFactor);
    hourlyDistribution[hour] = hourCount;
    remaining -= hourCount;
  });
  
  // 剩余的30%分配给非高峰时段
  const nonPeakHours = Array.from({length: 24}, (_, i) => i).filter(hour => !peakHours.includes(hour));
  const nonPeakTrafficPerHour = Math.floor(remaining / nonPeakHours.length);
  
  nonPeakHours.forEach(hour => {
    // 添加一些随机性
    const randomFactor = 0.5 + Math.random() * 1.0; // 0.5-1.5的随机因子
    const hourCount = Math.floor(nonPeakTrafficPerHour * randomFactor);
    hourlyDistribution[hour] = hourCount;
    remaining -= hourCount;
  });
  
  // 确保所有访问量都被分配
  if (remaining > 0) {
    // 随机分配剩余的计数
    for (let i = 0; i < remaining; i++) {
      const randomHour = Math.floor(Math.random() * 24);
      hourlyDistribution[randomHour]++;
    }
  } else if (remaining < 0) {
    // 如果超分配了，从高峰时段减去
    let deficit = -remaining;
    while (deficit > 0) {
      for (const hour of peakHours) {
        if (hourlyDistribution[hour] > 0 && deficit > 0) {
          hourlyDistribution[hour]--;
          deficit--;
        }
        if (deficit === 0) break;
      }
      if (deficit > 0) {
        // 如果还有赤字，从任何有正值的时段减去
        for (let hour = 0; hour < 24; hour++) {
          if (hourlyDistribution[hour] > 0 && deficit > 0) {
            hourlyDistribution[hour]--;
            deficit--;
          }
          if (deficit === 0) break;
        }
      }
    }
  }
  
  return hourlyDistribution;
}

/**
 * 模拟API调用记录祈福数据
 * @param {string} ip - IP地址
 * @param {Object} options - 额外选项
 * @returns {Promise} Promise对象
 */
async function simulatePrayerRecord(ip, options = {}) {
  try {
    const currentStats = JSON.parse(localStorage.getItem('templeStats') || '{"todayCount":0,"totalCount":0,"regions":[]}');
    
    // 确定区域
    let region = options.region || 'asia';
    
    // 更新统计数据
    currentStats.todayCount = (currentStats.todayCount || 0) + 1;
    currentStats.totalCount = (currentStats.totalCount || 0) + 1;
    
    // 确保regions数组存在
    if (!Array.isArray(currentStats.regions)) {
      currentStats.regions = [];
    }
    
    // 更新区域统计
    let regionExists = false;
    for (let i = 0; i < currentStats.regions.length; i++) {
      if (currentStats.regions[i].name === region) {
        currentStats.regions[i].value = (currentStats.regions[i].value || 0) + 1;
        regionExists = true;
        break;
      }
    }
    
    // 如果区域不存在，添加它
    if (!regionExists) {
      currentStats.regions.push({
        name: region,
        value: 1
      });
    }
    
    // 保存回localStorage
    localStorage.setItem('templeStats', JSON.stringify(currentStats));
    
    // 打印模拟调用信息到控制台
    if (options.verbose) {
      console.log(`[${new Date().toISOString()}] 记录祈福: IP=${ip}, 区域=${region}`);
    }
    
    return { success: true, ip, region };
  } catch (error) {
    console.error('记录祈福失败:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 生成指定数量的祈福记录
 * @param {number} count - 要生成的记录数
 * @param {Object} options - 选项
 * @returns {Promise} Promise对象
 */
async function generatePrayerRecords(count = 3000, options = {}) {
  const startTime = Date.now();
  const results = {
    totalRecords: count,
    successful: 0,
    failed: 0,
    regionCounts: {},
    errors: []
  };
  
  console.log(`开始生成 ${count} 条祈福记录...`);
  
  // 生成基于时间分布的访问记录
  const hourlyDistribution = generateHourlyDistribution(count);
  console.log('访问时间分布:', hourlyDistribution);
  
  // 使用Promise.all进行批量处理，每批500条
  const batchSize = 500;
  const batches = Math.ceil(count / batchSize);
  
  for (let b = 0; b < batches; b++) {
    const batchStart = b * batchSize;
    const batchEnd = Math.min((b + 1) * batchSize, count);
    const batchCount = batchEnd - batchStart;
    
    console.log(`处理批次 ${b + 1}/${batches}: 记录 ${batchStart + 1} 至 ${batchEnd}`);
    
    const promises = [];
    for (let i = 0; i < batchCount; i++) {
      // 根据权重选择区域
      const region = selectRegionByWeight();
      
      // 为该区域生成随机IP
      const ip = generateRandomIpForRegion(region);
      
      // 模拟对API的调用
      promises.push(
        simulatePrayerRecord(ip, { 
          region,
          verbose: i % 100 === 0 // 仅每100条记录打印一次日志
        })
      );
      
      // 计算区域统计
      results.regionCounts[region] = (results.regionCounts[region] || 0) + 1;
    }
    
    // 等待当前批次完成
    const batchResults = await Promise.all(promises);
    
    // 计算结果
    for (const result of batchResults) {
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(result.error);
      }
    }
    
    // 显示进度
    const progress = ((b + 1) / batches * 100).toFixed(1);
    console.log(`进度: ${progress}% (${results.successful} 成功, ${results.failed} 失败)`);
    
    // 每批次之间稍微暂停一下，避免浏览器卡死
    if (b < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  const endTime = Date.now();
  results.duration = endTime - startTime;
  
  console.log('生成祈福记录完成!');
  console.log(`总耗时: ${results.duration}ms (${(results.duration/1000).toFixed(2)}秒)`);
  console.log(`成功: ${results.successful}, 失败: ${results.failed}`);
  console.log('区域分布:', results.regionCounts);
  
  // 如果有错误，打印前5条
  if (results.errors.length > 0) {
    console.error(`发生了 ${results.errors.length} 个错误. 前5个错误:`);
    results.errors.slice(0, 5).forEach((err, i) => console.error(`错误 ${i+1}:`, err));
  }
  
  return results;
}

/**
 * 生成随机数量的祈福记录
 * @returns {Promise} Promise对象
 */
async function generateRandomPrayerRecords() {
  // 生成3000-5000之间的随机数
  const count = 3000 + Math.floor(Math.random() * 2000);
  return generatePrayerRecords(count);
}

// 导出函数以便从控制台调用
window.temple = {
  generatePrayerRecords,
  generateRandomPrayerRecords,
  simulatePrayerRecord,
  generateRandomIpForRegion,
  selectRegionByWeight
};

console.log(
  "%c祈福数据生成工具已加载 %c\n" +
  "使用方法:\n" +
  "1. temple.generatePrayerRecords(3000) - 生成指定数量的祈福记录\n" +
  "2. temple.generateRandomPrayerRecords() - 生成3000-5000条随机祈福记录\n",
  "color: white; background: #f5a623; padding: 4px; border-radius: 3px; font-weight: bold;",
  "color: black; background: transparent;"
); 