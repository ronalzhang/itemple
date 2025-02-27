import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Modal, message, Tag, Tooltip, Row, Col, Space, Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { recordPrayer } from '../services/api';
import { useStatsContext } from '../contexts/StatsContext';
// 恢复农历日期计算，但优化性能
import { getNextCeremonyDate, LUNAR_MONTHS, LUNAR_DAYS } from '../utils/lunarCalendar';
import { calculateLunarDate } from '../utils/lunarCalendar';
import { generateRandomBlessing } from '../utils/blessingGenerator';
import '../styles/PrayerButton.scss';
import { Solar } from 'lunar-javascript';
import dayjs from 'dayjs';

// 缓存祝福文案数组，避免多次重建
const BLESSING_EFFECTS = [
  "此次祈福将为您及家人消除三灾八难，增添福慧资粮，福德无量。",
  "您此次虔诚祈愿，将助您事业顺遂，财源广进，六时吉祥。",
  "今日一念心香，功德圆满，将护佑您及家人阖家安康，和睦美满。",
  "佛力加持，您及家人的心愿将得以实现，前途光明，万事如意。",
  "此次祈福之善举，将为您及全家化解困厄，增长智慧，心想事成。",
  "愿此份虔诚为您及家人带来健康平安，消灾免难，幸福长久。",
  "今日祈福善缘，将庇佑您全家老小，平安喜乐，福寿延绵。",
  "菩萨慈悲，保佑您及亲朋好友身体健康，家庭和睦，事业有成。",
  "佛光普照，为您及家人消除病痛灾厄，迎来吉祥如意，一生顺遂。",
  "此次祈福将为您合家带来财运亨通，家宅平安，子孙兴旺之福。",
  "佛祖保佑，让您与家人远离烦恼忧愁，得享身心健康，安乐自在。",
  "此善举功德无量，将为您及家眷带来福慧双增，平安喜乐的福报。",
  "今日祈福，观世音菩萨将保佑您及家人化险为夷，逢凶化吉，一帆风顺。",
  "愿佛光护佑您及家人，驱散阴霾，远离疾病，生活幸福美满。",
  "祈愿护法神为您和家人除障碍，增福增寿，顺心如意。",
  "愿菩萨护佑，您及家人身心康泰，百病不侵，延年益寿。"
];

// 生成随机IP地址，模拟来自不同地区的用户
const generateRandomIP = () => {
  // 根据不同地区生成不同范围的IP
  const regions = [
    // 亚洲IP段
    { min: [58, 0, 0, 0], max: [60, 255, 255, 255], weight: 50 },
    { min: [112, 0, 0, 0], max: [126, 255, 255, 255], weight: 50 },
    { min: [202, 0, 0, 0], max: [223, 255, 255, 255], weight: 40 },
    // 欧洲IP段
    { min: [62, 0, 0, 0], max: [95, 255, 255, 255], weight: 25 },
    { min: [176, 0, 0, 0], max: [185, 255, 255, 255], weight: 25 },
    // 美洲IP段
    { min: [13, 0, 0, 0], max: [50, 255, 255, 255], weight: 30 },
    { min: [63, 0, 0, 0], max: [76, 255, 255, 255], weight: 20 },
    // 其他地区
    { min: [41, 0, 0, 0], max: [42, 255, 255, 255], weight: 10 },
    { min: [197, 0, 0, 0], max: [201, 255, 255, 255], weight: 10 },
  ];
  
  // 根据权重随机选择一个区域
  const totalWeight = regions.reduce((sum, region) => sum + region.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  let selectedRegion;
  
  for (const region of regions) {
    randomWeight -= region.weight;
    if (randomWeight <= 0) {
      selectedRegion = region;
      break;
    }
  }
  
  if (!selectedRegion) {
    selectedRegion = regions[0]; // 默认选择第一个区域
  }
  
  // 在选定的区域范围内生成随机IP
  const ip = [];
  for (let i = 0; i < 4; i++) {
    const min = selectedRegion.min[i];
    const max = selectedRegion.max[i];
    ip[i] = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  return ip.join('.');
};

const PrayerButton: React.FC = () => {
  const { t } = useTranslation();
  const { reloadStats, stats } = useStatsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prayerId, setPrayerId] = useState('');
  const [prayerRank, setPrayerRank] = useState(0);
  const [copied, setCopied] = useState(false);
  const [blessingEffect, setBlessingEffect] = useState("");
  const [nextCeremony, setNextCeremony] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blessing, setBlessing] = useState('');
  
  // 使用useMemo预先计算日期，避免频繁计算
  const ceremonyDate = useMemo(() => {
    // 只有在需要时才计算（惰性初始化）
    try {
      return getNextCeremonyDate();
    } catch (err) {
      console.error('预加载法会日期出错:', err);
      return {
        diffDays: 7,
        year: 2024,
        month: 4,
        day: 15,
        isFirstDay: false
      };
    }
  }, []);
  
  // 同样对农历日期使用useMemo缓存
  const lunarDate = useMemo(() => {
    return calculateLunarDate();
  }, []); // 空依赖数组表示只计算一次
  
  // 简化祝福文案选择逻辑，减少不必要的状态更新
  const getRandomBlessingEffect = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * BLESSING_EFFECTS.length);
    return BLESSING_EFFECTS[randomIndex];
  }, []);
  
  // 优化：仅在模态框显示时才执行这些计算
  useEffect(() => {
    if (!isModalVisible) return;
    
    // 使用requestIdleCallback在浏览器空闲时执行
    // 如果不支持，则降级使用setTimeout
    const runIdleTask = window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1));
    
    const idleId = runIdleTask(() => {
      try {
        // 生成随机唯一ID (格式: 年月日-随机数)
        const date = new Date();
        const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setPrayerId(`${dateStr}-${randomNum}`);
        
        // 修正排名计算，确保不为0
        // 根据当前统计，加1表示用户是最新的祈福者
        const todayCount = stats?.todayCount || 0;
        setPrayerRank(todayCount + 1);
        
        // 优化随机文案生成 - 使用预定义的较少文案
        setBlessingEffect(getRandomBlessingEffect());
        
        // 使用预先计算的日期
        console.log('设置下一个法会日期:', ceremonyDate);
        setNextCeremony(ceremonyDate);
      } catch (error) {
        console.error('设置祈福数据出错:', error);
      }
    });
    
    return () => {
      // 如果支持cancelIdleCallback，则在清理时取消
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId as any);
      } else {
        clearTimeout(idleId as any);
      }
    };
  }, [isModalVisible, stats, getRandomBlessingEffect, ceremonyDate]);
  
  // 处理点击祈福按钮
  const handlePrayClick = async () => {
    try {
      setIsLoading(true);
      
      // 生成随机IP地址，模拟全球用户
      const randomIP = generateRandomIP();
      console.log('用户IP (模拟):', randomIP);
      
      // 调用祈福API，传入随机IP
      const response = await recordPrayer(randomIP);
      
      // 如果祈福成功
      if (response && response.success) {
        // 生成随机祝福语
        const newBlessing = generateRandomBlessing(lunarDate);
        setBlessing(newBlessing);
        
        // 显示祝福弹窗
        setIsModalVisible(true);
        
        // 重新加载统计数据，确保UI更新
        reloadStats();
        
        message.success(t('prayer.successMessage'));
      } else {
        message.error(t('prayer.failureMessage'));
      }
    } catch (error) {
      console.error('祈福失败:', error);
      message.error(t('prayer.failureMessage'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // 普通关闭（点击空白处或右上角X）- 不跳转
  const handleModalClose = useCallback(() => {
    console.log('普通关闭模态框 - 不导航到捐赠部分');
    setIsModalVisible(false);
    setIsSubmitting(false);
    setCopied(false);
  }, []);
  
  // 随喜功德按钮关闭 - 跳转到捐赠部分
  const handleMeritClose = useCallback(() => {
    // 首先关闭模态框
    console.log('随喜功德按钮点击 - 准备关闭模态框并导航');
    setIsModalVisible(false);
    setIsSubmitting(false);
    setCopied(false);
    
    // 延迟执行滚动，确保模态框完全关闭
    setTimeout(() => {
      try {
        console.log('开始查找和滚动到#donation元素');
        const donationSection = document.getElementById('donation');
        if (donationSection) {
          console.log('找到#donation元素，开始滚动');
          // 平滑滚动到捐赠区域
          window.scrollTo({
            top: donationSection.offsetTop - 50, // 减去50px顶部间距
            behavior: 'smooth'
          });
          
          // 添加焦点，提高可访问性
          donationSection.focus({ preventScroll: true });
          console.log('滚动和焦点设置完成');
        } else {
          console.warn('未找到捐赠部分元素(#donation)');
          // 尝试使用备用方法滚动
          const donationElements = document.getElementsByClassName('donation-section');
          if (donationElements.length > 0) {
            console.log('使用className=donation-section作为备用');
            const element = donationElements[0] as HTMLElement;
            window.scrollTo({
              top: element.offsetTop - 50,
              behavior: 'smooth'
            });
          } else {
            console.error('无法找到任何捐赠相关元素');
          }
        }
      } catch (error) {
        console.error('滚动到捐赠部分失败:', error);
      }
    }, 300); // 添加300ms延迟，确保模态框完全关闭
  }, []);

  // 优化复制功能
  const copyPrayerInfo = useCallback(() => {
    try {
      const shareText = t('prayer.shareText', { 
        id: prayerId, 
        rank: prayerRank,
        date: new Date().toLocaleDateString('zh-CN')
      });
      
      // 使用异步API时进行错误处理
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setCopied(true);
          message.success(t('prayer.copySuccess') || '复制成功');
          // 使用 requestAnimationFrame 代替 setTimeout
          let timeoutId: number;
          const resetCopied = () => {
            setCopied(false);
            cancelAnimationFrame(timeoutId);
          };
          timeoutId = requestAnimationFrame(() => {
            setTimeout(resetCopied, 3000);
          });
        })
        .catch((error) => {
          console.error('复制失败:', error);
          message.error(t('prayer.copyFailed') || '复制失败');
        });
    } catch (error) {
      console.error('准备复制文本失败:', error);
      message.error('复制失败');
    }
  }, [prayerId, prayerRank, t]);
  
  // 优化日期文本生成 - 使用memo缓存结果
  const nextCeremonyText = useMemo(() => {
    if (isSubmitting || !nextCeremony || !nextCeremony.success) {
      console.log('提前返回，不生成文本，原因:', { isSubmitting, nextCeremony });
      return '';
    }

    try {
      // 获取当前农历日期
      const today = new Date();
      const solar = Solar.fromDate(today);
      const lunar = solar.getLunar();
      const currentDay = lunar.getDay();
      
      // 检查今天是否是法会日
      const isTodayCeremony = currentDay === 1 || currentDay === 15;
      
      console.log('当前农历日期:', lunar.getYear(), '年', lunar.getMonth(), '月', lunar.getDay(), '日');
      console.log('下一个法会信息:', nextCeremony);
      console.log('今天是法会日？', isTodayCeremony ? '是' : '否');
      
      // 正确获取农历月份名称和日期名称
      const lunarMonth = LUNAR_MONTHS[(nextCeremony.lunarMonth - 1) % 12] || LUNAR_MONTHS[(nextCeremony.month - 1) % 12];
      // 确保使用正确的农历日名称
      const lunarDay = nextCeremony.lunarDay === 1 ? '初一' : '十五';
      const dayType = nextCeremony.lunarDay === 1 ? t('prayer.dayType.firstDay') : t('prayer.dayType.fifteenthDay');
      
      console.log('农历月日:', { lunarMonth, lunarDay, originalMonth: nextCeremony.lunarMonth || nextCeremony.month });
      
      // 格式化日期参数
      const dateParts = nextCeremony.solarDate ? nextCeremony.solarDate.split('-') : [];
      const year = dateParts.length > 0 ? dateParts[0] : new Date().getFullYear();
      const month = dateParts.length > 1 ? dateParts[1] : (new Date().getMonth() + 1);
      const day = dateParts.length > 2 ? dateParts[2] : new Date().getDate();
      const daysAway = nextCeremony.diffDays;
      
      console.log('格式化的日期参数:', {
        year, month, day, lunarMonth, lunarDay, dayType, daysAway
      });
      
      let resultText = '';
      
      if (isTodayCeremony) {
        console.log('生成今天是法会日的文本');
        // 今天是法会日
        resultText = t('prayer.success.today_ceremony', {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
          lunarMonth: LUNAR_MONTHS[lunar.getMonth() - 1],
          lunarDay: lunar.getDay() === 1 ? '初一' : '十五',
        });
        console.log('使用翻译键:', 'prayer.success.today_ceremony');
      } else if (nextCeremony.diffDays === 0) {
        console.log('生成今天是法会日（根据计算结果）的文本');
        // 今天是法会日
        resultText = t('prayer.success.today_ceremony', {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
          lunarMonth: lunarMonth,
          lunarDay: lunarDay,
        });
        
        if (!resultText || resultText.includes('法会日（农历')) {
          // 手动构建今天是法会日的文本
          resultText = `今天（${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日）是法会日（农历${lunarMonth}${lunarDay}）！`;
        }
        
        console.log('使用翻译键:', 'prayer.success.today_ceremony', '生成文本:', resultText);
      } else if (nextCeremony.diffDays === 1) {
        console.log('生成明天是法会日的文本');
        // 明天是法会日
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        resultText = t('prayer.success.tomorrow_ceremony', {
          year: tomorrow.getFullYear(),
          month: tomorrow.getMonth() + 1,
          day: tomorrow.getDate(),
          lunarMonth: lunarMonth,
          lunarDay: lunarDay,
        });
        
        if (!resultText || resultText.includes('法会日（农历')) {
          // 手动构建明天是法会日的文本
          resultText = `明天（${tomorrow.getFullYear()}年${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日）是法会日（农历${lunarMonth}${lunarDay}）！`;
        }
        
        console.log('使用翻译键:', 'prayer.success.tomorrow_ceremony', '生成文本:', resultText);
      } else if (nextCeremony.diffDays === 2) {
        console.log('生成后天是法会日的文本');
        // 后天是法会日
        const dayAfter = new Date();
        dayAfter.setDate(today.getDate() + 2);
        resultText = t('prayer.success.dayafter_ceremony', {
          year: dayAfter.getFullYear(),
          month: dayAfter.getMonth() + 1,
          day: dayAfter.getDate(),
          lunarMonth: lunarMonth,
          lunarDay: lunarDay,
        });
        
        if (!resultText || resultText.includes('法会日（农历')) {
          // 手动构建后天是法会日的文本
          resultText = `后天（${dayAfter.getFullYear()}年${dayAfter.getMonth() + 1}月${dayAfter.getDate()}日）是法会日（农历${lunarMonth}${lunarDay}）！`;
        }
        
        console.log('使用翻译键:', 'prayer.success.dayafter_ceremony', '生成文本:', resultText);
      } else {
        console.log('生成下一个法会日期的文本');
        // 其他情况，显示下一个法会日期
        resultText = t('prayer.nextCeremony', {
          year,
          month,
          day,
          lunarMonth,
          lunarDay,
          days: daysAway,
          dayType
        });
        
        // 修复：检查和处理天数显示异常的情况（如空值）
        if (!resultText || resultText.includes('天后（')) {
          console.log('检测到天数显示异常，尝试修复');
          // 确保将 {{days}} 替换为实际天数
          const daysText = daysAway ? `${daysAway}` : '未知';
          // 手动构建文本，确保日期格式正确
          resultText = `下一次大喇嘛仁波切的「祈愿法会」将在${daysText}天后（公历${year}年${month}月${day}日，农历${lunarMonth}${lunarDay}）隆重举行。届时，108位喇嘛将诵读《甘珠尔》经文为您祈福。`;
        }
        
        console.log('使用翻译键:', 'prayer.nextCeremony', '生成文本:', resultText);
      }
      
      console.log('生成的文本:', resultText);
      return resultText;
    } catch (error) {
      console.error('生成法会日期文本出错：', error);
      return t('prayer.success.error');
    }
  }, [isSubmitting, nextCeremony, t]);
  
  // 使用React.memo优化渲染性能
  return (
    <div className="prayer-button-container">
      <div className="lunar-date-display">
        {t('language.zh') === '中文' ? t('common.lunarDate', { date: lunarDate }) : ''}
      </div>
      
      <Button 
        type="primary" 
        size="large"
        loading={isLoading}
        onClick={handlePrayClick}
        className="prayer-button"
      >
        {t('prayer.buttonText')}
      </Button>
      
      <div className="prayer-explanation">
        {t('prayer.explanation')}
      </div>
      
      <Modal
        title={t('prayer.blessingTitle')}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        className="blessing-modal"
      >
        <div className="blessing-content">
          <div className="temple-image">
            <img src="/images/incense.png" alt={t('temple.image2Alt')} className="buddha-image" />
          </div>
          <div className="success-message">
            {t('prayer.congratulations')}
          </div>
          <p>{blessing}</p>
          <div className="prayer-achievement">
            <div className="prayer-rank">
              {t('prayer.prayerRank', { rank: prayerRank })}
            </div>
            <div className="prayer-id">
              {t('prayer.prayerId', { id: prayerId })}
            </div>
          </div>
          <div className="success-date">
            {nextCeremonyText}
            <p className="ceremony-note">{t('prayer.success.specialDays')}</p>
          </div>
          <div className="merit-button-container">
            <Button key="merit" type="primary" onClick={handleMeritClose} className="merit-button">
              {t('prayer.success.close')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 使用React.memo减少不必要的重渲染
export default React.memo(PrayerButton); 