import React from 'react';
import { Line } from 'react-chartjs-2';
import { Download } from 'lucide-react';

const RealTimeHumidityGraph = ({ 
  theme, 
  humidityData, 
  chartOptions, 
  formatDate, 
  activeDropdown, 
  setActiveDropdown, 
  handleExport 
}) => {
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
          <div className="format-option" onClick={() => handleExport('humidity', 'heic')}>HEIC</div>
          <div className="format-option" onClick={() => handleExport('humidity', 'svg')}>SVG</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeHumidityGraph; 