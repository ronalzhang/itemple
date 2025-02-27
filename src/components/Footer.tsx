import React from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import '../styles/Footer.scss';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <Space split={<Divider type="vertical" />}>
            <Link to="/about">{t('header.about')}</Link>
            <Link to="/contact">{t('header.contact')}</Link>
            <Link to="/">{t('header.donate')}</Link>
          </Space>
        </div>
        
        <div className="footer-legal">
          <Space split={<Divider type="vertical" />}>
            <span>{t('footer.rights').replace('2023', currentYear.toString())}</span>
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
          </Space>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 