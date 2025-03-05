import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, ChevronDown, ArrowLeft } from 'lucide-react';

const BeehiveDashboard = () => {
  // Sample data - in a real application, this would come from an API
  const [hiveData, setHiveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Filter states
  const [selectedHives, setSelectedHives] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], // Last 7 days
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [selectedMetric, setSelectedMetric] = useState('humidity');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Generate some sample data on component mount
  useEffect(() => {
    const generateData = () => {
      const metrics = ['humidity', 'temperature', 'score'];
      const hives = ['Hive 1', 'Hive 2', 'Hive 3', 'Hive 4', 'Hive 5', 'Hive 6'];
      const data = [];
      
      // Generate data for the last 30 days
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        hives.forEach(hive => {
          // Generate some random but realistic data
          const entry = {
            date: dateString,
            hive: hive,
            humidity: Math.floor(40 + Math.random() * 20), // 40-60%
            temperature: Math.floor(30 + Math.random() * 10), // 30-40°C
            score: Math.floor(70 + Math.random() * 30), // 70-100%
          };
          
          // Add some alerts for demo purposes
          if (hive === 'Hive 2' && i < 3) {
            entry.humidity = 30 + Math.random() * 5; // Low humidity alert
            entry.hasAlert = true;
            entry.alertType = 'humidity';
          }
          
          if (hive === 'Hive 4' && i < 5) {
            entry.temperature = 42 + Math.random() * 3; // High temperature alert
            entry.hasAlert = true;
            entry.alertType = 'temperature';
          }
          
          if (hive === 'Hive 6' && i < 4) {
            entry.score = 50 + Math.random() * 10; // Low score alert
            entry.hasAlert = true;
            entry.alertType = 'score';
          }
          
          data.push(entry);
        });
      }
      
      return data;
    };
    
    const data = generateData();
    setHiveData(data);
    
    // Initialize selected hives with all hives
    const uniqueHives = [...new Set(data.map(item => item.hive))];
    setSelectedHives(uniqueHives);
  }, []);
  
  // Filter data whenever filters change
  useEffect(() => {
    if (hiveData.length === 0) return;
    
    let filtered = hiveData.filter(item => {
      const dateMatches = item.date >= dateRange.start && item.date <= dateRange.end;
      const hiveMatches = selectedHives.includes(item.hive);
      return dateMatches && hiveMatches;
    });
    
    setFilteredData(filtered);
  }, [hiveData, selectedHives, dateRange]);
  
  // Get unique hives from the data
  const uniqueHives = [...new Set(hiveData.map(item => item.hive))];
  
  // Prepare chart data based on the selected metric
  const prepareChartData = (metric) => {
    // Group by date for time series chart
    const groupedByDate = {};
    
    filteredData.forEach(item => {
      if (!groupedByDate[item.date]) {
        groupedByDate[item.date] = { date: item.date };
      }
      groupedByDate[item.date][item.hive] = item[metric];
    });
    
    return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Prepare aggregated data for bar chart
  const prepareAggregateData = (metric) => {
    const result = [];
    const groupedByHive = {};
    
    filteredData.forEach(item => {
      if (!groupedByHive[item.hive]) {
        groupedByHive[item.hive] = { 
          values: [], 
          alerts: 0 
        };
      }
      groupedByHive[item.hive].values.push(item[metric]);
      if (item.hasAlert && item.alertType === metric) {
        groupedByHive[item.hive].alerts++;
      }
    });
    
    Object.entries(groupedByHive).forEach(([hive, data]) => {
      const average = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
      result.push({
        hive,
        [metric]: parseFloat(average.toFixed(1)),
        hasAlert: data.alerts > 0
      });
    });
    
    return result;
  };
  
  // Toggle hive selection
  const toggleHive = (hive) => {
    if (selectedHives.includes(hive)) {
      setSelectedHives(selectedHives.filter(h => h !== hive));
    } else {
      setSelectedHives([...selectedHives, hive]);
    }
  };
  
  // Select all hives
  const selectAllHives = () => {
    setSelectedHives([...uniqueHives]);
  };
  
  // Clear hive selection
  const clearHiveSelection = () => {
    setSelectedHives([]);
  };
  
  // Format metric name for display
  const formatMetricName = (metric) => {
    return metric.charAt(0).toUpperCase() + metric.slice(1);
  };
  
  // Get metric unit
  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'humidity': return '%';
      case 'temperature': return '°C';
      case 'score': return '%';
      default: return '';
    }
  };
  
  // Get chart color based on metric
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'humidity': return '#3182CE'; // Blue
      case 'temperature': return '#E53E3E'; // Red
      case 'score': return '#38A169'; // Green
      default: return '#718096'; // Gray
    }
  };
  
  // Current metric's aggregated data
  const aggregateData = prepareAggregateData(selectedMetric);
  
  // Get alerts count for the current view
  const alertsCount = filteredData.filter(item => 
    item.hasAlert && item.alertType === selectedMetric
  ).length;
  
  // Navigation back to hive management
  const navigateBack = () => {
    // In a real app, this would use proper routing
    console.log('Navigate back to hive management');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={navigateBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Beehive Analytics Dashboard</h1>
        </div>
        
        {/* Metric selector tabs */}
        <div className="flex mb-6 bg-white rounded-lg shadow overflow-hidden">
          {['humidity', 'temperature', 'score'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                selectedMetric === metric 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {formatMetricName(metric)}
            </button>
          ))}
        </div>
        
        {/* Filter toggle button and alerts indicator */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center px-4 py-2 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} className="mr-2" />
            Filters
            <ChevronDown size={16} className={`ml-2 transform transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
          </button>
          
          {alertsCount > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center">
              <span className="font-medium">{alertsCount} alert{alertsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Filter panel */}
        {showFilterPanel && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hive filter */}
              <div>
                <h3 className="font-medium mb-2 text-gray-700">Select Hives</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {uniqueHives.map(hive => (
                    <button
                      key={hive}
                      onClick={() => toggleHive(hive)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedHives.includes(hive)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {hive}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={selectAllHives}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={clearHiveSelection}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Date range filter */}
              <div>
                <h3 className="font-medium mb-2 text-gray-700">Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state when no hives are selected */}
        {selectedHives.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-lg text-gray-600">Please select at least one hive to view data</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Time series chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {formatMetricName(selectedMetric)} Over Time
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareChartData(selectedMetric)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      label={{ 
                        value: `${formatMetricName(selectedMetric)} (${getMetricUnit(selectedMetric)})`, 
                        angle: -90, 
                        position: 'insideLeft' 
                      }} 
                    />
                    <Tooltip />
                    <Legend />
                    {selectedHives.map((hive, index) => (
                      <Line
                        key={hive}
                        type="monotone"
                        dataKey={hive}
                        name={hive}
                        stroke={`hsl(${(index * 30) % 360}, 70%, 50%)`}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Bar chart comparison */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Average {formatMetricName(selectedMetric)} by Hive
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={aggregateData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hive" />
                    <YAxis 
                      label={{ 
                        value: `${formatMetricName(selectedMetric)} (${getMetricUnit(selectedMetric)})`, 
                        angle: -90, 
                        position: 'insideLeft' 
                      }} 
                    />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill={getMetricColor(selectedMetric)}
                      name={`Avg. ${formatMetricName(selectedMetric)}`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Summary stats */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Hive Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hive
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current {formatMetricName(selectedMetric)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average {formatMetricName(selectedMetric)}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedHives.map(hive => {
                      const hiveEntries = filteredData.filter(item => item.hive === hive);
                      const latest = hiveEntries.sort((a, b) => b.date.localeCompare(a.date))[0] || {};
                      const values = hiveEntries.map(item => item[selectedMetric]);
                      const average = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A';
                      const min = values.length > 0 ? Math.min(...values) : 'N/A';
                      const max = values.length > 0 ? Math.max(...values) : 'N/A';
                      const hasAlert = hiveEntries.some(item => item.hasAlert && item.alertType === selectedMetric);
                      
                      return (
                        <tr key={hive}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {hive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {latest[selectedMetric] ? `${latest[selectedMetric]} ${getMetricUnit(selectedMetric)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {average !== 'N/A' ? `${average} ${getMetricUnit(selectedMetric)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {min !== 'N/A' ? `${min} ${getMetricUnit(selectedMetric)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {max !== 'N/A' ? `${max} ${getMetricUnit(selectedMetric)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              hasAlert 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {hasAlert ? 'Alert' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeehiveDashboard;
