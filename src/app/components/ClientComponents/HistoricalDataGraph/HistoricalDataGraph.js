'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Download, Calendar, Thermometer, Droplets } from 'lucide-react';

const HistoricalDataGraph = ({ 
  theme,
  historicalData,
  historicalChartOptions,
  dateRange,
  setDateRange,
  activeMetrics,
  setActiveMetrics,
  customStartDate,
  customEndDate,
  handleCustomDateChange,
  formatDate,
  updateHistoricalData,
  activeDropdown,
  setActiveDropdown,
  handleExport
}) => {
  return (
    <div className="chart-section historical">
      <h1 className={`temperature-title ${theme === 'dark' ? 'dark' : 'light'}`}>
        Historical Data
      </h1>
      <div className="metric-toggles">
        <button 
          className={`metric-toggle ${activeMetrics.temperature ? 'active' : ''}`}
          onClick={() => {
            if (!activeMetrics.temperature || activeMetrics.humidity) {
              setActiveMetrics(prev => ({ ...prev, temperature: !prev.temperature }));
            }
          }}
        >
          <Thermometer size={16} />
          Temperature
        </button>
        <button 
          className={`metric-toggle ${activeMetrics.humidity ? 'active' : ''}`}
          onClick={() => {
            if (!activeMetrics.humidity || activeMetrics.temperature) {
              setActiveMetrics(prev => ({ ...prev, humidity: !prev.humidity }));
            }
          }}
        >
          <Droplets size={16} />
          Humidity
        </button>
      </div>
      <div className="date-controls">
        <button 
          className={`date-range-button ${dateRange === 'lastWeek' ? 'active' : ''}`}
          onClick={() => {
            setDateRange('lastWeek');
            updateHistoricalData('lastWeek');
          }}
        >
          Last Week
        </button>
        <button 
          className={`date-range-button ${dateRange === 'lastMonth' ? 'active' : ''}`}
          onClick={() => {
            setDateRange('lastMonth');
            updateHistoricalData('lastMonth');
          }}
        >
          Last Month
        </button>
        <button 
          className={`date-range-button ${dateRange === 'lastYear' ? 'active' : ''}`}
          onClick={() => {
            setDateRange('lastYear');
            updateHistoricalData('lastYear');
          }}
        >
          Last Year
        </button>
        <button 
          className={`date-range-button ${dateRange === 'custom' ? 'active' : ''}`}
          onClick={() => setDateRange('custom')}
        >
          <Calendar size={16} />
          Custom Range
        </button>
      </div>
      <div className={`custom-date-inputs ${dateRange === 'custom' ? '' : 'hidden'}`}>
        <div className="date-input-group">
          <label className="date-input-label">Start Date:</label>
          <input
            type="date"
            className="date-input"
            value={customStartDate}
            onChange={(e) => handleCustomDateChange(true, e.target.value)}
            max={customEndDate || new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="date-input-group">
          <label className="date-input-label">End Date:</label>
          <input
            type="date"
            className="date-input"
            value={customEndDate}
            onChange={(e) => handleCustomDateChange(false, e.target.value)}
            min={customStartDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      <div className="chart-wrapper" id="historical-chart">
        <Line data={historicalData} options={historicalChartOptions} />
      </div>
      <div className="export-container">
        <button 
          className="export-button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown === 'historical' ? null : 'historical');
          }}
        >
          <Download size={20} />
          Export Graph
        </button>
        <div 
          className={`export-dropdown ${activeDropdown === 'historical' ? 'show' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="format-option" onClick={() => handleExport('historical', 'png')}>PNG</div>
          <div className="format-option" onClick={() => handleExport('historical', 'jpg')}>JPG</div>
        </div>
      </div>
      <div className="about-data">
        <h3>About This Data</h3>
        <p>This chart displays historical temperature and humidity data at their maximum values inside the beehive. Optimal hive temperature is typically between 26-38°C, and optimal humidity ranges between 76.5-85.6%</p>
      </div>
    </div>
  );
};

export default HistoricalDataGraph; 