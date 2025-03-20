'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import './hiveDetails.css';
import Header from '../components/ClientComponents/Header/Header';
import { useRouter } from 'next/navigation';
import { Thermometer, Droplets, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import RealTimeTemperatureGraph from '../components/ClientComponents/RealTimeTemperatureGraph/RealTimeTemperatureGraph';
import RealTimeHumidityGraph from '../components/ClientComponents/RealTimeHumidityGraph/RealTimeHumidityGraph';
import HistoricalDataGraph from '../components/ClientComponents/HistoricalDataGraph/HistoricalDataGraph';
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
  
  // Replace single dateRange with separate states for each component
  const [summaryDateRange, setSummaryDateRange] = useState('lastWeek');
  const [historicalDateRange, setHistoricalDateRange] = useState('lastWeek');
  
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

  // Add new state for summary data
  const [summaryData, setSummaryData] = useState({
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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  // Add new state for analysis data
  const [analysisData, setAnalysisData] = useState({
    tempAvg: 33.4,
    tempMin: 29.4,
    tempMax: 36.1,
    humidityAvg: 55.5,
    humidityMin: 38.7,
    humidityMax: 66.7
  });

  // Update the updateHistoricalData function
  const updateHistoricalData = (range, customStart = null, customEnd = null, forComponent = 'historical') => {
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

    // Update the appropriate state based on the component
    if (forComponent === 'summary') {
      setSummaryDateRange(range);
    } else if (forComponent === 'historical') {
      setHistoricalDateRange(range);
    }

    let filteredData = HISTORICAL_DATA.filter(
      data => data.date >= startDate && data.date <= endDate
    );

    // Calculate statistics from the filtered data
    if (forComponent === 'summary') {
      const stats = filteredData.reduce((acc, curr) => {
        acc.tempSum += curr.temperature;
        acc.humiditySum += curr.humidity;
        acc.tempMin = Math.min(acc.tempMin, curr.temperature);
        acc.tempMax = Math.max(acc.tempMax, curr.temperature);
        acc.humidityMin = Math.min(acc.humidityMin, curr.humidity);
        acc.humidityMax = Math.max(acc.humidityMax, curr.humidity);
        return acc;
      }, {
        tempSum: 0,
        humiditySum: 0,
        tempMin: Infinity,
        tempMax: -Infinity,
        humidityMin: Infinity,
        humidityMax: -Infinity
      });

      const count = filteredData.length;
      setAnalysisData({
        tempAvg: Number((stats.tempSum / count).toFixed(1)),
        tempMin: Number(stats.tempMin.toFixed(1)),
        tempMax: Number(stats.tempMax.toFixed(1)),
        humidityAvg: Number((stats.humiditySum / count).toFixed(1)),
        humidityMin: Number(stats.humidityMin.toFixed(1)),
        humidityMax: Number(stats.humidityMax.toFixed(1))
      });
    }

    // For last week and last month views, aggregate by day and keep maximum values
    if (range === 'lastWeek' || range === 'lastMonth') {
      const dailyData = {};
      
      filteredData.forEach(data => {
        const dayKey = data.date.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            date: new Date(data.date),
            temperature: data.temperature,
            humidity: data.humidity
          };
        } else {
          // Keep the maximum values for each metric
          dailyData[dayKey].temperature = Math.max(dailyData[dayKey].temperature, data.temperature);
          dailyData[dayKey].humidity = Math.max(dailyData[dayKey].humidity, data.humidity);
        }
      });

      // Convert back to array and sort by date
      filteredData = Object.values(dailyData).sort((a, b) => a.date - b.date);
    }
    // For yearly view, aggregate by month
    else if (range === 'lastYear') {
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

    const newData = {
      labels: filteredData.map(data => 
        range === 'lastYear' 
          ? data.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : data.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
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
    };

    // Update the appropriate data state based on the component
    if (forComponent === 'summary') {
      setSummaryData(newData);
    } else {
      setHistoricalData(newData);
    }
  };

  // Update historical data when date range changes
  useEffect(() => {
    updateHistoricalData(historicalDateRange, null, null, 'historical');
  }, [historicalDateRange]);

  // Update summary data when its date range changes
  useEffect(() => {
    updateHistoricalData(summaryDateRange, null, null, 'summary');
  }, [summaryDateRange]);

  // Historical chart options
  const historicalChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        mode: 'nearest',
        intersect: true,
        backgroundColor: theme === 'dark' ? '#1E293B' : 'white',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#fff' : '#000',
        borderColor: theme === 'dark' ? '#fff' : '#000',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            if (context[0]) {
              return context[0].label;
            }
            return '';
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3);
            }
            return label;
          },
          // Filter out other metrics from tooltip
          filter: function(tooltipItem) {
            return tooltipItem.datasetIndex === tooltipItem.tooltipItems[0].datasetIndex;
          }
        }
      }
    },
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
        },
        beginAtZero: false
      },
      y2: {
        type: 'linear',
        display: activeMetrics.humidity,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
          color: theme === 'dark' ? '#fff' : '#000'
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        beginAtZero: false
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
    updateHistoricalData(historicalDateRange, null, null, 'historical');
  }, [historicalDateRange, activeMetrics]);

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
          <RealTimeTemperatureGraph 
            theme={theme}
            temperatureData={temperatureData}
            chartOptions={chartOptions}
            formatDate={formatDate}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            handleExport={handleExport}
          />

          <RealTimeHumidityGraph 
            theme={theme}
            humidityData={humidityData}
            chartOptions={chartOptions}
            formatDate={formatDate}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            handleExport={handleExport}
          />

          <HistoricalDataGraph 
            theme={theme}
            historicalData={historicalData}
            historicalChartOptions={historicalChartOptions}
            dateRange={historicalDateRange}
            setDateRange={setHistoricalDateRange}
            activeMetrics={activeMetrics}
            setActiveMetrics={setActiveMetrics}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            handleCustomDateChange={handleCustomDateChange}
            formatDate={formatDate}
            updateHistoricalData={(range) => updateHistoricalData(range, null, null, 'historical')}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            handleExport={handleExport}
          />

          <div className="condition-summary">
            <h1 className={`summary-title ${theme === 'dark' ? 'dark' : 'light'}`}>
              Hive Condition Summary
            </h1>
            <div className="summary-date">
              Generated Summary for {(() => {
                const now = new Date();
                let startDate = new Date();
                
                switch (summaryDateRange) {
                  case 'lastWeek':
                    startDate.setDate(now.getDate() - 7);
                    break;
                  case 'lastMonth':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                  case 'lastYear':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                  case 'custom':
                    return `${formatDate(new Date(customStartDate || Date.now() - 7 * 24 * 60 * 60 * 1000))} to ${formatDate(new Date(customEndDate || Date.now()))}`;
                  default:
                    startDate.setDate(now.getDate() - 7);
                }
                
                return `${formatDate(startDate)} to ${formatDate(now)}`;
              })()}
            </div>
            <div className="date-controls">
              <button 
                className={`date-range-button ${summaryDateRange === 'lastWeek' ? 'active' : ''}`}
                onClick={() => {
                  updateHistoricalData('lastWeek', null, null, 'summary');
                }}
              >
                Last Week
              </button>
              <button 
                className={`date-range-button ${summaryDateRange === 'lastMonth' ? 'active' : ''}`}
                onClick={() => {
                  updateHistoricalData('lastMonth', null, null, 'summary');
                }}
              >
                Last Month
              </button>
              <button 
                className={`date-range-button ${summaryDateRange === 'lastYear' ? 'active' : ''}`}
                onClick={() => {
                  updateHistoricalData('lastYear', null, null, 'summary');
                }}
              >
                Last Year
              </button>
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
                      {analysisData.tempMin}°C
                      <AlertTriangle className={`status-icon ${analysisData.tempMin < 30 ? 'critical' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      {analysisData.tempMax}°C
                      <AlertCircle className={`status-icon ${analysisData.tempMax > 35 ? 'critical' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      {analysisData.tempAvg}°C
                      <CheckCircle className={`status-icon ${analysisData.tempAvg >= 32 && analysisData.tempAvg <= 35 ? 'optimal' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td className={analysisData.tempAvg >= 32 && analysisData.tempAvg <= 35 ? 'status-optimal' : 'status-warning'}>
                    {analysisData.tempAvg >= 32 && analysisData.tempAvg <= 35 ? 'Optimal' : 'Warning'}
                  </td>
                </tr>
                <tr>
                  <td>Humidity (%)</td>
                  <td>
                    <div className="metric-value-container">
                      {analysisData.humidityMin}%
                      <AlertTriangle className={`status-icon ${analysisData.humidityMin < 45 ? 'critical' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      {analysisData.humidityMax}%
                      <AlertCircle className={`status-icon ${analysisData.humidityMax > 65 ? 'critical' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td>
                    <div className="metric-value-container">
                      {analysisData.humidityAvg}%
                      <CheckCircle className={`status-icon ${analysisData.humidityAvg >= 50 && analysisData.humidityAvg <= 65 ? 'optimal' : 'warning'}`} size={16} />
                    </div>
                  </td>
                  <td className={analysisData.humidityAvg >= 50 && analysisData.humidityAvg <= 65 ? 'status-optimal' : 'status-warning'}>
                    {analysisData.humidityAvg >= 50 && analysisData.humidityAvg <= 65 ? 'Optimal' : 'Warning'}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="condition-analysis">
              <p>
                During this period, the hive maintained an average temperature of {analysisData.tempAvg}°C, 
                with concerning low temperatures dropping to {analysisData.tempMin}°C. 
                Humidity levels averaged {analysisData.humidityAvg}%, with periods of 
                {analysisData.humidityMin < 45 ? ' dryness' : ' high humidity'} ({analysisData.humidityMin}%) 
                that could affect brood development. Overall, the hive conditions were 
                {analysisData.tempAvg >= 32 && analysisData.tempAvg <= 36 && 
                 analysisData.humidityAvg >= 50 && analysisData.humidityAvg <= 70 
                  ? ' excellent' 
                  : ' concerning'} for colony health and honey production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveDetails;