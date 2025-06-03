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

  // 转换图表数据格式
  const chartData = statsData?.chartData.flatMap(item => [
    { time: item.time, value: item.totalVisits, type: '总访问数' },
    { time: item.time, value: item.uniqueIPs, type: '独立IP数' }
  ]) || [];

  // 准备图表配置
  const chartConfig = {
    data: chartData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1500,
      },
    },
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top' as const,
      itemName: {
        style: {
          fill: '#666',
          fontSize: 12,
        },
      },
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
      crosshairs: {
        type: 'x',
      },
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2,
      },
    },
    lineStyle: {
      lineWidth: 2,
    },
    theme: 'light',
    autoFit: true,
    renderer: 'canvas',
    meta: {
      value: {
        alias: '数量',
        min: 0,
      },
      time: {
        alias: '时间',
      },
    },
  };

  // 访问详情表格列定义
  const columns = [
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
    },
    {
      title: '访问时间',
      dataIndex: 'visit_time',
      key: 'visit_time',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '访问路径',
      dataIndex: 'url_path',
      key: 'url_path',
      width: 200,
    },
    {
      title: '用户代理',
      dataIndex: 'user_agent',
      key: 'user_agent',
      ellipsis: true,
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
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button icon={<DownloadOutlined />}>
              导出数据
            </Button>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="stats-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="总访问次数"
                value={statsData?.summary.totalVisits || 0}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="独立IP数"
                value={statsData?.summary.uniqueIPs || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="今日访问"
                value={statsData?.summary.todayVisits || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="增长率"
                value={statsData?.summary.growthRate || '0%'}
                valueStyle={{ 
                  color: statsData?.summary.growthRate?.startsWith('+') ? '#52c41a' : '#f5222d',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="访问趋势图" 
              bordered={false}
              extra={
                <Space>
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
                    一周
                  </Button>
                  <Button 
                    type={timeRange === '30d' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('30d')}
                  >
                    一月
                  </Button>
                  <Button 
                    type={timeRange === '365d' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleTimeRangeChange('365d')}
                  >
                    一年
                  </Button>
                </Space>
              }
            >
              <Line {...chartConfig} height={400} />
            </Card>
          </Col>
        </Row>

        {/* 访问详情表格 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="最近访问记录" bordered={false}>
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
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;