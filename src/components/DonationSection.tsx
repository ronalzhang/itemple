import React, { useState, useEffect, memo } from 'react';
import { Card, message, Space, Tooltip, Typography, QRCode, Row, Col, Divider, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchDonationInfo } from '../services/api';
import '../styles/DonationSection.scss';

const { Paragraph, Text, Title } = Typography;

interface DonationInfo {
  btc: string;
  eth: string;
  usdt: string;
}

// 创建优化的QRCode组件，避免不必要渲染
const OptimizedQRCode = memo(({ value, size, color }: { value: string, size: number, color: string }) => (
  <QRCode value={value || '-'} size={size} color={color} errorLevel="M" />
));

// 创建优化的复制按钮组件
const CopyButton = memo(({ 
  text, 
  type, 
  isCopied, 
  onCopy 
}: { 
  text: string, 
  type: string, 
  isCopied: boolean, 
  onCopy: (text: string, type: string) => void 
}) => {
  const { t } = useTranslation();
  
  return (
    <Button 
      type="text" 
      className={`copy-button ${isCopied ? 'copied' : ''}`}
      icon={isCopied ? <CheckOutlined style={{ color: 'green' }} /> : <CopyOutlined />}
      onClick={(e) => {
        e.stopPropagation();
        onCopy(text, type);
      }}
    >
      {isCopied ? t('donate.copied') : t('donate.copy')}
    </Button>
  );
});

const DonationSection: React.FC = () => {
  const { t } = useTranslation();
  const [donationInfo, setDonationInfo] = useState<DonationInfo>({
    btc: '',
    eth: '',
    usdt: ''
  });
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadDonationInfo = async () => {
      try {
        // 延迟200ms加载，优先让其他重要内容加载完成
        await new Promise(resolve => setTimeout(resolve, 200));
        if (!isMounted) return;
        
        const response = await fetchDonationInfo();
        if (isMounted) {
          setDonationInfo(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load donation information:', err);
        // 如果API加载失败，使用模拟数据以便展示
        if (isMounted) {
          setDonationInfo({
            btc: 'bc1qwu2tv65mjqrp6rdxs6rrt7xak98vs7ulmyt99y',
            eth: '0xE6429B0cFe55c7c91325Ed8D026CE23c44691f8b',
            usdt: 'TNxcin7VcE2XvAjF44bqhunE1kQe4Mjhyp'
          });
          setError(t('donate.loadError'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadDonationInfo();
    
    return () => {
      isMounted = false;
    };
  }, [t]);
  
  const copyToClipboard = (text: string, type: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          message.success(t('donate.copied'));
          setCopiedAddress(text);
          setTimeout(() => setCopiedAddress(null), 3000); // 3秒后重置复制状态
        },
        () => {
          message.error(t('donate.copyFailed'));
        }
      );
    } else {
      // 兼容不支持clipboard API的浏览器
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          message.success(t('donate.copied'));
          setCopiedAddress(text);
          setTimeout(() => setCopiedAddress(null), 3000);
        } else {
          message.error(t('donate.copyFailed'));
        }
      } catch (err) {
        message.error(t('donate.copyFailed'));
      }
    }
  };
  
  return (
    <div className="donation-section">
      <div className="donation-container">
        <Title level={2} className="section-title">{t('donate.title')}</Title>
        
        <div className="donation-description">
          <p>{t('donate.description')}</p>
        </div>
        
        <Card className="donation-card" loading={loading} variant="borderless">
          {error && <div className="error-message">{error}</div>}
          
          <Title level={4} className="card-subtitle">{t('donate.methods')}</Title>
          <Divider className="decorative-divider" />
          
          <Row gutter={[24, 24]} className="crypto-container">
            <Col xs={24} md={8}>
              <div className="crypto-item">
                <div className="crypto-header">
                  <div className="crypto-icon btc-icon"></div>
                  <h3>Bitcoin (BTC)</h3>
                </div>
                
                <div className="crypto-content">
                  <div className="crypto-qrcode">
                    <OptimizedQRCode value={donationInfo.btc} size={150} color="#d4af37" />
                  </div>
                  
                  <div className="crypto-address-container">
                    <Tooltip title={t('donate.click')}>
                      <Paragraph 
                        className="crypto-address" 
                        onClick={() => copyToClipboard(donationInfo.btc, 'BTC')}
                      >
                        <Text ellipsis>{donationInfo.btc}</Text>
                        <CopyButton 
                          text={donationInfo.btc} 
                          type="BTC" 
                          isCopied={copiedAddress === donationInfo.btc} 
                          onCopy={copyToClipboard} 
                        />
                      </Paragraph>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="crypto-item">
                <div className="crypto-header">
                  <div className="crypto-icon eth-icon"></div>
                  <h3>Ethereum (ETH)</h3>
                </div>
                
                <div className="crypto-content">
                  <div className="crypto-qrcode">
                    <OptimizedQRCode value={donationInfo.eth} size={150} color="#627eea" />
                  </div>
                  
                  <div className="crypto-address-container">
                    <Tooltip title={t('donate.click')}>
                      <Paragraph 
                        className="crypto-address" 
                        onClick={() => copyToClipboard(donationInfo.eth, 'ETH')}
                      >
                        <Text ellipsis>{donationInfo.eth}</Text>
                        <CopyButton 
                          text={donationInfo.eth} 
                          type="ETH" 
                          isCopied={copiedAddress === donationInfo.eth} 
                          onCopy={copyToClipboard} 
                        />
                      </Paragraph>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="crypto-item">
                <div className="crypto-header">
                  <div className="crypto-icon usdt-icon"></div>
                  <h3>USDT(TRC20)</h3>
                </div>
                
                <div className="crypto-content">
                  <div className="crypto-qrcode">
                    <OptimizedQRCode value={donationInfo.usdt} size={150} color="#26a17b" />
                  </div>
                  
                  <div className="crypto-address-container">
                    <Tooltip title={t('donate.click')}>
                      <Paragraph 
                        className="crypto-address" 
                        onClick={() => copyToClipboard(donationInfo.usdt, 'USDT')}
                      >
                        <Text ellipsis>{donationInfo.usdt}</Text>
                        <CopyButton 
                          text={donationInfo.usdt} 
                          type="USDT" 
                          isCopied={copiedAddress === donationInfo.usdt} 
                          onCopy={copyToClipboard} 
                        />
                      </Paragraph>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="donation-note">
            <p>{t('donate.note')}</p>
            <p className="donation-thankyou">{t('donate.thankyou')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default memo(DonationSection); 