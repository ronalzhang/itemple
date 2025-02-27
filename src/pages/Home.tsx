import React from 'react';
import { Row, Col } from 'antd';
import StatisticsCard from '../components/StatisticsCard';
import PrayerButton from '../components/PrayerButton';
import TempleInfo from '../components/TempleInfo';
import DonationSection from '../components/DonationSection';
import StatisticsChart from '../components/StatisticsChart';
import { useStatsContext } from '../contexts/StatsContext';
import '../styles/Home.scss';

const Home: React.FC = () => {
  const { stats } = useStatsContext();
  
  return (
    <div className="home-container">
      <div className="prayers-section">
        <Row gutter={[8, 8]}>
          <Col xs={24} md={12}>
            <StatisticsCard />
          </Col>
          <Col xs={24} md={12}>
            <StatisticsChart data={stats.regions} />
          </Col>
        </Row>
        
        <Row justify="center" style={{ marginTop: '10px', marginBottom: '20px' }}>
          <Col xs={24} sm={18} md={12} lg={10} xl={8}>
            <PrayerButton />
          </Col>
        </Row>
      </div>
      
      <div className="info-section">
        <TempleInfo />
      </div>
      
      <div className="donation-container">
        <DonationSection />
      </div>
    </div>
  );
};

export default Home; 