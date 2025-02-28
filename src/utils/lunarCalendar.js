import { Lunar, Solar } from 'lunar-javascript';

// 农历月份中文名
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 农历日期中文名
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

/**
 * 计算日期对应的农历日期
 * @param {Date} date - 公历日期
 * @returns {string} - 农历日期字符串，例如："壬寅年三月十五"
 */
const calculateLunarDate = (date = new Date()) => {
  try {
    // 确保传入的是日期对象
    const targetDate = date instanceof Date ? date : new Date(date);
    
    // 转换为农历
    const lunar = Lunar.fromDate(targetDate);
    
    // 获取农历年月日
    const lunarYear = lunar.getYearInChinese();
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    
    // 返回农历日期字符串
    return `${lunarYear}年${lunarMonth}月${lunarDay}`;
  } catch (error) {
    console.error('计算农历日期出错:', error);
    return '';
  }
};

/**
 * 获取下一个法会日期（初一或十五）
 * @returns {Object} 法会信息对象
 */
const getNextCeremonyDate = () => {
  try {
    const today = new Date();
    let nextDate = new Date(today);
    let isFirstDay = false;
    let diffDays = 0;
    
    // 查找接下来30天内的初一或十五
    for (let i = 1; i <= 30; i++) {
      // 设置为明天及之后的日期
      nextDate.setDate(today.getDate() + i);
      
      // 转换为农历
      const lunar = Lunar.fromDate(nextDate);
      const lunarDay = lunar.getDay();
      
      // 如果是初一或十五
      if (lunarDay === 1 || lunarDay === 15) {
        diffDays = i; // 距离今天的天数
        isFirstDay = lunarDay === 1; // 是否是初一
        break;
      }
    }
    
    // 如果找不到，默认设置为15天后
    if (diffDays === 0) {
      diffDays = 15;
    }
    
    return {
      diffDays,
      year: nextDate.getFullYear(),
      month: nextDate.getMonth() + 1,
      day: nextDate.getDate(),
      isFirstDay
    };
  } catch (error) {
    console.error('计算下一个法会日期出错:', error);
    // 返回默认值
    return {
      diffDays: 7,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: 15,
      isFirstDay: false
    };
  }
};

// 只使用ES模块导出语法
export {
  calculateLunarDate,
  getNextCeremonyDate,
  LUNAR_MONTHS,
  LUNAR_DAYS
}; 