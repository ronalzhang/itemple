import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Row, Col, Card, Space, Divider } from 'antd';
import { GlobalOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import '../styles/About.scss';

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={24}>
          <Title level={2} className="page-title">
            {t('about.title')}
          </Title>
          <Divider className="sacred-divider" />
        </Col>
        
        <Col xs={24} md={12}>
          <Card className="about-card" variant="borderless">
            <Space direction="vertical" size="large">
              <div className="icon-title">
                <HistoryOutlined className="about-icon" />
                <Title level={3}>{t('about.history.title')}</Title>
              </div>
              <Paragraph className="about-text">
                {t('about.history.content')}
              </Paragraph>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card className="about-card" variant="borderless">
            <Space direction="vertical" size="large">
              <div className="icon-title">
                <HeartOutlined className="about-icon" />
                <Title level={3}>{t('about.mission.title')}</Title>
              </div>
              <Paragraph className="about-text">
                {t('about.mission.content')}
              </Paragraph>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card className="about-card" variant="borderless">
            <Space direction="vertical" size="large">
              <div className="icon-title">
                <GlobalOutlined className="about-icon" />
                <Title level={3}>{t('about.community.title')}</Title>
              </div>
              <Paragraph className="about-text">
                {t('about.community.content')}
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default About; 