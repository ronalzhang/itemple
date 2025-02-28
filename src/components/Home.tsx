import React, { useEffect, lazy, Suspense } from 'react';
import { Layout, Card, Spin } from 'antd';
import StatisticsCard from './StatisticsCard';
import PrayerButton from './PrayerButton';
import { useStatsContext } from '../contexts/StatsContext';
import '../styles/Home.scss';
import { useTranslation } from 'react-i18next';

// 使用懒加载优化性能
const BackgroundEffect = lazy(() => import('./BackgroundEffect'));
const StatisticsChart = lazy(() => import('./StatisticsChart'));
const TempleSection = lazy(() => import('./TempleSection'));
const DonationSection = lazy(() => import('./DonationSection'));

const { Content } = Layout;

// 加载占位符
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
    <Spin size="large" />
  </div>
);

const Home: React.FC = () => {
  const { stats, reloadStats } = useStatsContext();
  const { t } = useTranslation();
  
  // 性能优化：减少刷新频率，从30秒改为60秒
  useEffect(() => {
    const loadData = async () => {
      try {
        // 只在数据为空时加载数据
        if (!stats.totalCount) {
          console.log('Home组件 - 正在加载统计数据...');
          await reloadStats();
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };
    
    loadData();
    
    // 增加刷新间隔时间，减少API调用频率
    const refreshInterval = setInterval(() => {
      reloadStats().catch(err => console.error('自动刷新统计数据失败:', err));
    }, 60000); // 从30秒改为60秒
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [reloadStats, stats.totalCount]); // 添加stats.totalCount作为依赖
  
  return (
    <Layout className="home-layout">
      <Suspense fallback={<div />}>
        <BackgroundEffect />
      </Suspense>
      
      <Content className="main-content">
        <div className="full-page-container">
          {/* 1. 顶部标题及寺庙背景由 Header 组件提供，已在 App.tsx 中 */}
          
          {/* 2. 今日祈福人数 */}
          <section className="today-stats-section">
            <StatisticsCard />
          </section>
          
          {/* 3. 祈福按钮 */}
          <section className="prayer-section">
            <PrayerButton />
          </section>
          
          {/* 4 & 5. 寺庙图片和介绍合并为一个整合组件 */}
          <section className="temple-section">
            <Suspense fallback={<LoadingFallback />}>
              <TempleSection />
            </Suspense>
          </section>
          
          {/* 6. 全球祈福人数分布图 */}
          <section className="global-stats-section">
            <h2 className="section-title">{t('stats.globalDistribution')}</h2>
            <Card className="stats-chart-card">
              <Suspense fallback={<LoadingFallback />}>
                <StatisticsChart data={stats.regions || []} />
              </Suspense>
            </Card>
          </section>
          
          {/* 7. 随缘捐赠 */}
          <section id="donation" className="donation-section">
            <Suspense fallback={<LoadingFallback />}>
              <DonationSection />
            </Suspense>
          </section>
        </div>
      </Content>
    </Layout>
  );
};

export default React.memo(Home); // 使用React.memo优化性能 