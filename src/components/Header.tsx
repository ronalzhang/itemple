import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Header.scss';

const { Title } = Typography;

const Header: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <header className="site-header">
      <div className="header-background">
        <div className="header-content">
          <Title level={1}>{t('site.title')}</Title>
          <p className="site-motto">{t('site.motto')}</p>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header; 