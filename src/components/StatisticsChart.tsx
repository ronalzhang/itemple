import React, { useMemo } from 'react';
import { Card, Progress, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import '../styles/StatisticsChart.scss';

interface RegionData {
  name: string;
  value: number;
}

interface StatisticsChartProps {
  data: RegionData[];
}

// 为每个区域预定义颜色，避免重新计算
const REGION_COLORS = ['#ff7875', '#52c41a', '#1890ff', '#722ed1'];

// 使用React.memo避免不必要的重渲染
const StatisticsChart: React.FC<StatisticsChartProps> = React.memo(({ data }) => {
  const { t } = useTranslation();
  
  // 使用useMemo缓存计算结果，避免每次渲染都重新计算
  const { total, processedData } = useMemo(() => {
    // 确保我们有数据
    if (!data || data.length === 0) {
      return { total: 0, processedData: [] };
    }
    
    // 计算总数以确定百分比
    const calculatedTotal = data.reduce((sum, item) => sum + item.value, 0);
    
    // 预处理数据，计算百分比
    const processed = data.map((item, index) => {
      const percent = calculatedTotal > 0 
        ? Math.round((item.value / calculatedTotal) * 100) 
        : 0;
        
      return {
        ...item,
        percent,
        color: REGION_COLORS[index % REGION_COLORS.length]
      };
    });
    
    return { total: calculatedTotal, processedData: processed };
  }, [data]); // 只有当data改变时才重新计算
  
  // 如果没有数据，显示无数据状态
  if (!data || data.length === 0) {
    return (
      <div className="statistics-chart">
        <Card title={t('stats.globalDistribution')}>
          <div className="chart-container">
            <div className="chart-placeholder">
              <p>{t('stats.noData')}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="statistics-chart">
      <Card title={t('stats.globalDistribution')}>
        <div className="chart-container">
          <div className="chart-placeholder">
            {processedData.map((item, index) => (
              <ChartItem 
                key={`${item.name}-${index}`} 
                name={item.name}
                value={item.value}
                percent={item.percent}
                color={item.color}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
});

// 抽取为单独的组件，使用React.memo优化性能
const ChartItem = React.memo(({ 
  name, 
  value, 
  percent, 
  color 
}: { 
  name: string; 
  value: number; 
  percent: number; 
  color: string; 
}) => {
  const { t } = useTranslation();
  
  // 将区域名称映射到翻译键
  const getRegionTranslationKey = (regionName: string) => {
    const regionMap: Record<string, string> = {
      'asia': 'stats.asia',
      'europe': 'stats.europe',
      'america': 'stats.america',
      'others': 'stats.others'
    };
    
    return regionMap[regionName] || regionName;
  };
  
  return (
    <div className="data-item">
      <Row align="middle" style={{ width: '100%' }}>
        <Col span={8}>
          <span className="region-name">{t(getRegionTranslationKey(name))}</span>
        </Col>
        <Col span={12}>
          <Progress 
            percent={percent} 
            showInfo={false} 
            strokeColor={color}
            size="small"
          />
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          <span className="region-value">{value}</span>
        </Col>
      </Row>
    </div>
  );
});

// 添加displayName提高调试体验
StatisticsChart.displayName = 'StatisticsChart';
ChartItem.displayName = 'ChartItem';

export default StatisticsChart; 