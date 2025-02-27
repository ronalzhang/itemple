import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tabs, Spin, Image, Row, Col } from 'antd';
import axios from 'axios';
import classNames from 'classnames';
import '../styles/TempleSection.scss';

interface TempleImage {
  id: string;
  url: string;
  alt: string;
}

const TempleSection: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<TempleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<TempleImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // 从后端获取图片数据或使用本地数据
        // 这里暂时使用模拟数据 - 增加到8张图片
        const mockImages = [
          {
            id: '1',
            url: '/images/temple1.jpg',
            alt: t('temple.image1Alt')
          },
          {
            id: '2',
            url: '/images/temple2.jpg',
            alt: t('temple.image2Alt')
          },
          {
            id: '3',
            url: '/images/temple3.jpg',
            alt: t('temple.image3Alt')
          },
          {
            id: '4',
            url: '/images/temple4.jpg',
            alt: t('temple.image4Alt')
          },
          {
            id: '5',
            url: '/images/temple5.jpg',
            alt: t('temple.image5Alt')
          },
          {
            id: '6',
            url: '/images/temple6.jpg',
            alt: t('temple.image6Alt')
          },
          {
            id: '7',
            url: '/images/temple7.jpg',
            alt: t('temple.image7Alt')
          },
          {
            id: '8',
            url: '/images/temple8.jpg',
            alt: t('temple.image8Alt')
          }
        ];
        
        setImages(mockImages);
        setActiveImage(mockImages[0]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch temple images:", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, [t]);

  const handleThumbnailClick = (image: TempleImage) => {
    setActiveImage(image);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            {t('loading')}
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="temple-section-container">
      <h2 className="section-title">{t('templeSection.title')}</h2>
      
      <div className="temple-content-vertical">
        {/* 寺庙图片部分 */}
        <div className="temple-gallery-vertical">
          <Card className="main-image-card" variant="borderless">
            {activeImage && (
              <div className="main-image-container">
                <img
                  src={activeImage.url}
                  alt={activeImage.alt}
                  className="main-image"
                />
              </div>
            )}
            
            <div className="thumbnails-container">
              <div className="thumbnails-scroll">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={classNames('thumbnail-item', {
                      active: activeImage?.id === image.id
                    })}
                    onClick={() => handleThumbnailClick(image)}
                  >
                    <img
                      src={image.url}
                      alt={`${image.alt} - 缩略图`}
                      className="thumbnail"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* 寺庙介绍部分 */}
        <div className="temple-info-vertical">
          <Card className="description-card" variant="borderless">
            <div className="tab-content">
              <p className="intro-paragraph">
                {t('templeSection.introduction.highlight')}
              </p>
              <p>{t('templeSection.introduction.p1')}</p>
              <p>{t('templeSection.introduction.p2')}</p>
            </div>
            
            <div className="temple-quote">
              <blockquote>
                {t('templeSection.quote.text')}
                <cite>{t('templeSection.quote.author')}</cite>
              </blockquote>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TempleSection; 