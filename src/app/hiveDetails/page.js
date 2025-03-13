'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import './hiveDetails.css';
import Header from '../components/ClientComponents/Header/Header';
import { useRouter } from 'next/navigation';
import { Thermometer, Droplets, Download, Calendar, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_DATA_POINTS = 10;

// Generate fake historical data
const generateHistoricalData = (startDate, endDate) => {
  const data = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    data.push({
      date: new Date(currentDate),
      temperature: Math.random() * (35 - 25) + 25,
      humidity: Math.random() * (60 - 40) + 40
    });
    currentDate.setHours(currentDate.getHours() + 1); // Add data points every hour
  }
  return data;
};

// Generate one year of historical data
const ONE_YEAR_AGO = new Date();
ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);
const HISTORICAL_DATA = generateHistoricalData(ONE_YEAR_AGO, new Date());

const HiveDetails = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hiveId = searchParams.get('id');
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [hiveData, setHiveData] = useState({
    name: `Hive ${hiveId}`,
    temperature: 33.4,
    humidity: 54.9
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dateRange, setDateRange] = useState('lastWeek');
  const [historicalData, setHistoricalData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: '#ba6719',
        backgroundColor: '#ba6719',
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        fill: false
      },
      {
        label: 'Humidity (%)',
        data: [],
        borderColor: '#0EA5E9',
        backgroundColor: '#0EA5E9',
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
        fill: false,
        yAxisID: 'humidity'
      }
    ]
  });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeMetrics, setActiveMetrics] = useState({
    temperature: true,
    humidity: true
  });
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  // Initialize with some data points
  const initialTemp = 30;
  const initialHumidity = 50;
  
  // Function to format time only
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Function to format date only
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // State for chart data
  const [temperatureData, setTemperatureData] = useState({
    labels: Array(MAX_DATA_POINTS).fill('').map((_, i) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - (MAX_DATA_POINTS - 1 - i));
      return formatTime(date);
    }),
    datasets: [{
      label: 'Temperature (°C)',
      data: Array(MAX_DATA_POINTS).fill(initialTemp),
      borderColor: '#ba6719',
      backgroundColor: '#ba6719',
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 2,
      fill: false
    }]
  });

  const [humidityData, setHumidityData] = useState({
    labels: Array(MAX_DATA_POINTS).fill('').map((_, i) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - (MAX_DATA_POINTS - 1 - i));
      return formatTime(date);
    }),
    datasets: [{
      label: 'Humidity (%)',
      data: Array(MAX_DATA_POINTS).fill(initialHumidity),
      borderColor: '#0EA5E9',
      backgroundColor: '#0EA5E9',
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 2,
      fill: false
    }]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            family: 'FreeMono, monospace'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme === 'dark' ? '#1E293B' : 'white',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#fff' : '#000',
        borderColor: theme === 'dark' ? '#fff' : '#000',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3);
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Function to handle custom date changes
  const handleCustomDateChange = (isStartDate, value) => {
    if (isStartDate) {
      setCustomStartDate(value);
      if (customEndDate && value) {
        updateHistoricalData('custom', new Date(value), new Date(customEndDate));
      }
    } else {
      setCustomEndDate(value);
      if (customStartDate && value) {
        updateHistoricalData('custom', new Date(customStartDate), new Date(value));
      }
    }
  };

  // Update the updateHistoricalData function to handle custom dates
  const updateHistoricalData = (range, customStart = null, customEnd = null) => {
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case 'lastWeek':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'lastYear':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        if (customStart && customEnd) {
          startDate = customStart;
          endDate = customEnd;
        } else {
          return;
        }
        break;
    }

    let filteredData = HISTORICAL_DATA.filter(
      data => data.date >= startDate && data.date <= endDate
    );

    // For yearly view, aggregate by month
    if (range === 'lastYear') {
      const monthlyData = {};
      
      filteredData.forEach(data => {
        const monthKey = data.date.toISOString().slice(0, 7); // Format: "YYYY-MM"
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: new Date(data.date.getFullYear(), data.date.getMonth(), 1),
            temperature: data.temperature,
            humidity: data.humidity
          };
        } else {
          // Keep the maximum values for each metric
          monthlyData[monthKey].temperature = Math.max(monthlyData[monthKey].temperature, data.temperature);
          monthlyData[monthKey].humidity = Math.max(monthlyData[monthKey].humidity, data.humidity);
        }
      });

      // Convert back to array and sort by date
      filteredData = Object.values(monthlyData).sort((a, b) => a.date - b.date);
    }

    setHistoricalData({
      labels: filteredData.map(data => 
        range === 'lastYear' 
          ? data.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : data.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit'
            })
      ),
      datasets: [
        ...(activeMetrics.temperature ? [{
          label: 'Temperature (°C)',
          data: filteredData.map(data => data.temperature),
          borderColor: '#ba6719',
          backgroundColor: '#ba6719',
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
          fill: false,
          yAxisID: 'y'
        }] : []),
        ...(activeMetrics.humidity ? [{
          label: 'Humidity (%)',
          data: filteredData.map(data => data.humidity),
          borderColor: '#0EA5E9',
          backgroundColor: '#0EA5E9',
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
          fill: false,
          yAxisID: 'y2'
        }] : [])
      ]
    });
  };

  // Update historical data when date range changes
  useEffect(() => {
    updateHistoricalData(dateRange);
  }, [dateRange]);

  // Historical chart options
  const historicalChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: activeMetrics.temperature,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: theme === 'dark' ? '#fff' : '#000'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      y2: {
        type: 'linear',
        display: activeMetrics.humidity,
        position: 'left',
        title: {
          display: true,
          text: 'Humidity (%)',
          color: theme === 'dark' ? '#fff' : '#000'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Update historical data when activeMetrics changes
  useEffect(() => {
    updateHistoricalData(dateRange);
  }, [dateRange, activeMetrics]);

  useEffect(() => {
    setMounted(true);

    // Function to generate random data
    const generateData = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Generate random temperature between 25 and 35
      const newTemp = Math.random() * (35 - 25) + 25;
      // Generate random humidity between 40 and 60
      const newHumidity = Math.random() * (60 - 40) + 40;

      // Update current values
      setHiveData(prev => ({
        ...prev,
        temperature: newTemp.toFixed(1),
        humidity: newHumidity.toFixed(1)
      }));

      // Update temperature chart data
      setTemperatureData(prev => {
        const newLabels = [...prev.labels.slice(1), timeString];
        const newData = [...prev.datasets[0].data.slice(1), newTemp];
        return {
          labels: newLabels,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });

      // Update humidity chart data
      setHumidityData(prev => {
        const newLabels = [...prev.labels.slice(1), timeString];
        const newData = [...prev.datasets[0].data.slice(1), newHumidity];
        return {
          labels: newLabels,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });
    };

    // Set up interval for data generation
    const interval = setInterval(generateData, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReturnClick = () => {
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    router.push(`/loggedIn?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
  };

  const handleExport = (chartType, format) => {
    const canvas = document.querySelector(`#${chartType}-chart canvas`);
    if (!canvas) return;

    let mimeType;
    switch (format) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      case 'svg':
        // For SVG, we need to create an SVG from the canvas
        const svgString = new XMLSerializer().serializeToString(canvas);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${chartType}-data-${formatDate(new Date())}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        return;
      case 'heic':
        // Note: HEIC conversion would require additional libraries
        alert('HEIC format is not supported in the browser. Please choose another format.');
        return;
      default:
        mimeType = 'image/png';
    }

    const link = document.createElement('a');
    link.download = `${chartType}-data-${formatDate(new Date())}.${format}`;
    link.href = canvas.toDataURL(mimeType);
    link.click();
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button and dropdown
      const isClickOutsideButton = !event.target.closest('.export-button');
      const isClickOutsideDropdown = !event.target.closest('.export-dropdown');
      
      if (isClickOutsideButton && isClickOutsideDropdown) {
        setActiveDropdown(null);
      }
    };

    // Add event listener if dropdown is open
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  if (!mounted) return null;

  return (
    <div className={`App theme-${theme === "dark" ? "dark" : "light"}`}>
      <Header isLoggedIn={false} hiveDetails={true}/>
      <FlowersRenderer />

      <button
        onClick={handleReturnClick}
        className='return-button'
      >
        <Image 
          src={"/logout.png"} 
          className='logout-image' 
          alt="Logout"
          width={20}
          height={20}
        />
        <b className='logout-text'>Return</b>
      </button>
    
      <div className="content-wrapperx">
        <div className="headerx">
          <h1 className={`main-titleHive ${theme === 'dark' ? 'dark' : 'light'}`}>
            {hiveData.name},
          </h1>
          <h2 className='real-time-data-title' style={{marginLeft: '0', textAlign: 'left'}}>
            Real-time temperature and humidity data inside the hive
          </h2>
        </div>

        <div className="real-time-data">
          <div className="metrics-container">
            <div className="metric-card temperature">
              <div className="metric-circle">
                <div className="metric-icon-temperature">
                  <Thermometer size={24} />
                </div>
                <div className="metric-content">
                  <h3>Temperature</h3>
                  <div className="metric-value">
                    {hiveData.temperature}°C
                  </div>
                  <div className="metric-status optimal">Optimal</div>
                </div>
              </div>
            </div>

            <div className="metric-card humidity">
              <div className="metric-circle">
                <div className="metric-icon-humidity">
                  <Droplets size={24} />
                </div>
                <div className="metric-content">
                  <h3>Humidity</h3>
                  <div className="metric-value">
                    {hiveData.humidity}%
                  </div>
                  <div className="metric-status optimal">Optimal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-container">
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

          <div className="chart-section historical">
            <h1 className={`temperature-title ${theme === 'dark' ? 'dark' : 'light'}`}>
              Historical Data
            </h1>
            <div className="metric-toggles">
              <button 
                className={`metric-toggle ${activeMetrics.temperature ? 'active' : ''}`}
                onClick={() => setActiveMetrics(prev => ({ ...prev, temperature: !prev.temperature }))}
              >
                <Thermometer size={16} />
                Temperature
              </button>
              <button 
                className={`metric-toggle ${activeMetrics.humidity ? 'active' : ''}`}
                onClick={() => setActiveMetrics(prev => ({ ...prev, humidity: !prev.humidity }))}
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
                <div className="format-option" onClick={() => handleExport('historical', 'heic')}>HEIC</div>
                <div className="format-option" onClick={() => handleExport('historical', 'svg')}>SVG</div>
              </div>
            </div>
            <div className="about-data">
              <h3>About This Data</h3>
              <p>This chart displays historical temperature and humidity data from inside the beehive. Optimal hive temperature is typically between 32-36°C, and optimal humidity ranges between 50-70%.</p>
            </div>
          </div>

          <div className="condition-summary">
            <h1 className={`summary-title ${theme === 'dark' ? 'dark' : 'light'}`}>
              Hive Condition Summary
            </h1>
            <div className="summary-date">
              Generated Summary for {formatDate(new Date(customStartDate || Date.now() - 7 * 24 * 60 * 60 * 1000))} to {formatDate(new Date(customEndDate || Date.now()))}
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
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Minimum</th>
                  <th>Maximum</th>
                  <th>Average</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Temperature (°C)</td>
                  <td>
                    <div className="metric-value-container">
                      29.4°C
                      <AlertTriangle className="status-icon critical" size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      36.1°C
                      <AlertCircle className="status-icon warning" size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      33.4°C
                      <CheckCircle className="status-icon optimal" size={16} />
                    </div>
                  </td>
                  <td className="status-optimal">Optimal</td>
                </tr>
                <tr>
                  <td>Humidity (%)</td>
                  <td>
                    <div className="metric-value-container">
                      38.7%
                      <AlertTriangle className="status-icon critical" size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      66.7%
                      <AlertCircle className="status-icon warning" size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      55.5%
                      <CheckCircle className="status-icon optimal" size={16} />
                    </div>
                  </td>
                  <td className="status-optimal">Optimal</td>
                </tr>
              </tbody>
            </table>
            <div className="condition-analysis">
              <p>During this period, the hive maintained an average temperature of 33.4°C, with concerning low temperatures dropping to 29.4°C. Humidity levels averaged 55.5%, with periods of dryness (38.7%) that could affect brood development. Overall, the hive conditions were excellent for colony health and honey production.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveDetails;