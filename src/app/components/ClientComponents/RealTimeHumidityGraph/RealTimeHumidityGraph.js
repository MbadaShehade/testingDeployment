'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

const RealTimeHumidityGraph = ({ 
  theme, 
  humidityData, 
  chartOptions, 
  formatDate, 
  activeDropdown, 
  setActiveDropdown, 
  handleExport 
}) => {
  console.log('humidityData', humidityData);
  console.log('chartOptions', chartOptions);

  return (
    <div className="chart-section">
      <h1 className={`temperature-title ${theme === 'dark' ? 'dark' : 'light'}`}>
        Real-Time humidity
      </h1>
      <div className="date-display">
        Date: {formatDate(new Date())}
      </div>
      <div className="chart-wrapper" id="humidity-chart">
        <Line data={humidityData} options={chartOptions} />
      </div>
      <div className="export-container">
        <button 
          className="export-button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown === 'humidity' ? null : 'humidity');
          }}
        >
          <Download size={20} />
          Export Graph
        </button>
        <div 
          className={`export-dropdown ${activeDropdown === 'humidity' ? 'show' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="format-option" onClick={() => handleExport('humidity', 'png')}>PNG</div>
          <div className="format-option" onClick={() => handleExport('humidity', 'jpg')}>JPG</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeHumidityGraph; 