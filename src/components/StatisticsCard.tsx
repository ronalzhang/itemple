import React, { useMemo } from 'react';
import { Card, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStatsContext } from '../contexts/StatsContext';
import '../styles/StatisticsCard.scss';

// 格式化大数字的函数
const formatLargeNumber = (num: number, locale: string): string => {
  if (num < 1000000) {
    return num.toString();
  }
  
  if (locale === 'zh') {
    if (num < 1000000000) {
      return (num / 10000).toFixed(1) + '万';
    } else {
      return (num / 100000000).toFixed(2) + '亿';
    }
  } else {
    if (num < 1000000000) {
      return (num / 1000).toFixed(1) + 'k';
    } else if (num < 1000000000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else {
      return (num / 1000000000).toFixed(1) + 'B';
    }
  }
};

const StatisticsCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { stats } = useStatsContext();
  const todayCount = stats?.todayCount || 0;
  const totalCount = stats?.totalCount || 0;
  
  // 获取当前语言
  const currentLocale = i18n.language;

  // 新的统计显示格式，数字使用span包裹以便样式区分
  const todayStatisticText = useMemo(() => (
    <>
      {t('stats.today')}
      <span className="number">{formatLargeNumber(todayCount, currentLocale)}</span>
      {t('stats.people')}
    </>
  ), [todayCount, t, currentLocale]);

  const totalStatisticText = useMemo(() => (
    <>
      {t('stats.total')}
      <span className="number">{formatLargeNumber(totalCount, currentLocale)}</span>
      {t('stats.people')}
    </>
  ), [totalCount, t, currentLocale]);

  return (
    <Card className="statistics-card">
      <h2 className="stats-title">{t('stats.title')}</h2>
      
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} className="stats-col">
          <div className="stat-item">
            <span className="stat-text">{todayStatisticText}</span>
          </div>
        </Col>
        <Col xs={24} sm={12} className="stats-col">
          <div className="stat-item">
            <span className="stat-text">{totalStatisticText}</span>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default StatisticsCard; 