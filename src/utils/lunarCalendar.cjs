const Lunar = require('lunar-javascript').Lunar;

/**
 * 计算日期对应的农历日期
 * @param {Date} date - 公历日期
 * @returns {string} - 农历日期字符串，例如："壬寅年三月十五"
 */
const calculateLunarDate = (date) => {
  try {
    // 确保传入的是日期对象
    const targetDate = date instanceof Date ? date : new Date(date);
    
    // 获取公历年月日
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    
    // 转换为农历
    const lunar = Lunar.fromDate(targetDate);
    
    // 获取农历年月日
    const lunarYear = lunar.getYearInChinese();
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    
    // 判断是否为节气或节日
    const term = lunar.getTerm();
    const festivals = lunar.getFestivals();
    
    // 返回农历日期字符串
    return `${lunarYear}年${lunarMonth}月${lunarDay}`;
  } catch (error) {
    console.error('计算农历日期出错:', error);
    return '';
  }
};

module.exports = {
  calculateLunarDate
}; 