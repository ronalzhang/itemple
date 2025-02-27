import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import '../styles/LanguageSwitcher.scss';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div className="language-switcher">
      <Space>
        <GlobalOutlined />
        <Button 
          type={i18n.language === 'zh' ? 'primary' : 'default'} 
          size="small"
          onClick={() => changeLanguage('zh')}
        >
          {t('language.zh')}
        </Button>
        <Button 
          type={i18n.language === 'en' ? 'primary' : 'default'} 
          size="small"
          onClick={() => changeLanguage('en')}
        >
          {t('language.en')}
        </Button>
      </Space>
    </div>
  );
};

export default LanguageSwitcher; 