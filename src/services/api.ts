import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Stats } from '../contexts/StatsContext';

// 配置axios的基础URL
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api'
  : '/api';

// 创建带有缓存能力的axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 超时设置为15秒
  headers: {
    'Content-Type': 'application/json',
  }
});

// 响应拦截器，处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求失败:', error.message || error);
    // 检查是否是网络错误或超时
    if (error.code === 'ECONNABORTED' || !navigator.onLine) {
      console.log('网络连接问题，尝试从缓存获取数据');
      // 将在后续实现
    }
    return Promise.reject(error);
  }
);

// 用于记录被缓存的请求
const apiCache = new Map();

// 带有缓存功能的API调用
const cachedApiCall = async (url: string, params?: any, cacheTime = 60000) => {
  const cacheKey = url + (params ? JSON.stringify(params) : '');
  
  // 检查缓存是否有效
  const cachedData = apiCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp < cacheTime)) {
    console.log('从缓存获取数据:', url);
    return cachedData.data;
  }
  
  try {
    // 如果没有缓存或缓存已过期，发送请求
    const response = await apiClient.get(url, { params });
    
    // 缓存响应
    apiCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    // 如果请求失败但有过期的缓存，返回过期的缓存
    if (cachedData) {
      console.log('请求失败，使用过期缓存:', url);
      return cachedData.data;
    }
    throw error;
  }
};

// 添加API响应接口定义
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 获取统计数据
export const fetchStats = async (): Promise<{ data: Stats }> => {
  try {
    // 使用真实API调用获取统计数据
    const response = await apiClient.get('/stats');
    
    if (response.data && response.data.success) {
      // 确保regions是数组格式
      const statsData = response.data.data;
      
      // 数据格式转换，确保数据格式一致性
      const formattedData = {
        todayCount: statsData.todayCount || 0,
        totalCount: statsData.totalCount || 0,
        regions: statsData.regions || []
      };
      
      console.log('获取到统计数据:', formattedData);
      return { data: formattedData };
    } else {
      throw new Error('获取统计数据失败');
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    
    // 从本地存储获取备用数据
    const statsData = localStorage.getItem('templeStats');
    if (statsData) {
      try {
        const parsedData = JSON.parse(statsData);
        // 数据格式转换
        const formattedData = {
          todayCount: parsedData.todayCount || 0,
          totalCount: parsedData.totalCount || 0,
          regions: parsedData.regions || []
        };
        return { data: formattedData };
      } catch (parseError) {
        console.error('解析备用统计数据失败:', parseError);
      }
    }
    
    // 如果无法获取备用数据，返回默认值
    return { 
      data: {
        todayCount: 0,
        totalCount: 0,
        regions: []
      } 
    };
  }
};

// 记录祈福
export const recordPrayer = async (ipAddress?: string): Promise<ApiResponse> => {
  try {
    // 调用后端API记录祈福
    const response = await apiClient.post('/prayer');
    
    // 成功后更新本地统计数据缓存
    try {
      const stats = await fetchStats();
      if (stats && stats.data) {
        localStorage.setItem('templeStats', JSON.stringify(stats.data));
      }
    } catch (statsError) {
      console.error('更新统计数据缓存失败:', statsError);
    }
    
    return response.data;
  } catch (error) {
    console.error('记录祈福失败:', error);
    
    // 返回错误响应
    return {
      success: false,
      message: '祈福失败，请稍后再试',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 获取捐赠信息
 */
export const fetchDonationInfo = async () => {
  // 在实际项目中，这里应该调用后端API
  return { 
    data: {
      btc: 'bc1qwu2tv65mjqrp6rdxs6rrt7xak98vs7ulmyt99y',
      eth: '0xE6429B0cFe55c7c91325Ed8D026CE23c44691f8b',
      usdt: 'TNxcin7VcE2XvAjF44bqhunE1kQe4Mjhyp'
    }
  };
};

/**
 * 获取寺庙图片
 */
export const fetchTempleImages = async () => {
  // 在实际项目中，这里应该调用后端API
  return { 
    data: [
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
}; 