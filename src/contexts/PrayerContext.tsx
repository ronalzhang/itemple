import React, { createContext, useState, useContext, useCallback } from 'react';
import { recordPrayer } from '../services/api';

// 上下文接口
interface PrayerContextType {
  prayerCount: number;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  incrementPrayerCount: () => Promise<void>;
}

// 默认值
const defaultContext: PrayerContextType = {
  prayerCount: 0,
  isLoading: false,
  setIsLoading: () => {},
  incrementPrayerCount: async () => {},
};

// 创建上下文
const PrayerContext = createContext<PrayerContextType>(defaultContext);

// 上下文提供者组件
export const PrayerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [prayerCount, setPrayerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 增加祈福计数的函数
  const incrementPrayerCount = useCallback(async () => {
    try {
      setIsLoading(true);
      // 调用API记录祈福
      const response = await recordPrayer();
      console.log('Prayer response:', response.data); // 添加日志以便调试
      
      // 使用更新后的字段名totalCount
      if (response && response.data && typeof response.data.totalCount === 'number') {
        setPrayerCount(response.data.totalCount);
      } else {
        setPrayerCount(prev => prev + 1);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to increment prayer count:', error);
      return Promise.reject(error);
    }
  }, []);

  // 提供上下文值
  const contextValue: PrayerContextType = {
    prayerCount,
    isLoading,
    setIsLoading,
    incrementPrayerCount,
  };

  return (
    <PrayerContext.Provider value={contextValue}>
      {children}
    </PrayerContext.Provider>
  );
};

// 自定义Hook，用于访问上下文
export const usePrayerContext = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayerContext must be used within a PrayerProvider');
  }
  return context;
};

export default PrayerContext; 