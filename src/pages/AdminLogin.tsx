import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { WalletOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminLogin.scss';

const { Title, Text } = Typography;

interface LoginForm {
  walletAddress: string;
}

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/admin/api/auth/verify', {
        walletAddress: values.walletAddress
      });

      if (response.data.success) {
        // 保存认证信息到localStorage
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('admin_wallet', response.data.data.wallet);
        
        message.success('登录成功！正在跳转到后台管理...');
        
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('登录失败，请检查网络连接或稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>
      
      <div className="login-container">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <WalletOutlined className="login-icon" />
            <Title level={2}>后台管理系统</Title>
            <Text type="secondary">使用 SOLANA 钱包地址登录</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="钱包地址"
              name="walletAddress"
              rules={[
                { required: true, message: '请输入您的SOLANA钱包地址' },
                { 
                  pattern: /^[A-Za-z0-9]{32,44}$/, 
                  message: '请输入有效的SOLANA钱包地址' 
                }
              ]}
            >
              <Input
                prefix={<WalletOutlined />}
                placeholder="请输入SOLANA钱包地址"
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<LoginOutlined />}
              >
                {loading ? '验证中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Space direction="vertical" align="center">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                仅授权钱包地址可访问后台管理
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                管理员地址：6UrwhN2rqQvo2tBfc9FZCdUbt9JLs3BJiEm7pv4NM41b
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin; 