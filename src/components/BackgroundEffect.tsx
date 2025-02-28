import React, { useState, useEffect } from 'react';
import '../styles/BackgroundEffect.scss';

const BackgroundEffect: React.FC = () => {
  // 使用状态跟踪是否应该渲染粒子效果
  const [shouldRenderParticles, setShouldRenderParticles] = useState(true);
  
  // 检测设备性能，在低性能设备上禁用粒子效果
  useEffect(() => {
    // 简单的性能检测
    const checkPerformance = () => {
      // 检查是否是移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // 如果是移动设备或窗口较小，禁用粒子效果
      if (isMobile || window.innerWidth < 768) {
        setShouldRenderParticles(false);
      }
    };
    
    checkPerformance();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkPerformance);
    
    return () => {
      window.removeEventListener('resize', checkPerformance);
    };
  }, []);
  
  return (
    <div className="background-effect">
      <div className="temple-bg"></div>
      <div className="overlay"></div>
      
      {/* 只在性能允许的情况下渲染粒子效果 */}
      {shouldRenderParticles && (
        <div className="light-particles">
          {/* 减少粒子数量从10个到6个 */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 5}s` // 稍微延长动画时间
            }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(BackgroundEffect); // 使用React.memo避免不必要的重渲染 