'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Download } from 'lucide-react';

const RealTimeTemperatureGraph = ({ 
  theme, 
  temperatureData, 
  chartOptions, 
  formatDate, 
  activeDropdown, 
  setActiveDropdown, 
  handleExport 
}) => {
  return (
    <div className="chart-section">
      <h1 className={`temperature-title ${theme === 'dark' ? 'dark' : 'light'}`}>
        Real-Time temperature
      </h1>
      <div className="date-display">
        Date: {formatDate(new Date())}
      </div>
      <div className="chart-wrapper" id="temperature-chart">
        {(() => {
          console.log('RealTimeTemperatureGraph: temperatureData =', temperatureData);
          console.log('RealTimeTemperatureGraph: temperatureData.labels =', temperatureData.labels);
          console.log('RealTimeTemperatureGraph: temperatureData.datasets =', temperatureData.datasets);
          if (temperatureData.datasets && temperatureData.datasets[0]) {
            console.log('RealTimeTemperatureGraph: temperatureData.datasets[0].data =', temperatureData.datasets[0].data);
          }
          return null;
        })()}
        <Line data={temperatureData} options={chartOptions} />
      </div>
      <div className="export-container">
        <button 
          className="export-button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown === 'temperature' ? null : 'temperature');
          }}
        >
          <Download size={20} />
          Export Graph
        </button>
        <div 
          className={`export-dropdown ${activeDropdown === 'temperature' ? 'show' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="format-option" onClick={() => handleExport('temperature', 'png')}>PNG</div>
          <div className="format-option" onClick={() => handleExport('temperature', 'jpg')}>JPG</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTemperatureGraph; 