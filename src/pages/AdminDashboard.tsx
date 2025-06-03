import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, DatePicker, 
  Select, Table, message, Space, Typography, Spin 
} from 'antd';
import { 
  BarChartOutlined, EyeOutlined, UserOutlined, 
  RiseOutlined, ReloadOutlined, LogoutOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import '../styles/AdminDashboard.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface StatsData {
  summary: {
    totalVisits: number;
    uniqueIPs: number;
    todayVisits: number;
    todayUniqueIPs: number;
    growthRate: string;
  };
  chartData: Array<{
    time: string;
    totalVisits: number;
    uniqueIPs: number;
  }>;
  timeFormat: string;
}

interface VisitDetail {
  id: number;
  ip_address: string;
  user_agent: string;
  visit_time: string;
  url_path: string;
}

const AdminDashboard: React.FC = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [visitDetails, setVisitDetails] = useState<VisitDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const navigate = useNavigate();

  // 获取认证header
  const getAuthHeaders = () => {
    const wallet = localStorage.getItem('admin_wallet');
    return wallet ? { 'x-wallet-address': wallet } : {};
  };

  // 检查登录状态
  const checkAuth = () => {
    const wallet = localStorage.getItem('admin_wallet');
    if (!wallet) {
      message.error('未登录或登录已过期');
      navigate('/admin/login');
      return false;
    }
    return true;
  };

  // 获取统计数据
  const fetchStats = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const params: any = { timeRange };
      
      if (timeRange === 'custom' && customDateRange) {
        params.startDate = customDateRange[0].format('YYYY-MM-DD');
        params.endDate = customDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.get('/admin/api/stats/visits', {
        params,
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('认证失败，请重新登录');
        handleLogout();
      } else {
        message.error('获取统计数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取访问详情
  const fetchVisitDetails = async (page = 1) => {
    if (!checkAuth()) return;
    
    setDetailsLoading(true);
    try {
      const response = await axios.get('/admin/api/visits', {
        params: { page, limit: 20 },
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setVisitDetails(response.data.data.visits);
      }
    } catch (error: any) {
      console.error('获取访问详情失败:', error);
      message.error('获取访问详情失败');
    } finally {
      setDetailsLoading(false);
    }
  };

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_wallet');
    navigate('/admin/login');
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchStats();
    fetchVisitDetails();
  };

  // 时间范围改变
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    if (value !== 'custom') {
      setCustomDateRange(null);
    }
  };

  // 自定义日期范围改变
  const handleDateRangeChange = (dates: any) => {
    setCustomDateRange(dates);
    if (dates) {
      setTimeRange('custom');
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchStats();
    fetchVisitDetails();
  }, [timeRange]);

  // 当自定义日期范围改变时，重新获取数据
  useEffect(() => {
    if (timeRange === 'custom' && customDateRange) {
      fetchStats();
    }
  }, [customDateRange]);

  // 准备图表数据 - 简化版本
  const chartData = React.useMemo(() => {
    if (!statsData?.chartData) return [];
    
    const data: any[] = [];
    statsData.chartData.forEach(item => {
      data.push({
        time: item.time,
        value: item.totalVisits,
        type: '访问次数'
      });
      data.push({
        time: item.time,
        value: item.uniqueIPs,
        type: '独立IP'
      });
    });
    return data;
  }, [statsData]);

  // 访问详情表格列定义 - 简化版本
  const columns = [
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
    },
    {
      title: '时间',
      dataIndex: 'visit_time',
      key: 'visit_time',
      width: 120,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '路径',
      dataIndex: 'url_path',
      key: 'url_path',
      width: 150,
      ellipsis: true,
      render: (path: string) => (
        <span title={path}>
          {path.length > 15 ? `${path.substring(0, 15)}...` : path}
        </span>
      ),
    },
    {
      title: '浏览器',
      dataIndex: 'user_agent',
      key: 'user_agent',
      width: 100,
      render: (agent: string) => {
        if (agent.includes('Mobile')) return '移动端';
        if (agent.includes('Chrome')) return 'Chrome';
        if (agent.includes('Safari')) return 'Safari';
        if (agent.includes('Firefox')) return 'Firefox';
        if (agent.includes('Edge')) return 'Edge';
        return '其他';
      },
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* 头部 */}
      <div className="dashboard-header">
        <div className="header-left">
          <Title level={2}>网站访问统计</Title>
        </div>
        <div className="header-right">
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
              刷新
            </Button>
            <Button icon={<DownloadOutlined />} size="small">
              导出数据
            </Button>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} size="small">
              退出
            </Button>
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="stats-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="总访问次数"
                value={statsData?.summary.totalVisits || 0}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="独立IP数"
                value={statsData?.summary.uniqueIPs || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="今日访问"
                value={statsData?.summary.todayVisits || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="增长率"
                value={statsData?.summary.growthRate || '0%'}
                valueStyle={{ 
                  color: statsData?.summary.growthRate?.startsWith('+') ? '#52c41a' : '#f5222d',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* 访问趋势图表 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card 
              title="访问趋势图表"
              bordered={false}
              className="chart-card"
              extra={
                <Space wrap>
                  <Button 
                    type={timeRange === '24h' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('24h')}
                  >
                    24小时
                  </Button>
                  <Button 
                    type={timeRange === '7d' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('7d')}
                  >
                    7天
                  </Button>
                  <Button 
                    type={timeRange === '30d' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('30d')}
                  >
                    30天
                  </Button>
                  <Button 
                    type={timeRange === '365d' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('365d')}
                  >
                    全年
                  </Button>
                </Space>
              }
            >
              <div style={{ height: '400px', width: '100%' }}>
                {chartData && chartData.length > 0 ? (
                  <Line
                    data={chartData}
                    xField="time"
                    yField="value"
                    seriesField="type"
                    height={360}
                    color={['#1890ff', '#52c41a']}
                    smooth={true}
                    point={{
                      size: 4,
                    }}
                    legend={{
                      position: 'top'
                    }}
                    tooltip={{
                      showMarkers: true,
                    }}
                    xAxis={{
                      label: {
                        autoRotate: false,
                      },
                    }}
                    yAxis={{
                      min: 0,
                    }}
                  />
                ) : (
                  <div style={{ 
                    height: '360px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无图表数据</div>
                      <div style={{ fontSize: '12px' }}>请点击刷新按钮重新加载</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 访问详情表格 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="访问明细数据" bordered={false} className="details-card">
              <div className="table-container">
                <Table
                  columns={columns}
                  dataSource={visitDetails}
                  loading={detailsLoading}
                  rowKey="id"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  }}
                  scroll={{ x: 500, y: 400 }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;