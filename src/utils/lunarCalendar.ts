import { Lunar, Solar } from 'lunar-javascript';

// 添加缓存机制，存储已计算的结果
let ceremonyDateCache: {
  result: any;
  expiry: number;
} | null = null;

// 农历月份名称
export const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 农历日期名称
export const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 生肖
export const ZODIAC_SIGNS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 缓存项类型定义
interface CacheItem {
  result: any;
  expiry: number;
}

// 缓存变量
let optimizedCache: CacheItem | null = null;
let fallbackCache: CacheItem | null = null;

/**
 * 农历日期计算工具
 */

/**
 * 计算当前的农历日期
 * 简化版，实际项目应使用完整的农历算法库
 */
export const calculateLunarDate = (): string => {
  try {
    // 尝试使用lunar-javascript库计算
    const now = new Date();
    const solar = Solar.fromDate(now);
    const lunar = solar.getLunar();
    
    const month = lunar.getMonth();
    const day = lunar.getDay();
    
    // 确保索引在有效范围内
    const lunarMonth = LUNAR_MONTHS[(month - 1 + 12) % 12];
    const lunarDay = LUNAR_DAYS[(day - 1 + 30) % 30];
    
    // 返回农历日期字符串
    return `${lunarMonth}${lunarDay}`;
  } catch (error) {
    console.error('农历日期计算出错:', error);
    
    // 使用备用方法
    const now = new Date();
    // 确保使用固定算法，不使用随机数
    const month = now.getMonth();
    const day = now.getDate() - 1; // 简单的偏移，不使用随机数
    
    // 确保索引在有效范围内
    const lunarMonth = LUNAR_MONTHS[month];
    const lunarDay = LUNAR_DAYS[(day % 30)];
    
    // 返回农历日期字符串
    return `${lunarMonth}${lunarDay}`;
  }
};

/**
 * 计算下一个法会日期（农历初一或十五）
 */
export const getNextCeremonyDate = (): { 
  date: string; 
  daysAway: number;
  year: number;         // 公历年
  month: number;        // 公历月
  day: number;          // 公历日
  lunarYear: number;    // 农历年
  lunarMonth: number;   // 农历月
  lunarDay: number;     // 农历日
  isFirstDay: boolean;  // 是否是初一
  success: boolean;     // 添加成功标志
} => {
  try {
    // 尝试使用优化版本获取农历日期
    const result = getNextCeremonyDateOptimized();
    
    // 从Solar对象获取公历日期
    const solarDate = new Date(result.solarDate.replace(/-/g, '/'));
    
    return {
      date: `${result.month}月${result.day}日`,
      daysAway: result.diffDays,
      year: solarDate.getFullYear(),   // 公历年
      month: solarDate.getMonth() + 1, // 公历月
      day: solarDate.getDate(),        // 公历日
      lunarYear: result.year,          // 农历年
      lunarMonth: result.month,        // 农历月
      lunarDay: result.day,            // 农历日
      isFirstDay: result.isFirstDay,
      success: result.success          // 传递成功标志
    };
  } catch (error) {
    console.error('计算农历日期错误:', error);
    
    // 如果优化版本失败，使用备用方法
    try {
      // 尝试使用备用函数
      const fallbackResult = getNextCeremonyDateFallback();
      
      return {
        date: `${fallbackResult.month}月${fallbackResult.day}日`,
        daysAway: fallbackResult.diffDays,
        year: fallbackResult.year,     
        month: fallbackResult.month,   
        day: fallbackResult.day,      
        lunarYear: new Date().getFullYear(),  // 备用时无法获取准确农历年，使用当前年
        lunarMonth: fallbackResult.lunarMonth || fallbackResult.month, 
        lunarDay: fallbackResult.day === 1 ? 1 : 15, 
        isFirstDay: fallbackResult.isFirstDay,
        success: fallbackResult.success || true  // 备用方法也算成功
      };
    } catch (fallbackError) {
      console.error('备用农历计算也失败:', fallbackError);
      
      // 最后一个备用选项，使用硬编码的日期
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      return {
        date: `${nextMonth.getMonth() + 1}月1日`,
        daysAway: 15, // 约15天
        year: nextMonth.getFullYear(),
        month: nextMonth.getMonth() + 1,
        day: 1,
        lunarYear: nextMonth.getFullYear(),
        lunarMonth: nextMonth.getMonth() + 1,
        lunarDay: 1,
        isFirstDay: true,
        success: false // 硬编码备用方案标记为不成功
      };
    }
  }
};

/**
 * 获取下一个初一或十五的日期（优化版）
 * 使用缓存机制，避免频繁计算
 * @returns {object} 包含下一个初一或十五的信息
 */
export const getNextCeremonyDateOptimized = (): {
  year: number;
  month: number;
  day: number;
  isFirstDay: boolean;
  diffDays: number;
  solarDate: string; // 添加公历日期
  success: boolean;  // 添加成功标志
} => {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (ceremonyDateCache && ceremonyDateCache.expiry > now) {
    return ceremonyDateCache.result;
  }
  
  try {
    // 获取当前日期
    const today = new Date();
    const solar = Solar.fromDate(today);
    const lunar = solar.getLunar();
    
    // 当前农历日期
    const currentYear = lunar.getYear();
    const currentMonth = lunar.getMonth();
    const currentDay = lunar.getDay();
    
    console.log(`当前农历日期：${currentYear}年${currentMonth}月${currentDay}日`);
    
    // 今天是否是法会日（初一或十五）
    const isTodayCeremonyDay = currentDay === 1 || currentDay === 15;
    
    let targetYear, targetMonth, targetDay, targetLunar, isFirstDay;
    
    if (isTodayCeremonyDay) {
      // 如果今天是法会日，直接使用今天的日期
      console.log('今天是法会日，无需计算下一个法会日');
      targetYear = currentYear;
      targetMonth = currentMonth;
      targetDay = currentDay;
      targetLunar = lunar;
      isFirstDay = currentDay === 1;
    } else {
      // 确定下一个初一或十五的日期
      targetYear = currentYear;
      targetMonth = currentMonth;
      targetDay = 1; // 默认为初一
      isFirstDay = true;
      
      // 如果当前日期小于15号，下一个法会日是当月十五
      if (currentDay < 15) {
        targetDay = 15;
        isFirstDay = false;
      } 
      // 如果当前日期是15号，下一个法会日是下月初一
      else if (currentDay === 15) {
        targetDay = 1;
        isFirstDay = true;
        // 处理月份进位
        if (currentMonth === 12) {
          targetMonth = 1;
          targetYear++;
        } else {
          targetMonth++;
        }
      } 
      // 如果当前日期大于15号，下一个法会日是下月初一
      else {
        targetDay = 1;
        isFirstDay = true;
        // 处理月份进位
        if (currentMonth === 12) {
          targetMonth = 1;
          targetYear++;
        } else {
          targetMonth++;
        }
      }
      
      console.log(`计算的下一个法会日：${targetYear}年${targetMonth}月${targetDay}日`);
      
      // 创建目标农历日期
      // 注意：这里直接使用lunar-javascript库的方法构建目标日期
      // 而不是通过lunar.next()方法前进，避免计算错误
      targetLunar = lunar;
      
      // 计算从当前日期到目标日期需要前进的天数
      let daysToAdd = 0;
      
      if (isFirstDay && currentDay > 15) {
        // 当前日期大于15，目标是下月初一
        // 简单估算：当月剩余天数 + 1
        daysToAdd = 30 - currentDay + 1;
      } else if (isFirstDay && currentDay === 15) {
        // 当前是15，目标是下月初一
        // 简单估算：半个月
        daysToAdd = 16;
      } else if (!isFirstDay && currentDay < 15) {
        // 当前日期小于15，目标是当月十五
        daysToAdd = 15 - currentDay;
      } else {
        // 其他情况（理论上不应该出现）
        console.error('未预期的日期计算情况');
        // 默认前进到下一个月初一
        daysToAdd = 30 - currentDay + 1;
      }
      
      console.log(`需要前进天数：${daysToAdd}`);
      
      // 使用next方法前进到目标日期
      targetLunar.next(daysToAdd);
      
      // 验证计算结果
      if ((isFirstDay && targetLunar.getDay() !== 1) || 
          (!isFirstDay && targetLunar.getDay() !== 15)) {
        console.error(`法会日期计算错误: 期望${isFirstDay ? '初一' : '十五'}，实际得到${targetLunar.getDay()}日`);
        
        // 修正日期
        if (isFirstDay) {
          // 如果目标应该是初一但不是，调整到下个月初一
          if (targetLunar.getDay() < 15) {
            // 如果当前日小于15，前进到本月初一可能出错，调整到下月初一
            const daysToNextMonth = 30 - targetLunar.getDay() + 1;
            targetLunar.next(daysToNextMonth);
          } else {
            // 如果当前日大于等于15，前进到下月初一
            const daysToNextMonth = 30 - targetLunar.getDay() + 1;
            targetLunar.next(daysToNextMonth);
          }
        } else {
          // 如果目标应该是十五但不是，调整到当月十五或下月十五
          if (targetLunar.getDay() < 15) {
            // 如果当前日小于15，前进到本月十五
            targetLunar.next(15 - targetLunar.getDay());
          } else {
            // 如果当前日大于15，前进到下月十五
            targetLunar.next(30 - targetLunar.getDay() + 15);
          }
        }
      }
    }
    
    // 获取对应的公历日期
    const targetSolar = targetLunar.getSolar();
    
    // 获取目标日期的 Date 对象并计算相差天数
    const targetDate = new Date(targetSolar.toYmd().replace(/-/g, '/'));
    const diffTime = targetDate.getTime() - today.getTime();
    
    // 修复计算方法，使用更精确的计算并确保结果为非负数
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    
    // 当天特殊处理为0天
    const isSameDay = targetDate.toDateString() === today.toDateString();
    const finalDiffDays = isSameDay ? 0 : diffDays;
    
    // 创建结果
    const result = {
      year: targetLunar.getYear(),
      month: targetLunar.getMonth(),
      day: targetLunar.getDay(),
      solarDate: targetSolar.toYmd(),
      diffDays: finalDiffDays,
      isFirstDay: targetLunar.getDay() === 1,
      success: true
    };
    
    console.log(`最终计算结果:`, result);
    
    // 缓存结果，有效期为1小时
    ceremonyDateCache = {
      result,
      expiry: now + 3600000
    };
    
    return result;
  } catch (error) {
    console.error("计算农历日期错误:", error);
    // 使用备用方法
    const fallbackResult = getNextCeremonyDateFallback();
    return {
      ...fallbackResult,
      success: false
    };
  }
};

/**
 * 备用方法：简单估算下一个初一或十五的日期
 * 这个方法不需要lunar-javascript库，但不是很精确
 */
export const getNextCeremonyDateFallback = () => {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (fallbackCache && fallbackCache.expiry > now) {
    return fallbackCache.result;
  }
  
  const today = new Date();
  const currentDay = today.getDate();
  let daysToAdd = 0;
  let isFirstDay = false;
  
  // 简单假设每个月的1号和15号是农历的初一和十五
  if (currentDay < 15) {
    // 当前日期小于15，下一个日期是本月15号
    daysToAdd = 15 - currentDay;
    isFirstDay = false;
  } else {
    // 当前日期大于或等于15，下一个日期是下个月1号
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    daysToAdd = lastDayOfMonth - currentDay + 1;
    isFirstDay = true;
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  
  const result = {
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1, // JavaScript月份从0开始
    day: isFirstDay ? 1 : 15,
    solarDate: nextDate.toISOString().split('T')[0],
    diffDays: daysToAdd,
    isFirstDay,
    success: true // 添加success字段
  };
  
  // 缓存备用结果，有效期为1小时
  fallbackCache = {
    result,
    expiry: Date.now() + 3600000
  };
  
  console.log('使用备用计算方法，估算法会日期:', result);
  return result;
};

/**
 * 格式化农历月份和日期（添加前导零）
 * @param num 农历数字
 * @returns 格式化后的字符串
 */
export const formatLunarNumber = (num: number): string => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const chineseUnits = ['', '十', '百', '千', '万'];
  
  if (num <= 10) {
    return chineseNums[num];
  } else if (num < 20) {
    return `十${num > 10 ? chineseNums[num - 10] : ''}`;
  } else if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return `${chineseNums[tens]}十${ones > 0 ? chineseNums[ones] : ''}`;
  } else {
    // 对于年份，转换成每个数字的中文表示
    return num.toString().split('').map(digit => chineseNums[parseInt(digit)]).join('');
  }
}; 