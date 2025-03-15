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
          <div className="format-option" onClick={() => handleExport('temperature', 'heic')}>HEIC</div>
          <div className="format-option" onClick={() => handleExport('temperature', 'svg')}>SVG</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTemperatureGraph; 