import React from 'react';
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { useTranslation } from 'react-i18next';
import './styles/App.scss';

// 页面
import Home from './components/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// 组件
import Header from './components/Header';
import Footer from './components/Footer';
// import BackgroundEffect from './components/BackgroundEffect';

// 上下文提供者
import { StatsProvider } from './contexts/StatsContext';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  // 当前只支持中文
  const currentLocale = zhCN;

  return (
    <ConfigProvider locale={currentLocale}>
      <StatsProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="app">
            {/* <BackgroundEffect /> */}
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </StatsProvider>
    </ConfigProvider>
  );
};

export default App;
