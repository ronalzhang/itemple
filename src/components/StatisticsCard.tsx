import React, { useMemo } from 'react';
import { Card, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStatsContext } from '../contexts/StatsContext';
import '../styles/StatisticsCard.scss';

const StatisticsCard: React.FC = () => {
  const { t } = useTranslation();
  const { stats } = useStatsContext();
  const todayCount = stats?.todayCount || 0;
  const totalCount = stats?.totalCount || 0;

  // 新的统计显示格式，数字使用span包裹以便样式区分
  const todayStatisticText = useMemo(() => (
    <>
      {t('stats.today')}
      <span className="number">{todayCount}</span>
      {t('stats.people')}
    </>
  ), [todayCount, t]);

  const totalStatisticText = useMemo(() => (
    <>
      {t('stats.total')}
      <span className="number">{totalCount}</span>
      {t('stats.people')}
    </>
  ), [totalCount, t]);

  return (
    <Card className="statistics-card" bordered={false}>
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