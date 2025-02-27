import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Stats } from '../contexts/StatsContext';

// 模拟API数据，实际项目中应该从后端获取
const mockData = {
  stats: {
    todayCount: 0,
    totalCount: 0,
    regions: {
      asia: 0,
      europe: 0,
      america: 0,
      others: 0
    }
  },
  donations: {
    btc: 'bc1qwu2tv65mjqrp6rdxs6rrt7xak98vs7ulmyt99y',
    eth: '0xE6429B0cFe55c7c91325Ed8D026CE23c44691f8b',
    usdt: 'TNxcin7VcE2XvAjF44bqhunE1kQe4Mjhyp'
  },
  templeImages: [
    '/images/temple1.jpg',
    '/images/temple2.jpg',
    '/images/temple3.jpg',
    '/images/temple4.jpg',
    '/images/temple5.jpg',
    '/images/temple6.jpg',
    '/images/temple7.jpg',
    '/images/temple8.jpg'
  ]
};

// 使用本地存储来模拟数据持久化
if (!localStorage.getItem('templeStats')) {
  localStorage.setItem('templeStats', JSON.stringify(mockData.stats));
}

/**
 * 将区域数据转换为图表所需的数组格式
 */
const convertRegionsToArray = (regionsObj: any) => {
  const t = i18n.t.bind(i18n);
  return [
    { name: t('stats.asia'), value: regionsObj.asia },
    { name: t('stats.europe'), value: regionsObj.europe },
    { name: t('stats.america'), value: regionsObj.america },
    { name: t('stats.others'), value: regionsObj.others }
  ];
};

// 模拟数据获取延迟
const simulateNetworkDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取统计数据
export const fetchStats = async (): Promise<{ data: Stats }> => {
  try {
    // 模拟网络延迟
    await simulateNetworkDelay(500);
    
    // 从localStorage获取数据
    const statsData = localStorage.getItem('templeStats');
    let stats: Stats;
    
    if (statsData) {
      try {
        const parsedData = JSON.parse(statsData);
        
        // 数据格式转换，确保regions格式一致性
        let regions = [];
        if (parsedData.regions) {
          if (Array.isArray(parsedData.regions)) {
            // 已经是数组格式
            regions = parsedData.regions;
          } else {
            // 转换对象格式为数组格式
            regions = Object.entries(parsedData.regions).map(([name, value]) => ({
              name,
              value: typeof value === 'number' ? value : 0
            }));
          }
        }
        
        stats = {
          todayCount: parsedData.todayCount || 0,
          totalCount: parsedData.totalCount || 0,
          regions
        };
        
        console.log('获取到现有统计数据:', stats);
      } catch (error) {
        console.error('解析统计数据失败:', error);
        // 如果解析失败，初始化默认数据
        stats = getInitialStats();
      }
    } else {
      // 如果没有数据，初始化默认数据
      stats = getInitialStats();
      localStorage.setItem('templeStats', JSON.stringify(stats));
      console.log('初始化统计数据:', stats);
    }
    
    return { data: stats };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
};

// 初始化默认统计数据 - 非零值，看起来有人在使用
const getInitialStats = (): Stats => {
  // 初始数据设置为非零值，显得有一定用户基础
  return {
    todayCount: 50 + Math.floor(Math.random() * 150), // 50-200之间的随机数
    totalCount: 1000 + Math.floor(Math.random() * 2000), // 1000-3000之间的随机数
    regions: [
      { name: 'asia', value: 500 + Math.floor(Math.random() * 1000) }, // 亚洲最多
      { name: 'europe', value: 200 + Math.floor(Math.random() * 400) },
      { name: 'america', value: 300 + Math.floor(Math.random() * 500) },
      { name: 'others', value: 100 + Math.floor(Math.random() * 200) }
    ]
  };
};

// 记录祈福
export const recordPrayer = async (ip?: string): Promise<{ success: boolean }> => {
  try {
    // 模拟网络延迟
    await simulateNetworkDelay(700);
    
    // 模拟IP地理位置识别 (实际应用中，这应该是服务器端功能)
    const region = determineRegion(ip);
    
    // 从localStorage获取当前数据
    const statsData = localStorage.getItem('templeStats');
    let stats: any = statsData ? JSON.parse(statsData) : getInitialStats();
    
    // 更新统计数据
    stats.todayCount = (stats.todayCount || 0) + 1;
    stats.totalCount = (stats.totalCount || 0) + 1;
    
    // 处理地区数据
    if (!stats.regions) {
      stats.regions = {
        asia: 0,
        europe: 0,
        america: 0,
        others: 0
      };
    }
    
    // 如果regions是数组，转换为对象
    if (Array.isArray(stats.regions)) {
      const regionsObj: Record<string, number> = {};
      stats.regions.forEach((item: { name: string, value: number }) => {
        regionsObj[item.name] = item.value;
      });
      stats.regions = regionsObj;
    }
    
    // 更新对应地区的计数
    stats.regions[region] = (stats.regions[region] || 0) + 1;
    
    // 保存回localStorage
    localStorage.setItem('templeStats', JSON.stringify(stats));
    console.log('更新统计数据成功:', stats);
    
    return { success: true };
  } catch (error) {
    console.error('记录祈福失败:', error);
    return { success: false };
  }
};

// 根据IP确定地区 (简化模拟)
const determineRegion = (ip?: string): string => {
  if (!ip) {
    // 随机分配地区
    const regions = ['asia', 'europe', 'america', 'others'];
    const weights = [0.5, 0.2, 0.2, 0.1]; // 亚洲权重最高
    
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return regions[i];
      }
    }
    
    return 'asia'; // 默认亚洲
  }
  
  // 这里可以添加实际的IP地理位置检测逻辑
  // 简化模拟 - 根据IP最后一位数字决定地区
  const lastDigit = parseInt(ip.split('.').pop() || '0', 10);
  
  if (lastDigit < 3) return 'europe';
  if (lastDigit < 6) return 'america';
  if (lastDigit < 9) return 'others';
  return 'asia';
};

/**
 * 获取捐赠信息
 */
export const fetchDonationInfo = async () => {
  // 在实际项目中，这里应该调用后端API
  // return axios.get('/api/donations');
  
  return { data: mockData.donations };
};

/**
 * 获取寺庙图片
 */
export const fetchTempleImages = async () => {
  // 在实际项目中，这里应该调用后端API
  // return axios.get('/api/temple/images');
  
  return { data: mockData.templeImages };
}; 