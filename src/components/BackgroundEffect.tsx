import React from 'react';
import '../styles/BackgroundEffect.scss';

const BackgroundEffect: React.FC = () => {
  return (
    <div className="background-effect">
      <div className="temple-bg"></div>
      <div className="overlay"></div>
      <div className="light-particles">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundEffect; 