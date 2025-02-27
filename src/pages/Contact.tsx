import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Row, Col, Form, Input, Button, Card, Space, Divider } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import '../styles/Contact.scss';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Received values:', values);
    // 实际应用中这里会发送表单数据到服务器
    // 暂时显示成功消息并重置表单
    form.resetFields();
  };

  return (
    <div className="contact-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={24}>
          <Title level={2} className="page-title">
            {t('contact.title')}
          </Title>
          <Divider className="sacred-divider" />
        </Col>
        
        <Col xs={24} md={12}>
          <Card className="contact-card" variant="borderless">
            <Title level={3} className="card-title">
              {t('contact.form.title')}
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="contact-form"
            >
              <Form.Item
                name="name"
                label={t('contact.form.name')}
                rules={[{ required: true, message: t('contact.form.nameRequired') }]}
              >
                <Input placeholder={t('contact.form.namePlaceholder')} />
              </Form.Item>
              
              <Form.Item
                name="email"
                label={t('contact.form.email')}
                rules={[
                  { required: true, message: t('contact.form.emailRequired') },
                  { type: 'email', message: t('contact.form.emailInvalid') }
                ]}
              >
                <Input placeholder={t('contact.form.emailPlaceholder')} />
              </Form.Item>
              
              <Form.Item
                name="message"
                label={t('contact.form.message')}
                rules={[{ required: true, message: t('contact.form.messageRequired') }]}
              >
                <TextArea
                  rows={4}
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" className="submit-button">
                  {t('contact.form.submit')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card className="contact-card info-card" variant="borderless">
            <Title level={3} className="card-title">
              {t('contact.info.title')}
            </Title>
            
            <Space direction="vertical" size="large" className="contact-info">
              <div className="info-item">
                <EnvironmentOutlined className="info-icon" />
                <div>
                  <Title level={5}>{t('contact.info.address.title')}</Title>
                  <Paragraph>{t('contact.info.address.content')}</Paragraph>
                </div>
              </div>
              
              <div className="info-item">
                <PhoneOutlined className="info-icon" />
                <div>
                  <Title level={5}>{t('contact.info.phone.title')}</Title>
                  <Paragraph>{t('contact.info.phone.content')}</Paragraph>
                </div>
              </div>
              
              <div className="info-item">
                <MailOutlined className="info-icon" />
                <div>
                  <Title level={5}>{t('contact.info.email.title')}</Title>
                  <Paragraph>{t('contact.info.email.content')}</Paragraph>
                </div>
              </div>
            </Space>
            
            <div className="visit-hours">
              <Title level={4}>{t('contact.info.hours.title')}</Title>
              <Paragraph>{t('contact.info.hours.content')}</Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Contact; 