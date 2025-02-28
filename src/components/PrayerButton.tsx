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
const generateRandomIP = (() => {
  // 缓存区域范围，避免每次重新创建
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
  
  // 计算总权重一次，避免重复计算
  const totalWeight = regions.reduce((sum, region) => sum + region.weight, 0);
  
  // 返回实际函数
  return () => {
    // 根据权重随机选择一个区域
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
})(); // 立即执行函数，缓存regions和totalWeight

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
  
  // 优化：分离模态框数据准备逻辑到单独的函数
  const prepareModalData = useCallback(() => {
    try {
      // 不使用requestIdleCallback，直接执行
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
      
      // 确保下一个法会日期数据正确设置
      try {
        const ceremonyData = getNextCeremonyDate();
        setNextCeremony({
          ...ceremonyData,
          success: true
        });
      } catch (error) {
        console.error('计算下一个法会日期出错:', error);
        // 设置一个默认值确保显示
        setNextCeremony({
          diffDays: 15, // 默认最多15天后有法会
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate() + 15,
          lunarMonth: 1, // 假设是正月
          lunarDay: 15, // 假设是十五
          solarDate: `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${(date.getDate()+15).toString().padStart(2, '0')}`,
          success: true
        });
      }
    } catch (error) {
      console.error('设置祈福数据出错:', error);
    }
  }, [stats, getRandomBlessingEffect]);
  
  // 优化：仅在模态框显示时才执行这些计算
  useEffect(() => {
    if (!isModalVisible) return;
    
    prepareModalData();
  }, [isModalVisible, prepareModalData]); // 依赖简化
  
  // 处理点击祈福按钮
  const handlePrayClick = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 生成随机IP地址，模拟全球用户
      const randomIP = generateRandomIP();
      
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
  }, [t, reloadStats, lunarDate]); // 添加依赖
  
  // 普通关闭（点击空白处或右上角X）- 不跳转
  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setIsSubmitting(false);
    setCopied(false);
  }, []);
  
  // 随喜功德按钮关闭 - 跳转到捐赠部分
  const handleMeritClose = useCallback(() => {
    // 首先关闭模态框
    setIsModalVisible(false);
    setIsSubmitting(false);
    setCopied(false);
    
    // 优化滚动逻辑，使用requestAnimationFrame代替setTimeout
    requestAnimationFrame(() => {
      try {
        const donationSection = document.getElementById('donation');
        if (donationSection) {
          // 平滑滚动到捐赠区域
          window.scrollTo({
            top: donationSection.offsetTop - 50, // 减去50px顶部间距
            behavior: 'smooth'
          });
          
          // 添加焦点，提高可访问性
          donationSection.focus({ preventScroll: true });
        } else {
          // 尝试使用备用方法滚动
          const donationElements = document.getElementsByClassName('donation-section');
          if (donationElements.length > 0) {
            const element = donationElements[0] as HTMLElement;
            window.scrollTo({
              top: element.offsetTop - 50,
              behavior: 'smooth'
            });
          }
        }
      } catch (error) {
        console.error('滚动到捐赠部分失败:', error);
      }
    });
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
    // 确保nextCeremony有数据，即使在加载中也要提供一个有意义的消息
    if (!nextCeremony) {
      return '寺庙每月农历初一、十五举行祈福法会，您的祈愿将在最近的法会中得到加持。';
    }

    try {
      // 获取当前农历日期 - 只在需要时计算
      const today = new Date();
      const solar = Solar.fromDate(today);
      const lunar = solar.getLunar();
      const currentDay = lunar.getDay();
      
      // 检查今天是否是法会日
      const isTodayCeremony = currentDay === 1 || currentDay === 15;
      
      // 正确获取农历月份名称和日期名称 - 提前计算并缓存
      const lunarMonth = LUNAR_MONTHS[(lunar.getMonth() - 1) % 12]; 
      const nextCeremonyMonth = LUNAR_MONTHS[(nextCeremony.lunarMonth - 1) % 12] || lunarMonth;
      
      // 确保使用正确的农历日名称
      const lunarDay = currentDay === 1 ? '初一' : (currentDay === 15 ? '十五' : '');
      const nextCeremonyDay = nextCeremony.lunarDay === 1 ? '初一' : '十五';
      
      // 格式化日期参数
      const daysAway = nextCeremony.diffDays || 0;
      
      let resultText = '';
      
      // 使用单个函数来格式化日期，避免重复计算
      const formatDate = (dateObj: Date): string => {
        return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
      };
      
      if (isTodayCeremony) {
        // 今天是法会日
        resultText = `今天（${formatDate(today)}）是农历${lunarMonth}${lunarDay}，是寺庙举行盛大法会的吉祥日！108位高僧大德将为您诵经持咒，增福延寿，消灾免难。您的祈福功德将在本日法会中得到最大加持！`;
      } else if (daysAway === 0) {
        // 今天是法会日（根据计算）
        resultText = `今天（${formatDate(today)}）是农历${nextCeremonyMonth}${nextCeremonyDay}，是寺庙举行盛大法会的吉祥日！108位高僧大德将为您诵经持咒，增福延寿，消灾免难。您的祈福功德将在本日法会中得到最大加持！`;
      } else if (daysAway === 1) {
        // 明天是法会日
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        resultText = `明天（${formatDate(tomorrow)}）是农历${nextCeremonyMonth}${nextCeremonyDay}，寺庙将举行盛大法会！届时，108位高僧大德将为您诵经持咒，增福延寿，消灾免难。您今日的祈福功德将在明日法会中得到最大加持！`;
      } else if (daysAway === 2) {
        // 后天是法会日
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);
        resultText = `后天（${formatDate(dayAfter)}）是农历${nextCeremonyMonth}${nextCeremonyDay}，寺庙将举行盛大法会！届时，108位高僧大德将为您诵经持咒，增福延寿，消灾免难。您今日的祈福功德将在法会中得到最大加持！`;
      } else {
        // 其他情况，显示下一个法会日期
        // 计算下一个法会日期
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysAway);
        
        resultText = `下一次寺庙的盛大祈福法会将在${daysAway}天后（公历${formatDate(nextDate)}，农历${nextCeremonyMonth}${nextCeremonyDay}）隆重举行。届时，108位高僧大德将诵读经文为您祈福。您今日所做功德将在法会中得到加持，消灾免难，福慧增长，一切善愿，皆如无尽灯，相续不断。`;
      }
      
      return resultText;
    } catch (error) {
      console.error('生成法会日期文本出错:', error);
      return '寺庙每月农历初一、十五举行祈福法会，您的祈福功德将在最近的法会中得到加持。108位高僧大德将为您和您的家人诵经持咒，增福延寿，消灾免难。';
    }
  }, [nextCeremony]);
  
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
        title={t('prayer.success.title')}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        className="prayer-success-modal"
        destroyOnClose={true}
      >
        <div className="success-content">
          <div className="temple-image">
            <img src="/images/incense.png" alt={t('temple.image2Alt')} className="buddha-image" />
          </div>
          <div className="success-message">
            {t('prayer.congratulations')}
          </div>
          <p className="blessing-description">{t('prayer.success.description')}</p>
          <div className="prayer-achievement">
            <div className="prayer-rank">
              {t('prayer.prayerRank', { rank: prayerRank })}
            </div>
            <div className="prayer-id">
              {/* 调试信息 */}
              <div style={{ display: 'none' }}>
                {`Debug: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${prayerId}`}
              </div>
              {t('prayer.ceremony_id', { 
                year: new Date().getFullYear(), 
                month: String(new Date().getMonth() + 1).padStart(2, '0'), 
                day: String(new Date().getDate()).padStart(2, '0'), 
                id: prayerId 
              })}
            </div>
          </div>
          <div className="success-date">
            {nextCeremonyText || t('prayer.specialDays')}
            <p className="ceremony-note">{t('prayer.success.note')}</p>
            <p className="blessing-promise">
              {t('prayer.success.message2')}
            </p>
          </div>
          <div className="blessing-effect">
            {blessingEffect}
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