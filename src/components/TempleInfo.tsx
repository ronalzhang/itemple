import React, { useState, useEffect } from 'react';
import { Card, Carousel, Image } from 'antd';
import { useTranslation } from 'react-i18next';
import { fetchTempleImages } from '../services/api';
import '../styles/TempleInfo.scss';

const TempleInfo: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetchTempleImages();
        setImages(response.data || []);
      } catch (error) {
        console.error('Failed to load temple images:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, []);
  
  return (
    <div className="temple-info-container">
      <h2 className="section-title">{t('temple.title')}</h2>
      
      <div className="temple-content">
        <div className="temple-description">
          <Card className="info-card" variant="borderless">
            <div className="temple-text">
              <p className="intro-paragraph">{t('temple.introduction')}</p>
              <p>{t('temple.description1')}</p>
              <p>{t('temple.description2')}</p>
              <p>{t('temple.description3')}</p>
            </div>
          </Card>
        </div>
        
        <div className="temple-gallery">
          <Card className="gallery-card" variant="borderless" loading={loading}>
            {images.length > 0 && (
              <Carousel autoplay effect="fade" dots={{ className: 'custom-dots' }}>
                {images.map((image, index) => (
                  <div key={index} className="carousel-item">
                    <Image 
                      src={image} 
                      alt={`Temple ${index + 1}`} 
                      preview={false}
                      className="temple-image"
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TempleInfo; 