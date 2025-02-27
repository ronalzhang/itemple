import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { fetchStats } from '../services/api';

// 定义统计数据的类型
export interface Stats {
  todayCount: number;
  totalCount: number;
  regions: {
    name: string;
    value: number;
  }[];
}

// 定义上下文类型
interface StatsContextType {
  stats: Stats;
  loading: boolean;
  reloadStats: () => Promise<void>;
  resetStats: () => void;
  boostStats: () => void;
}

// 创建上下文
const StatsContext = createContext<StatsContextType>({
  stats: {
    todayCount: 0,
    totalCount: 0,
    regions: []
  },
  loading: false,
  reloadStats: async () => {},
  resetStats: () => {},
  boostStats: () => {}
});

// 创建Provider组件
export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    totalCount: 0,
    regions: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [lastLoad, setLastLoad] = useState<number>(0);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [lastMidnightReset, setLastMidnightReset] = useState<string>('');

  const loadStats = useCallback(async () => {
    const now = Date.now();
    // 如果正在重置或距离上次加载不到1秒，跳过
    if (isResetting || (now - lastLoad < 1000)) {
      console.log('防止频繁加载或正在重置，忽略请求');
      return;
    }
    
    try {
      setLoading(true);
      setLastLoad(now);
      
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error('获取统计数据超时')), 5000);
      });
      
      const response = await Promise.race([fetchStats(), timeoutPromise]);
      
      if (response && response.data) {
        console.log('获取统计数据成功:', response.data);
        setStats(response.data);
      } else {
        console.warn('获取到的统计数据为空或格式不正确');
        // 仅在非重置状态下设置空统计数据，且只在没有现有数据时设置
        if (!isResetting && (!stats.totalCount || stats.totalCount === 0)) {
          setStats({
            todayCount: 0,
            totalCount: 0,
            regions: []
          });
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 仅在非重置状态下设置空统计数据，且只在没有现有数据时设置
      if (!isResetting && (!stats.totalCount || stats.totalCount === 0)) {
        setStats({
          todayCount: 0,
          totalCount: 0,
          regions: []
        });
      }
    } finally {
      setLoading(false);
    }
  }, [lastLoad, isResetting, stats.totalCount]);

  // 修改resetStats，只有在localStorage完全损坏时才使用，平时不应清零数据
  const resetStats = useCallback(() => {
    try {
      console.log('重置统计数据...');
      // 检查localStorage是否完全损坏
      const currentData = localStorage.getItem('templeStats');
      if (!currentData || currentData === 'undefined' || currentData === 'null') {
        setIsResetting(true);
        localStorage.removeItem('templeStats');
        // 使用setTimeout确保localStorage删除操作完成后再加载
        setTimeout(async () => {
          await loadStats();
          setIsResetting(false);
        }, 100);
      } else {
        // 如果数据存在，只重新加载它
        console.log('数据存在，仅重新加载');
        loadStats();
      }
    } catch (error) {
      console.error('重置统计数据失败:', error);
      setIsResetting(false);
    }
  }, [loadStats]);

  // 每天凌晨重置今日计数，但保留总计数和地区分布
  const resetDailyStats = useCallback(() => {
    try {
      const today = new Date().toISOString().split('T')[0]; // 获取当前日期 YYYY-MM-DD
      
      // 如果今天已经重置过，则跳过
      if (lastMidnightReset === today) {
        return;
      }
      
      console.log('执行每日统计数据更新...');
      
      // 从localStorage获取当前数据
      const currentDataStr = localStorage.getItem('templeStats');
      if (!currentDataStr) return;
      
      const currentData = JSON.parse(currentDataStr);
      
      // 保存昨日人数到历史记录中（可选功能）
      // 这里可以添加历史记录的存储逻辑
      
      // 重置今日计数，但保留总计数和地区分布
      const updatedData = {
        ...currentData,
        todayCount: 0 // 重置今日计数
      };
      
      // 保存更新后的数据
      localStorage.setItem('templeStats', JSON.stringify(updatedData));
      console.log('每日统计数据更新成功:', updatedData);
      
      // 更新最后重置日期
      setLastMidnightReset(today);
      
      // 重新加载统计数据以更新UI
      loadStats();
    } catch (error) {
      console.error('每日统计数据更新失败:', error);
    }
  }, [lastMidnightReset, loadStats]);

  // 新增：提升统计数据的函数，为网站人气增加随机数量
  const boostStats = useCallback(() => {
    try {
      // 从localStorage获取当前数据
      const currentDataStr = localStorage.getItem('templeStats');
      if (!currentDataStr) return;
      
      const currentData = JSON.parse(currentDataStr);
      
      // 随机增加今日计数(50-200)
      const todayIncrease = 50 + Math.floor(Math.random() * 150);
      // 随机增加总计数(200-500)
      const totalIncrease = 200 + Math.floor(Math.random() * 300);
      
      // 随机分配地区增加量
      const regionKeys = ['asia', 'europe', 'america', 'others'];
      const regionIncreases: Record<string, number> = {};
      
      // 确保地区总和等于总增加量
      let remainingIncrease = totalIncrease;
      regionKeys.forEach((key, index) => {
        if (index === regionKeys.length - 1) {
          // 最后一个地区获得剩余所有增加量
          regionIncreases[key] = remainingIncrease;
        } else {
          // 随机分配一定比例
          const regionIncrease = Math.floor(remainingIncrease * (0.2 + Math.random() * 0.3));
          regionIncreases[key] = regionIncrease;
          remainingIncrease -= regionIncrease;
        }
      });
      
      // 更新数据
      const updatedData = {
        todayCount: (currentData.todayCount || 0) + todayIncrease,
        totalCount: (currentData.totalCount || 0) + totalIncrease,
        regions: {
          asia: (currentData.regions?.asia || 0) + regionIncreases.asia,
          europe: (currentData.regions?.europe || 0) + regionIncreases.europe,
          america: (currentData.regions?.america || 0) + regionIncreases.america,
          others: (currentData.regions?.others || 0) + regionIncreases.others
        }
      };
      
      // 保存回localStorage
      localStorage.setItem('templeStats', JSON.stringify(updatedData));
      console.log('提升统计数据成功:', updatedData);
      
      // 重新加载统计数据以更新UI
      loadStats();
    } catch (error) {
      console.error('提升统计数据失败:', error);
    }
  }, [loadStats]);

  const reloadStats = useCallback(async () => {
    if (!isResetting) {
      await loadStats();
    } else {
      console.log('正在重置，跳过重新加载');
    }
  }, [loadStats, isResetting]);

  // 计算下一个凌晨的时间点
  const getNextMidnight = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }, []);

  useEffect(() => {
    // 检查localStorage是否有数据，如果完全没有才初始化
    const currentData = localStorage.getItem('templeStats');
    if (!currentData || currentData === 'undefined' || currentData === 'null') {
      console.log('没有找到统计数据，初始化...');
      resetStats();
    } else {
      console.log('加载现有统计数据...');
      loadStats();
    }
    
    // 设置每5分钟刷新一次数据
    const intervalId = setInterval(() => {
      if (!isResetting) {
        loadStats();
      }
    }, 5 * 60 * 1000);
    
    // 设置每天凌晨重置今日计数
    const scheduleMidnightReset = () => {
      const timeToMidnight = getNextMidnight();
      console.log(`计划在 ${timeToMidnight}ms 后重置今日统计...`);
      
      const timerId = setTimeout(() => {
        resetDailyStats();
        // 重新计划下一天
        scheduleMidnightReset();
      }, timeToMidnight);
      
      return timerId;
    };
    
    // 启动定时任务
    const midnightTimerId = scheduleMidnightReset();
    
    // 执行一次每日重置检查，确保在应用启动时正确设置今日计数
    resetDailyStats();
    
    // 设置自动增加数据的定时器 - 每10-30分钟随机增加一次数据
    const autoBoostStats = () => {
      // 小幅增加数据
      const smallBoost = () => {
        try {
          // 从localStorage获取当前数据
          const currentDataStr = localStorage.getItem('templeStats');
          if (!currentDataStr) return;
          
          const currentData = JSON.parse(currentDataStr);
          
          // 随机增加今日计数(5-20)
          const todayIncrease = 5 + Math.floor(Math.random() * 15);
          // 随机增加总计数(10-30)
          const totalIncrease = 10 + Math.floor(Math.random() * 20);
          
          // 随机分配地区增加量
          const regionKeys = ['asia', 'europe', 'america', 'others'];
          const regionIncreases: Record<string, number> = {};
          
          // 确保地区总和等于总增加量
          let remainingIncrease = totalIncrease;
          regionKeys.forEach((key, index) => {
            if (index === regionKeys.length - 1) {
              // 最后一个地区获得剩余所有增加量
              regionIncreases[key] = remainingIncrease;
            } else {
              // 随机分配一定比例
              const regionIncrease = Math.floor(remainingIncrease * (0.2 + Math.random() * 0.3));
              regionIncreases[key] = regionIncrease;
              remainingIncrease -= regionIncrease;
            }
          });
          
          // 更新数据
          const updatedData = {
            todayCount: (currentData.todayCount || 0) + todayIncrease,
            totalCount: (currentData.totalCount || 0) + totalIncrease,
            regions: {
              asia: (currentData.regions?.asia || 0) + regionIncreases.asia,
              europe: (currentData.regions?.europe || 0) + regionIncreases.europe,
              america: (currentData.regions?.america || 0) + regionIncreases.america,
              others: (currentData.regions?.others || 0) + regionIncreases.others
            }
          };
          
          // 保存回localStorage
          localStorage.setItem('templeStats', JSON.stringify(updatedData));
          console.log('自动增加统计数据成功:', updatedData);
          
          // 重新加载统计数据以更新UI
          loadStats();
        } catch (error) {
          console.error('自动增加统计数据失败:', error);
        }
      };

      // 执行自动增加
      smallBoost();
      
      // 设置下一次自动增加的时间 (10-30分钟)
      const nextInterval = (10 + Math.floor(Math.random() * 20)) * 60 * 1000;
      return setTimeout(autoBoostStats, nextInterval);
    };
    
    // 启动自动增加数据的定时器
    const autoBoostTimerId = autoBoostStats();
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimerId);
      clearTimeout(autoBoostTimerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(() => ({
    stats,
    loading,
    reloadStats,
    resetStats,
    boostStats
  }), [stats, loading, reloadStats, resetStats, boostStats]);

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = () => useContext(StatsContext);

export default StatsContext; 