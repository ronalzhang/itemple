import React, { useEffect } from 'react';
import { Layout, Card } from 'antd';
import BackgroundEffect from './BackgroundEffect';
import StatisticsCard from './StatisticsCard';
import StatisticsChart from './StatisticsChart';
import PrayerButton from './PrayerButton';
import TempleSection from './TempleSection';
import DonationSection from './DonationSection';
import { useStatsContext } from '../contexts/StatsContext';
import '../styles/Home.scss';
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

const Home: React.FC = () => {
  const { stats, reloadStats } = useStatsContext();
  const { t } = useTranslation();
  
  // 当组件加载时，只加载统计数据，不重置
  useEffect(() => {
    const loadData = async () => {
      console.log('Home组件 - 正在加载统计数据...');
      try {
        // 加载最新数据，但不再尝试重置
        await reloadStats();
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };
    
    loadData();
    
    // 每30秒刷新一次统计数据，确保UI上显示最新数据
    const refreshInterval = setInterval(() => {
      reloadStats().catch(err => console.error('自动刷新统计数据失败:', err));
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [reloadStats]); // 只依赖reloadStats
  
  return (
    <Layout className="home-layout">
      <BackgroundEffect />
      
      <Content className="main-content">
        <div className="full-page-container">
          {/* 1. 顶部标题及寺庙背景由 Header 组件提供，已在 App.tsx 中 */}
          
          {/* 2. 今日祈福人数 */}
          <section className="today-stats-section">
            <StatisticsCard 
              todayCount={stats.todayCount || 0} 
              totalCount={stats.totalCount || 0} 
            />
          </section>
          
          {/* 3. 祈福按钮 */}
          <section className="prayer-section">
            <PrayerButton />
          </section>
          
          {/* 4 & 5. 寺庙图片和介绍合并为一个整合组件 */}
          <section className="temple-section">
            <TempleSection />
          </section>
          
          {/* 6. 全球祈福人数分布图 */}
          <section className="global-stats-section">
            <h2 className="section-title">{t('stats.globalDistribution')}</h2>
            <Card className="stats-chart-card">
              <StatisticsChart data={stats.regions || []} />
            </Card>
          </section>
          
          {/* 7. 随缘捐赠 */}
          <section id="donation" className="donation-section">
            <DonationSection />
          </section>
        </div>
      </Content>
    </Layout>
  );
};

export default Home; 