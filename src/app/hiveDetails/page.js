'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import './hiveDetails.css';
import Header from '../components/ClientComponents/Header/Header';
import { useRouter } from 'next/navigation';
import { Thermometer, Droplets, AlertTriangle, AlertCircle, CheckCircle, Send, Download, RefreshCw, MessageSquare } from 'lucide-react';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import RealTimeTemperatureGraph from '../components/ClientComponents/RealTimeTemperatureGraph/RealTimeTemperatureGraph';
import RealTimeHumidityGraph from '../components/ClientComponents/RealTimeHumidityGraph/RealTimeHumidityGraph';
import HistoricalDataGraph from '../components/ClientComponents/HistoricalDataGraph/HistoricalDataGraph';
import mqtt from 'mqtt';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'chart.js/auto';
import { MQTT_URL } from '../lib/mqtt-config';

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

// Helper function to get unique sorted dates
const getUniqueSortedDates = (dates) => {
  if (!Array.isArray(dates)) return [];
  return [...new Set(dates)].sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA - dateB;
  });
};

const HiveDetails = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hiveId = searchParams.get('id');
  const email = searchParams.get('email');
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [hiveData, setHiveData] = useState({
    name: `Hive ${hiveId}`,
    temperature: null,
    humidity: null,
    airPump: "OFF" // Add airPump property with default OFF
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sending, setSending] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState(null);
  
  // Add state for cached light mode images for PDF export
  const [cachedLightModeImages, setCachedLightModeImages] = useState({
    temperature: null,
    humidity: null
  });

  

  // Add state for showing success message
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add state for automatic reporting
  const [autoReporting, setAutoReporting] = useState(false);
  const [reportingInterval, setReportingInterval] = useState(null);
  
  // Add state for scheduled reports
  const [isScheduleActive, setIsScheduleActive] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [scheduleInterval, setScheduleInterval] = useState('15s'); // Default to 15 seconds
  const [isTestMode, setIsTestMode] = useState(true); // Default checked
  
  const intervalOptions = [
    { value: '15s', label: '15 Seconds' },
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' }
  ];

  // Format interval text for display
  const formatIntervalText = (intervalValue) => {
    switch (intervalValue) {
      case '15s': return '15 seconds';
      case '1h': return 'hour';
      case '24h': return '24 hours';
      default: return 'hour';
    }
  };
  
  // Function to update scheduler interval on the server
  const updateSchedulerInterval = async (newInterval) => {
    if (!telegramChatId || !isScheduleActive) return;
    
    setIsLoadingSchedule(true);
    setScheduleError(null);
    
    // Add a timeout to ensure the loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoadingSchedule(false);
      setScheduleError('Request timed out. Please try again.');
    }, 5000);
    
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          hiveId,
          chatId: telegramChatId,
          username: searchParams.get('username') || 'User',
          interval: newInterval
        }),
      });
      
      clearTimeout(loadingTimeout);
      
      const data = await response.json();
      
      if (response.ok) {
        setStatusMessage(`Reports scheduled every ${formatIntervalText(newInterval)}`);
      } else {
        setScheduleError(data.error || 'Failed to update scheduler interval');
      }
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error('Error updating scheduler interval:', error);
      setScheduleError('Failed to update scheduler interval');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoadingSchedule(false);
    }
  };
  
  // Handle scheduled report interval change
  const handleIntervalChange = (e) => {
    const newInterval = e.target.value;
    setScheduleInterval(newInterval);
    setIsTestMode(newInterval === '15s');
    
    // If the scheduler is active, update the interval on the server
    if (isScheduleActive) {
      updateSchedulerInterval(newInterval);
    }
  };

  // Handle test mode checkbox change
  const handleTestModeChange = (e) => {
    const isChecked = e.target.checked;
    setIsTestMode(isChecked);
    if (isChecked) {
      setScheduleInterval('15s');
    } else if (scheduleInterval === '15s') {
      setScheduleInterval('1h');
    }
  };

  // Check scheduler status
  const checkSchedulerStatus = async () => {
    if (!telegramChatId) return;
    
    setIsLoadingSchedule(true);
    setScheduleError(null);
    
    // Add a timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoadingSchedule(false);
      setScheduleError('Status check timed out. Please refresh.');
    }, 5000);
    
    try {
      const response = await fetch(`/api/scheduler?hiveId=${hiveId}&chatId=${telegramChatId}&action=status`);
      
      clearTimeout(loadingTimeout);
      
      const data = await response.json();
      
      if (response.ok) {
        setIsScheduleActive(data.status === 'running');
        if (data.status === 'running') {
          const currentInterval = data.interval || '15s';
          setScheduleInterval(currentInterval);
          setIsTestMode(currentInterval === '15s');
          setStatusMessage(`Reports scheduled every ${formatIntervalText(currentInterval)}`);
        } else {
          setStatusMessage('');
        }
      } else {
        setScheduleError(data.error || 'Failed to check scheduler status');
      }
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error('Error checking scheduler status:', error);
      setScheduleError('Failed to connect to scheduler service');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoadingSchedule(false);
    }
  };

  // Start or stop scheduled reports
  const handleScheduleToggle = async () => {
    if (!telegramChatId) return;
    
    setIsLoadingSchedule(true);
    setScheduleError(null);
    
    // Add a timeout to ensure the loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoadingSchedule(false);
      setScheduleError('Request timed out. Please try again.');
    }, 5000);
    
    try {
      // If already active, stop it
      if (isScheduleActive) {
        const response = await fetch('/api/scheduler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'stop',
            hiveId,
            chatId: telegramChatId
          }),
        });
        
        clearTimeout(loadingTimeout);
        
        const data = await response.json();
        
        if (response.ok) {
          setIsScheduleActive(false);
          setStatusMessage('');
        } else {
          setScheduleError(data.error || 'Failed to stop scheduler');
        }
      } else {
        // Start the scheduler with current settings
        const response = await fetch('/api/scheduler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'start',
            hiveId,
            chatId: telegramChatId,
            username: searchParams.get('username') || 'User',
            reportTime: '08:00',
            interval: scheduleInterval
          }),
        });
        
        clearTimeout(loadingTimeout);
        
        const data = await response.json();
        
        if (response.ok) {
          setIsScheduleActive(true);
          setStatusMessage(`Reports scheduled every ${formatIntervalText(scheduleInterval)}`);
        } else {
          setScheduleError(data.error || 'Failed to start scheduler');
        }
      }
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error(`Error ${isScheduleActive ? 'stopping' : 'starting'} scheduler:`, error);
      setScheduleError('Failed to connect to scheduler service');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoadingSchedule(false);
    }
  };

  // Fetch user's Telegram chat ID when component mounts
  useEffect(() => {
    const fetchTelegramChatId = async () => {
      if (!email) return;
      
      try {
        const response = await fetch(`/api/auth/telegram?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.telegramChatId) {
          setTelegramChatId(data.telegramChatId);
          
          // First check if scheduler is already running
          const statusResponse = await fetch(`/api/scheduler?hiveId=${hiveId}&chatId=${data.telegramChatId}&action=status`);
          const statusData = await statusResponse.json();
          
          if (statusData.success && statusData.status === 'running') {
            // Scheduler is already running, set UI state accordingly
            setIsScheduleActive(true);
            setStatusMessage('Reports are being sent automatically every 24 hours');
            setAutoReporting(true);
            return; // Exit early - no need to start scheduler
          }
          
          // Start the scheduler with automatic reporting
          const response = await fetch('/api/scheduler', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'start',
              hiveId,
              chatId: data.telegramChatId,
              username: searchParams.get('username') || 'User',
              interval: '24h'  // Set to 24 hours interval
            }),
          });
          
          const schedulerData = await response.json();
          if (schedulerData.success) {
            setIsScheduleActive(true);
            setStatusMessage('Reports are being sent automatically every 24 hours');
            setAutoReporting(true);
          } else if (schedulerData.error === 'Scheduler already running') {
            // This is actually a successful state - the scheduler is already running
            setIsScheduleActive(true);
            setStatusMessage('Reports are being sent automatically every 24 hours');
            setAutoReporting(true);
          } else {
            console.error('Failed to start automatic reporting:', schedulerData.error);
          }
        }
      } catch (error) {
        console.error('Error fetching Telegram chat ID:', error);
      }
    };
    
    fetchTelegramChatId();
  }, [email, hiveId]);

  // Check scheduler status when telegramChatId is available
  useEffect(() => {
    if (telegramChatId) {
      checkSchedulerStatus();
    }
  }, [telegramChatId, hiveId]);

  // Add this function to allow users to enter their Telegram chat ID
  const handleSetupTelegram = () => {
    const chatId = prompt('Please enter your Telegram chat ID. To get your ID, contact @userinfobot on Telegram.');
    if (!chatId) return;
    
    // Validate chat ID (should be a number)
    if (!/^-?\d+$/.test(chatId)) {
      alert('Telegram chat ID must be a number. Please try again.');
      return;
    }
    
    // Save to database
    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        telegramChatId: chatId
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setTelegramChatId(chatId);
        alert('Telegram chat ID saved successfully!');
      } else {
        alert('Failed to save Telegram chat ID: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error saving Telegram chat ID:', error);
      alert('Error saving Telegram chat ID');
    });
  };

  // Add function to update cached light mode images
  const updateCachedChartImages = useCallback(() => {
    // Only proceed if we have charts to capture
    const tempCanvas = document.querySelector('#temperature-chart canvas');
    const humidityCanvas = document.querySelector('#humidity-chart canvas');
    
    if (!tempCanvas || !humidityCanvas) return;
    
    // Store the current theme
    const currentTheme = theme;
    
    // Get chart instances
    const tempChart = Chart.getChart(tempCanvas);
    const humidityChart = Chart.getChart(humidityCanvas);
    
    if (!tempChart || !humidityChart) return;
    
    // Store original settings
    const originalSettings = {
      temperature: {
        yTicksColor: tempChart.options.scales.y.ticks.color,
        xTicksColor: tempChart.options.scales.x.ticks.color,
        yGridColor: tempChart.options.scales.y.grid.color,
        xGridColor: tempChart.options.scales.x.grid.color,
        legendColor: tempChart.options.plugins.legend.labels.color
      },
      humidity: {
        yTicksColor: humidityChart.options.scales.y.ticks.color,
        xTicksColor: humidityChart.options.scales.x.ticks.color,
        yGridColor: humidityChart.options.scales.y.grid.color,
        xGridColor: humidityChart.options.scales.x.grid.color,
        legendColor: humidityChart.options.plugins.legend.labels.color
      }
    };
    
    // Apply light mode settings temporarily
    tempChart.options.scales.y.ticks.color = '#000000';
    tempChart.options.scales.x.ticks.color = '#000000';
    tempChart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.2)';
    tempChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.2)';
    tempChart.options.plugins.legend.labels.color = '#000000';
    tempChart.update();
    
    humidityChart.options.scales.y.ticks.color = '#000000';
    humidityChart.options.scales.x.ticks.color = '#000000';
    humidityChart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.2)';
    humidityChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.2)';
    humidityChart.options.plugins.legend.labels.color = '#000000';
    humidityChart.update();
    
    // Capture the images
    const temperatureImage = tempCanvas.toDataURL('image/png');
    const humidityImage = humidityCanvas.toDataURL('image/png');
    
    // Update the cached images
    setCachedLightModeImages({
      temperature: temperatureImage,
      humidity: humidityImage
    });
    
    // Restore original settings
    tempChart.options.scales.y.ticks.color = originalSettings.temperature.yTicksColor;
    tempChart.options.scales.x.ticks.color = originalSettings.temperature.xTicksColor;
    tempChart.options.scales.y.grid.color = originalSettings.temperature.yGridColor;
    tempChart.options.scales.x.grid.color = originalSettings.temperature.xGridColor;
    tempChart.options.plugins.legend.labels.color = originalSettings.temperature.legendColor;
    tempChart.update();
    
    humidityChart.options.scales.y.ticks.color = originalSettings.humidity.yTicksColor;
    humidityChart.options.scales.x.ticks.color = originalSettings.humidity.xTicksColor;
    humidityChart.options.scales.y.grid.color = originalSettings.humidity.yGridColor;
    humidityChart.options.scales.x.grid.color = originalSettings.humidity.xGridColor;
    humidityChart.options.plugins.legend.labels.color = originalSettings.humidity.legendColor;
    humidityChart.update();
  }, [theme]);
  
  // Update the cached images whenever chart data changes
  useEffect(() => {
    if (mounted && hiveData.temperature !== null && hiveData.humidity !== null) {
      // Short delay to ensure charts are fully rendered
      const timer = setTimeout(() => {
        updateCachedChartImages();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mounted, hiveData.temperature, hiveData.humidity, updateCachedChartImages]);

  // Function to start automatic reporting every minute
  const startAutomaticReporting = async () => {
    if (autoReporting) return; // Already running
    if (!telegramChatId) {
      if (confirm('You need to set up your Telegram bot first. Would you like to do that now?')) {
        handleSetupTelegram();
      }
      return;
    }
    
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          hiveId,
          chatId: telegramChatId,
          username: searchParams.get('username') || 'User',
          interval: '24h' // Set to 24 hours interval
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAutoReporting(true);
        setSuccessMessage('Automatic reporting started. You will receive PDF reports every 24 hours.');
      } else {
        alert('Failed to start automatic reporting: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting automatic reporting:', error);
      alert('Failed to start automatic reporting. Please try again later.');
    }
  };
  
  // Function to stop automatic reporting
  const stopAutomaticReporting = async () => {
    if (!autoReporting) return; // Not running
    
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
          hiveId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAutoReporting(false);
        setSuccessMessage('Automatic reporting stopped.');
      } else {
        alert('Failed to stop automatic reporting: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error stopping automatic reporting:', error);
      alert('Failed to stop automatic reporting. Please try again later.');
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (reportingInterval) {
        clearInterval(reportingInterval);
      }
    };
  }, [reportingInterval]);

  // Extract the report sending logic to a separate function
  const sendReport = async () => {
    if (!telegramChatId) return;
    
    setSending(true);
    try {
      // Save current data to a JSON file on the server for persistence
      await fetch('/api/save-hive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hiveId: hiveId,
          temperature: hiveData.temperature,
          humidity: hiveData.humidity
        }),
      });
      
      // Force update of cached chart images with light mode
      await updateCachedChartImages();
      
      // Use the cached light mode images instead of creating new ones
      let temperatureImage = cachedLightModeImages.temperature;
      let humidityImage = cachedLightModeImages.humidity;
      
      // If cached images aren't available, create them with white background
      if (!temperatureImage || !humidityImage) {
        // Create PDF-ready chart images with guaranteed readability and white background
        temperatureImage = await createReadableChartImage('temperature', temperatureData, hiveData.temperature);
        humidityImage = await createReadableChartImage('humidity', humidityData, hiveData.humidity);
      }
      
      // Verify we have both images
      if (!temperatureImage || !humidityImage) {
        console.error('Failed to generate chart images');
        setSending(false);
        return;
      }
      
      // SAVE CHART IMAGES TO SERVER so the scheduler can use them
      await fetch('/api/save-chart-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hiveId: hiveId,
          temperature_image: temperatureImage,
          humidity_image: humidityImage
        }),
      });
      
      // Get username from URL parameters
      const username = searchParams.get('username') || 'User';
      
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hiveId: hiveId,
          temperature: hiveData.temperature,
          humidity: hiveData.humidity,
          chatId: telegramChatId,
          temperature_image: temperatureImage,
          humidity_image: humidityImage,
          username: username,
          autoReport: autoReporting,
          forceWhiteBackground: true,  // Add a flag to indicate white background is needed
          reportType: autoReporting ? "Automatic In-App Report" : "Manual User Requested Report"  // Indicate report type
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Only show success message for manual sends
        if (!autoReporting) {
          setSuccessMessage('Hive report PDF sent to your Telegram successfully!');
          // Hide the message after 5 seconds
          setTimeout(() => {
            if (successMessage === 'Hive report PDF sent to your Telegram successfully!') {
              setSuccessMessage('');
            }
          }, 5000);
        }
      } else {
        if (!autoReporting) {
          alert('Failed to send Telegram message. Please check your chat ID and try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (!autoReporting) {
        alert('Error sending Telegram message. Please try again later.');
      }
    }
    setSending(false);
  };

  // Modify handleSendTelegram to use the sendReport function
  const handleSendTelegram = () => {
    if (!telegramChatId) {
      if (confirm('You need to set up your Telegram bot first. Would you like to do that now?')) {
        handleSetupTelegram();
      }
      return;
    }
    
    sendReport();
  };


  


  // Replace single dateRange with separate states for each component
  const [summaryDateRange, setSummaryDateRange] = useState('lastWeek');
  const [historicalDateRange, setHistoricalDateRange] = useState('lastWeek');
  
  // Initialize state for historical data
  const [historicalData, setHistoricalData] = useState(() => {
    // Try to load historical data from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(`historicalData_hive_${hiveId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Ensure dates are unique and sorted
          const uniqueSortedDates = getUniqueSortedDates(parsedData.labels);
          
          // Create new datasets with unique dates
          const newDatasets = parsedData.datasets.map(dataset => ({
            ...dataset,
            data: uniqueSortedDates.map(date => {
              const originalIndex = parsedData.labels.indexOf(date);
              return originalIndex !== -1 ? dataset.data[originalIndex] : null;
            })
          }));

          return {
            labels: uniqueSortedDates,
            datasets: newDatasets
          };
        } catch (e) {
          console.error('Error parsing saved historical data:', e);
        }
      }
    }
    // Default initial state if no saved data exists
    return {
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
          fill: false,
          yAxisID: 'y'
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
          yAxisID: 'y2'
        }
      ]
    };
  });

  // Add useEffect to save historical data whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && historicalData) {
      localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(historicalData));
    }
  }, [historicalData, hiveId]);

  // Function to clear historical data older than 30 days
  const cleanupOldData = useCallback(() => {
    setHistoricalData(prev => {
      if (!prev || !prev.labels || !prev.datasets) return prev;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cutoffIndex = prev.labels.findIndex(date => {
        const [day, month, year] = date.split('/');
        const dateObj = new Date(year, month - 1, day);
        return dateObj >= thirtyDaysAgo;
      });

      if (cutoffIndex === -1) return prev;

      const newData = {
        labels: prev.labels.slice(cutoffIndex),
        datasets: prev.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.slice(cutoffIndex)
        }))
      };

      // Save cleaned up data to localStorage
      localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(newData));
      return newData;
    });
  }, [hiveId]);

  // Run cleanup on component mount and set up daily cleanup
  useEffect(() => {
    cleanupOldData();

    // Set up daily cleanup at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    const cleanupTimer = setTimeout(() => {
      cleanupOldData();
      // Set up recurring daily cleanup
      const dailyCleanup = setInterval(cleanupOldData, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyCleanup);
    }, timeUntilMidnight);

    return () => clearTimeout(cleanupTimer);
  }, [cleanupOldData]);

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
          precision: 2, // Set precision to ensure consistent decimal places
          callback: function(value) {
            return value.toFixed(2);
          }
        },
        // Improve y-axis scaling to better reflect data
        suggestedMin: function(context) {
          if (!context.chart.data.datasets[0].data || context.chart.data.datasets[0].data.length === 0) {
            return 0;
          }
          const dataMin = Math.min(...context.chart.data.datasets[0].data.filter(v => v !== null && v !== undefined));
          // Ensure min is below the data minimum
          return dataMin - Math.max(0.5, dataMin * 0.03);
        },
        suggestedMax: function(context) {
          if (!context.chart.data.datasets[0].data || context.chart.data.datasets[0].data.length === 0) {
            return 100;
          }
          const dataMax = Math.max(...context.chart.data.datasets[0].data.filter(v => v !== null && v !== undefined));
          // Ensure max is above the data maximum
          return dataMax + Math.max(0.5, dataMax * 0.03);
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
              label += context.parsed.y.toFixed(2);
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

  // Initialize state for daily statistics
  const [dailyStats, setDailyStats] = useState({
    temperature: {
      min: null,
      max: null,
      sum: 0,
      count: 0,
      avg: null
    },
    humidity: {
      min: null,
      max: null,
      sum: 0,
      count: 0,
      avg: null
    },
    lastReset: new Date().setHours(0, 0, 0, 0)
  });

  // Initialize analysis data
  const [analysisData, setAnalysisData] = useState({
    tempAvg: null,
    tempMin: null,
    tempMax: null,
    humidityAvg: null,
    humidityMin: null,
    humidityMax: null
  });

  // Add new state for storing historical maximums
  const [historicalMaximums, setHistoricalMaximums] = useState(() => {
    // Try to load saved data from localStorage when component initializes
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('historicalMaximums');
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    return {
      daily: {}, // Format: { "YYYY-MM-DD": { temperature: max, humidity: max } }
      monthly: {} // Format: { "YYYY-MM": { temperature: max, humidity: max } }
    };
  });

  // Add useEffect to save to localStorage whenever historicalMaximums changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('historicalMaximums', JSON.stringify(historicalMaximums));
    }
  }, [historicalMaximums]);

  // Function to update historical maximums
  const updateHistoricalMaximums = (value, type) => {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const monthKey = dateKey.substring(0, 7); // YYYY-MM

    setHistoricalMaximums(prev => {
      // Load current data from localStorage as well
      const currentData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('historicalMaximums')) || prev 
        : prev;

      // Update daily maximum
      const dailyData = currentData.daily[dateKey] || { temperature: -Infinity, humidity: -Infinity };
      
      // Update monthly maximum
      const monthlyData = currentData.monthly[monthKey] || { temperature: -Infinity, humidity: -Infinity };

      let shouldUpdate = false;

      if (type === 'temperature') {
        if (value > dailyData.temperature) {
          dailyData.temperature = value;
          shouldUpdate = true;
        }
        if (value > monthlyData.temperature) {
          monthlyData.temperature = value;
          shouldUpdate = true;
        }
      } else if (type === 'humidity') {
        if (value > dailyData.humidity) {
          dailyData.humidity = value;
          shouldUpdate = true;
        }
        if (value > monthlyData.humidity) {
          monthlyData.humidity = value;
          shouldUpdate = true;
        }
      }

      const newState = {
        daily: {
          ...currentData.daily,
          [dateKey]: dailyData
        },
        monthly: {
          ...currentData.monthly,
          [monthKey]: monthlyData
        }
      };

      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('historicalMaximums', JSON.stringify(newState));
      }

      // If we have a new maximum, trigger an update of the historical data
      if (shouldUpdate) {
        // Use setTimeout to ensure state update happens first
        setTimeout(() => {
          updateHistoricalData(historicalDateRange, null, null, 'historical');
          updateHistoricalData(summaryDateRange, null, null, 'summary');
        }, 0);
      }

      return newState;
    });
  };

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

    // Convert historical maximums to array format
    let filteredData = [];
    
    if (range === 'lastYear') {
      // Use monthly data for yearly view
      Object.entries(historicalMaximums.monthly || {}).forEach(([monthKey, data]) => {
        const date = new Date(monthKey + '-01'); // First day of month
        if (date >= startDate && date <= endDate) {
          filteredData.push({
            date,
            temperature: data.temperature === -Infinity ? null : data.temperature,
            humidity: data.humidity === -Infinity ? null : data.humidity
          });
        }
      });
    } else {
      // Use daily data for week and month views
      Object.entries(historicalMaximums.daily || {}).forEach(([dateKey, data]) => {
        const date = new Date(dateKey);
        if (date >= startDate && date <= endDate) {
          filteredData.push({
            date,
            temperature: data.temperature === -Infinity ? null : data.temperature,
            humidity: data.humidity === -Infinity ? null : data.humidity
          });
        }
      });
    }

    // Sort by date
    filteredData.sort((a, b) => a.date - b.date);

    console.log('Filtered data:', filteredData); // Add this for debugging

    // Create the new data object with proper dataset configuration
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
          pointRadius: 4,
          borderWidth: 2,
          fill: false,
          yAxisID: 'y',
          spanGaps: true
        }] : []),
        ...(activeMetrics.humidity ? [{
          label: 'Humidity (%)',
          data: filteredData.map(data => data.humidity),
          borderColor: '#0EA5E9',
          backgroundColor: '#0EA5E9',
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 2,
          fill: false,
          yAxisID: 'y2',
          spanGaps: true
        }] : [])
      ]
    };

    console.log('New chart data:', newData); // Add this for debugging

    // Update the appropriate data state based on the component
    if (forComponent === 'summary') {
      setSummaryData(newData);
    } else {
      setHistoricalData(newData);
    }

    // Calculate statistics if needed
    if (forComponent === 'summary' && filteredData.length > 0) {
      const stats = filteredData.reduce((acc, curr) => {
        if (curr.temperature !== null) {
          acc.tempSum += curr.temperature;
          acc.tempCount++;
          acc.tempMin = Math.min(acc.tempMin, curr.temperature);
          acc.tempMax = Math.max(acc.tempMax, curr.temperature);
        }
        if (curr.humidity !== null) {
          acc.humiditySum += curr.humidity;
          acc.humidityCount++;
          acc.humidityMin = Math.min(acc.humidityMin, curr.humidity);
          acc.humidityMax = Math.max(acc.humidityMax, curr.humidity);
        }
        return acc;
      }, {
        tempSum: 0,
        humiditySum: 0,
        tempCount: 0,
        humidityCount: 0,
        tempMin: Infinity,
        tempMax: -Infinity,
        humidityMin: Infinity,
        humidityMax: -Infinity
      });

      setAnalysisData({
        tempAvg: stats.tempCount > 0 ? Number((stats.tempSum / stats.tempCount).toFixed(1)) : null,
        tempMin: stats.tempMin !== Infinity ? Number(stats.tempMin.toFixed(1)) : null,
        tempMax: stats.tempMax !== -Infinity ? Number(stats.tempMax.toFixed(1)) : null,
        humidityAvg: stats.humidityCount > 0 ? Number((stats.humiditySum / stats.humidityCount).toFixed(1)) : null,
        humidityMin: stats.humidityMin !== Infinity ? Number(stats.humidityMin.toFixed(1)) : null,
        humidityMax: stats.humidityMax !== -Infinity ? Number(stats.humidityMax.toFixed(1)) : null
      });
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
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
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
              label += context.parsed.y.toFixed(2);
            }
            return label;
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
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          precision: 2, // Set precision to ensure consistent decimal places
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        // Remove fixed min and max to allow autoScaling
        beginAtZero: false,
        // Improve y-axis scaling for temperature
        suggestedMin: function(context) {
          const validData = context.chart.data.datasets.find(d => d.label.includes('Temperature'))?.data.filter(v => v !== null && v !== undefined) || [];
          if (validData.length === 0) return undefined;
          
          const dataMin = Math.min(...validData);
          return dataMin - Math.max(0.5, dataMin * 0.03); // At least 0.5 units or 3% padding below min value
        },
        suggestedMax: function(context) {
          const validData = context.chart.data.datasets.find(d => d.label.includes('Temperature'))?.data.filter(v => v !== null && v !== undefined) || [];
          if (validData.length === 0) return undefined;
          
          const dataMax = Math.max(...validData);
          return dataMax + Math.max(0.5, dataMax * 0.03); // At least 0.5 units or 3% padding above max value
        }
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
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
          precision: 2, // Set precision to ensure consistent decimal places
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        // Remove fixed min and max to allow autoScaling
        beginAtZero: false,
        // Improve y-axis scaling for humidity
        suggestedMin: function(context) {
          const validData = context.chart.data.datasets.find(d => d.label.includes('Humidity'))?.data.filter(v => v !== null && v !== undefined) || [];
          if (validData.length === 0) return undefined;
          
          const dataMin = Math.min(...validData);
          // Ensure at least 1% padding below min value but not less than 0
          return Math.max(dataMin - Math.max(1, dataMin * 0.03), 0);
        },
        suggestedMax: function(context) {
          const validData = context.chart.data.datasets.find(d => d.label.includes('Humidity'))?.data.filter(v => v !== null && v !== undefined) || [];
          if (validData.length === 0) return undefined;
          
          const dataMax = Math.max(...validData);
          // Ensure at least 1% padding above max value but not more than 100
          return Math.min(dataMax + Math.max(1, dataMax * 0.03), 100);
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
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6
      }
    }
  };

  // Update historical data when activeMetrics changes
  useEffect(() => {
    updateHistoricalData(historicalDateRange, null, null, 'historical');
  }, [historicalDateRange, activeMetrics]);

  useEffect(() => {
    setMounted(true);

    // Try to get pre-loaded data from localStorage
    const storedData = localStorage.getItem(`hiveData_${hiveId}`);
    if (storedData) {
      const { data } = JSON.parse(storedData);
      setHiveData(data);
    }

    // Get the user's password from URL parameters first
    const userPassword = searchParams.get('password');
    if (!userPassword) {
        console.error('No user password found for MQTT topics');
        return;
    }

    // Define topics before MQTT setup
    const tempTopic = `${userPassword}/moldPrevention/hive${hiveId}/temp`;
    const humidityTopic = `${userPassword}/moldPrevention/hive${hiveId}/humidity`;
    const airPumpTopic = `${userPassword}/moldPrevention/hive${hiveId}/airPump`; // Add air pump topic

    // MQTT client setup with WebSocket
    const client = mqtt.connect(MQTT_URL, {
        clientId: `hiveguard_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
    });

    let isConnected = false;

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        isConnected = true;
        
        // Subscribe to topics using the user's password as namespace
        client.subscribe([tempTopic, humidityTopic, airPumpTopic], (err) => { // Add airPump subscription
            if (!err) {
                console.log('Subscribed to topics:', tempTopic, humidityTopic, airPumpTopic);
            } else {
                console.error('Failed to subscribe to topics:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        if (!isConnected) return;
        
        console.log('Received message on topic:', topic);
        console.log('Message content:', message.toString());
        
        const now = new Date();
        const currentTime = formatTime(now);
        const currentDate = formatDate(now);

        // Handle air pump status messages
        if (topic === airPumpTopic) {
            console.log('Updating air pump status:', message.toString());
            setHiveData(prev => ({ ...prev, airPump: message.toString() }));
            return;
        }
        
        // For temperature and humidity, parse as float
        const value = parseFloat(message.toString());
        if (isNaN(value)) {
            console.error('Received invalid numeric value:', message.toString());
            return;
        }

        // Now tempTopic and humidityTopic are in scope
        if (topic === tempTopic) {
            console.log('Updating temperature value:', value);
            setHiveData(prev => ({ ...prev, temperature: value }));
            
            // Update temperature chart data
            setTemperatureData(prev => {
                const newLabels = [...prev.labels.slice(1), currentTime];
                const newData = [...prev.datasets[0].data.slice(1), value];
                return {
                    labels: newLabels,
                    datasets: [{
                        ...prev.datasets[0],
                        data: newData
                    }]
                };
            });

            // Update historical data for temperature
            setHistoricalData(prev => {
                if (!prev || !prev.labels || !prev.datasets) {
                    const initialState = {
                        labels: [currentDate],
                        datasets: [
                            {
                                label: 'Temperature (°C)',
                                data: [value],
                                borderColor: '#ba6719',
                                backgroundColor: '#ba6719',
                                tension: 0.4,
                                pointRadius: 2,
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Humidity (%)',
                                data: [null],
                                borderColor: '#0EA5E9',
                                backgroundColor: '#0EA5E9',
                                tension: 0.4,
                                pointRadius: 2,
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y2'
                            }
                        ]
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(initialState));
                    return initialState;
                }

                // Find if we already have data for today
                const todayIndex = prev.labels.indexOf(currentDate);
                
                if (todayIndex === -1) {
                    // If no data for today, add new entry
                    const newState = {
                        labels: [...prev.labels, currentDate],
                        datasets: prev.datasets.map(dataset => {
                            if (dataset.label.includes('Temperature')) {
                                return {
                                    ...dataset,
                                    data: [...dataset.data, value]
                                };
                            }
                            if (dataset.label.includes('Humidity')) {
                                return {
                                    ...dataset,
                                    data: [...dataset.data, null]
                                };
                            }
                            return dataset;
                        })
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(newState));
                    return newState;
                } else {
                    // Always update the temperature value for today
                    const newState = {
                        ...prev,
                        datasets: prev.datasets.map(dataset => {
                            if (dataset.label.includes('Temperature')) {
                                const newData = [...dataset.data];
                                // Update the value if it's higher than the current maximum
                                newData[todayIndex] = Math.max(newData[todayIndex] || -Infinity, value);
                                return {
                                    ...dataset,
                                    data: newData
                                };
                            }
                            return dataset;
                        })
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(newState));
                    return newState;
                }
            });

        } else if (topic === humidityTopic) {
            console.log('Updating humidity value:', value);
            setHiveData(prev => ({ ...prev, humidity: value }));
            
            // Update humidity chart data
            setHumidityData(prev => {
                const newLabels = [...prev.labels.slice(1), currentTime];
                const newData = [...prev.datasets[0].data.slice(1), value];
                return {
                    labels: newLabels,
                    datasets: [{
                        ...prev.datasets[0],
                        data: newData
                    }]
                };
            });

            // Update historical data for humidity
            setHistoricalData(prev => {
                if (!prev || !prev.labels || !prev.datasets) {
                    const initialState = {
                        labels: [currentDate],
                        datasets: [
                            {
                                label: 'Temperature (°C)',
                                data: [null],
                                borderColor: '#ba6719',
                                backgroundColor: '#ba6719',
                                tension: 0.4,
                                pointRadius: 2,
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Humidity (%)',
                                data: [value],
                                borderColor: '#0EA5E9',
                                backgroundColor: '#0EA5E9',
                                tension: 0.4,
                                pointRadius: 2,
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y2'
                            }
                        ]
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(initialState));
                    return initialState;
                }

                // Find if we already have data for today
                const todayIndex = prev.labels.indexOf(currentDate);
                
                if (todayIndex === -1) {
                    // If no data for today, add new entry
                    const newState = {
                        labels: [...prev.labels, currentDate],
                        datasets: prev.datasets.map(dataset => {
                            if (dataset.label.includes('Humidity')) {
                                return {
                                    ...dataset,
                                    data: [...dataset.data, value]
                                };
                            }
                            if (dataset.label.includes('Temperature')) {
                                return {
                                    ...dataset,
                                    data: [...dataset.data, null]
                                };
                            }
                            return dataset;
                        })
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(newState));
                    return newState;
                } else {
                    // Always update the humidity value for today
                    const newState = {
                        ...prev,
                        datasets: prev.datasets.map(dataset => {
                            if (dataset.label.includes('Humidity')) {
                                const newData = [...dataset.data];
                                // Update the value if it's higher than the current maximum
                                newData[todayIndex] = Math.max(newData[todayIndex] || -Infinity, value);
                                return {
                                    ...dataset,
                                    data: newData
                                };
                            }
                            return dataset;
                        })
                    };
                    localStorage.setItem(`historicalData_hive_${hiveId}`, JSON.stringify(newState));
                    return newState;
                }
            });
        }

        // Update daily stats
        setDailyStats(prev => {
            const startOfDay = now.setHours(0, 0, 0, 0);

            // Reset stats if it's a new day
            if (startOfDay !== prev.lastReset) {
                return {
                    temperature: {
                        min: topic === tempTopic ? value : null,
                        max: topic === tempTopic ? value : null,
                        sum: topic === tempTopic ? value : 0,
                        count: topic === tempTopic ? 1 : 0,
                        avg: topic === tempTopic ? value : null
                    },
                    humidity: {
                        min: topic === humidityTopic ? value : null,
                        max: topic === humidityTopic ? value : null,
                        sum: topic === humidityTopic ? value : 0,
                        count: topic === humidityTopic ? 1 : 0,
                        avg: topic === humidityTopic ? value : null
                    },
                    lastReset: startOfDay
                };
            }

            // Update the appropriate metric
            const newStats = { ...prev };
            const metric = topic === tempTopic ? 'temperature' : 'humidity';
            
            if (newStats[metric]) {
                newStats[metric] = {
                    min: Math.min(newStats[metric].min ?? value, value),
                    max: Math.max(newStats[metric].max ?? value, value),
                    sum: (newStats[metric].sum ?? 0) + value,
                    count: (newStats[metric].count ?? 0) + 1,
                    avg: 0
                };
                newStats[metric].avg = newStats[metric].sum / newStats[metric].count;
            }

            return newStats;
        });

        // Update historical maximums
        updateHistoricalMaximums(value, topic === tempTopic ? 'temperature' : 'humidity');
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
      isConnected = false;
    });

    client.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
      isConnected = false;
    });

    client.on('reconnect', () => {
      console.log('Attempting to reconnect to MQTT broker');
    });

    // Cleanup on component unmount
    return () => {
      console.log('Cleaning up MQTT connection');
      isConnected = false;
      if (client) {
        try {
          client.end(true, () => {
            console.log('MQTT client disconnected successfully');
          });
        } catch (error) {
          console.error('Error disconnecting MQTT client:', error);
        }
      }
    };
  }, [hiveId, searchParams]);

  // Function to fetch fresh hive data
  const fetchHiveData = async () => {
    try {
      const response = await fetch('/api/beehive/fetchHiveData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hiveId: hiveId,
          email: searchParams.get('email')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hive data');
      }

      const data = await response.json();
      setHiveData(data);
      setHistoricalData(data.historicalData || historicalData);
      setSummaryData(data.summaryData || summaryData);
      setAnalysisData(data.analysisData || analysisData);
    } catch (error) {
      console.error('Error fetching hive data:', error);
    }
  };

  // Add effect to update displays when historicalMaximums changes
  useEffect(() => {
    if (mounted) {
      updateHistoricalData(historicalDateRange, null, null, 'historical');
      updateHistoricalData(summaryDateRange, null, null, 'summary');
    }
  }, [historicalMaximums, mounted]);

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

  // Function to reset loading state
  const resetLoadingState = () => {
    setIsLoadingSchedule(false);
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

  // Add fix for exact positioning of data points in charts
  useEffect(() => {
    if (mounted) {
      // Force chart re-render with exact positioning for data points
      const fixChartScaling = () => {
        // Find all chart canvases
        const chartCanvas = document.querySelectorAll('canvas');
        
        // For each canvas, update the associated Chart if it exists
        chartCanvas.forEach(canvas => {
          const chart = Chart.getChart(canvas);
          if (chart) {
            // When updating charts, ensure they use exact data values, not rounded ones
            chart.options.parsing = {
              xAxisKey: 'x',
              yAxisKey: 'y'
            };
            
            // Add more precise tick configuration
            if (chart.options.scales && chart.options.scales.y) {
              chart.options.scales.y.ticks.precision = 2;
            }
            
            // Same for y2 if it exists (humidity axis)
            if (chart.options.scales && chart.options.scales.y2) {
              chart.options.scales.y2.ticks.precision = 2;
            }
            
            // Update the chart with the fixed configuration
            chart.update();
          }
        });
      };
      
      // Run the fix after a short delay to ensure charts are fully initialized
      const timer = setTimeout(fixChartScaling, 500);
      return () => clearTimeout(timer);
    }
  }, [mounted, hiveData.temperature, hiveData.humidity]);

  // Function to create readable chart images for PDF
  const createReadableChartImage = async (type, chartData, currentValue) => {
    return new Promise((resolve) => {
      // Create a temporary container div
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';  // Increase width for better quality
      tempContainer.style.height = '400px';  // Increase height for better quality
      tempContainer.style.backgroundColor = '#FFFFFF';
      document.body.appendChild(tempContainer);
      
      // Create a new canvas inside the temp container
      const canvas = document.createElement('canvas');
      canvas.width = 800;  // Increase canvas width
      canvas.height = 400;  // Increase canvas height
      tempContainer.appendChild(canvas);
      
      // Create a new Chart instance explicitly for the PDF with light mode styling
      const ctx = canvas.getContext('2d');
      
      // Fill the background with white to ensure proper contrast in PDF
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Get data range for proper axis scaling
      const dataValues = [...chartData.datasets[0].data].filter(val => val !== null && val !== undefined);
      const dataMin = dataValues.length > 0 ? Math.min(...dataValues) : 0;
      const dataMax = dataValues.length > 0 ? Math.max(...dataValues) : 100;
      
      // Calculate y-axis range with padding and ensure some minimum range for better visualization
      let yMin, yMax;
      if (type === 'temperature') {
        // Add more range to temperature chart
        const tempRange = Math.max(1.5, (dataMax - dataMin) * 1.5);  // At least 1.5 degrees range or 150% of data range
        const midPoint = (dataMax + dataMin) / 2;
        yMin = midPoint - tempRange / 2;
        yMax = midPoint + tempRange / 2;
        
        // Ensure the current value is in the visible range with extra padding
        if (currentValue !== null && currentValue !== undefined) {
          yMin = Math.min(yMin, currentValue - 1);
          yMax = Math.max(yMax, currentValue + 1);
        }
      } else {
        // Add more range to humidity chart
        const humRange = Math.max(10, (dataMax - dataMin) * 1.5);  // At least 10% range or 150% of data range
        const midPoint = (dataMax + dataMin) / 2;
        yMin = Math.max(midPoint - humRange / 2, 0);
        yMax = Math.min(midPoint + humRange / 2, 100);
        
        // Ensure the current value is in the visible range with extra padding
        if (currentValue !== null && currentValue !== undefined) {
          yMin = Math.min(yMin, Math.max(currentValue - 5, 0));
          yMax = Math.max(yMax, Math.min(currentValue + 5, 100));
        }
      }
      
      // Configure data for the chart with more vibrant colors
      const pdfChartData = {
        labels: [...chartData.labels],
        datasets: [{
          label: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)',
          data: [...chartData.datasets[0].data],
          borderColor: type === 'temperature' ? '#ba6719' : '#0EA5E9',
          backgroundColor: type === 'temperature' ? '#ba6719' : '#0EA5E9',
          tension: 0.4,
          pointRadius: 5,
          borderWidth: 3,
          fill: false
        }]
      };
      
      // Configure options for guaranteed readability with white background
      const pdfChartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        parsing: {
          xAxisKey: 'x',
          yAxisKey: 'y'
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#000000',
              font: {
                size: 16,  // Increase font size
                weight: 'bold',
                family: 'Arial'
              }
            }
          },
          title: {
            display: true,
            text: type === 'temperature' ? 'Current temperature: ' + (currentValue?.toFixed(2) || '--') + '°C' : 
                                        'Current humidity: ' + (currentValue?.toFixed(2) || '--') + '%',
            color: '#000000',
            font: {
              size: 18,
              weight: 'bold',
              family: 'Arial'
            },
            position: 'top',
            padding: {
              top: 10,
              bottom: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: yMin,  // Use calculated min
            max: yMax,  // Use calculated max
            ticks: {
              color: '#000000',
              font: {
                size: 14,  // Increase font size
                weight: 'bold',
                family: 'Arial'
              },
              precision: 2, // Exact precision for tick values
              callback: function(value) {
                return value.toFixed(2);
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.2)'
            }
          },
          x: {
            ticks: {
              color: '#000000',
              font: {
                size: 14,  // Increase font size 
                weight: 'bold',
                family: 'Arial'
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.2)'
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 25,
            bottom: 30,  // More padding at bottom
            left: 25
          }
        }
      };
      
      // Create a new Chart instance with guaranteed readability settings
      const newChart = new Chart(ctx, {
        type: 'line',
        data: pdfChartData,
        options: pdfChartOptions
      });
      
      // Give the chart time to render
      setTimeout(() => {
        try {
          // Get chart as image
          const imageUrl = canvas.toDataURL('image/jpeg', 1.0);  // Use JPEG with max quality
          
          // Clean up
          newChart.destroy();
          document.body.removeChild(tempContainer);
          
          resolve(imageUrl);
        } catch (error) {
          console.error('Error creating chart image:', error);
          document.body.removeChild(tempContainer);
          resolve(null);
        }
      }, 500);  // Increase timeout to ensure rendering completes
    });
  };

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
                    {hiveData.temperature !== null 
                      ? `${hiveData.temperature.toFixed(2)}°C`
                      : '--°C'
                    }
                  </div>
                  <div className={`metric-status ${hiveData.temperature !== null && hiveData.temperature >= 26 && hiveData.temperature <= 38 ? 'optimal' : 'warning'}`}>
                    {hiveData.temperature !== null
                      ? (hiveData.temperature >= 26 && hiveData.temperature <= 38 ? 'Optimal' : 'Warning')
                      : '--'
                    }
                  </div>
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
                    {hiveData.humidity !== null 
                      ? `${hiveData.humidity.toFixed(2)}%`
                      : '--%'
                    }
                  </div>
                  <div className={`metric-status ${hiveData.humidity !== null && hiveData.humidity >= 76.5 && hiveData.humidity <= 85.6 ? 'optimal' : 'warning'}`}>
                    {hiveData.humidity !== null
                      ? (hiveData.humidity >= 76.5 && hiveData.humidity <= 85.6 ? 'Optimal' : 'Warning')
                      : '--'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* New Air Pump Metric Circle */}
            <div className="metric-card air-pump">
              <div className="metric-circle">
                <div className="metric-icon-air-pump">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#B2BEC9"/>
                    <path d="M12 5C13.5 5 14.5 6 14.5 7.5C14.5 9 13.5 10 12 10C10.5 10 9.5 9 9.5 7.5C9.5 6 10.5 5 12 5Z" fill="white"/>
                    <path d="M12 14C13.5 14 14.5 15 14.5 16.5C14.5 18 13.5 19 12 19C10.5 19 9.5 18 9.5 16.5C9.5 15 10.5 14 12 14Z" fill="white"/>
                    <path d="M5 12C5 10.5 6 9.5 7.5 9.5C9 9.5 10 10.5 10 12C10 13.5 9 14.5 7.5 14.5C6 14.5 5 13.5 5 12Z" fill="white"/>
                    <path d="M14 12C14 10.5 15 9.5 16.5 9.5C18 9.5 19 10.5 19 12C19 13.5 18 14.5 16.5 14.5C15 14.5 14 13.5 14 12Z" fill="white"/>
                    <circle cx="12" cy="12" r="2" fill="white"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <h3>Air Pump</h3>
                  <div className="metric-value air-pump-value">
                    {hiveData.airPump || 'OFF'}
                  </div>
                  <div className={`metric-status ${hiveData.airPump === 'ON' ? 'optimal' : 'warning'}`}>
                    {hiveData.airPump === 'ON' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section */}
        <div className={`exact-screenshot-style ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
          <h2>PDF Report</h2>
          
          {successMessage && (
            <div className="status-message success" style={{ 
                backgroundColor: '#4ade80', 
                color: '#052e16', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px' 
              }}>
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}
          
          <div className="buttons-row" style={{ justifyContent: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              className="send-report-button"
              onClick={handleSendTelegram}
              disabled={sending}
              style={{ width: '100%', maxWidth: '400px', alignSelf: 'center' }}
            >
              {sending ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <Image 
                    src={"/telegramIcon.png"} 
                    alt="Telegram"
                    width={18}
                    height={18}
                    style={{ marginRight: '1px', borderRadius: '100%' }}
                  />
                  Get Report Now via Telegram
                </>
              )}
            </button>
            
            {/* The automatic reporting button has been removed as reports are sent automatically every minute */}
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
        </div>
      </div>
    </div>
  );
};

export default HiveDetails;