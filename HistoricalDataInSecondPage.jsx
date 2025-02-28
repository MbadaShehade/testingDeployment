import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { Thermometer, Droplets, Calendar } from 'lucide-react';

// Mock data generator
const generateMockData = (startDate: Date, endDate: Date, interval: 'day' | 'month') => {
  let dates = [];
  
  if (interval === 'day') {
    dates = eachDayOfInterval({ start: startDate, end: endDate });
  } else {
    dates = eachMonthOfInterval({ start: startDate, end: endDate });
  }
  
  return dates.map(date => {
    // Generate random temperature between 30-38°C
    const temperature = 30 + Math.random() * 8;
    // Generate random humidity between 40-80%
    const humidity = 40 + Math.random() * 40;
    
    return {
      date,
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1))
    };
  });
};

type DateRange = 'custom' | 'week' | 'month' | 'year';

const HistoricalData: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'temperature' | 'humidity'>('temperature');

  useEffect(() => {
    let start: Date;
    let end: Date = new Date();
    let interval: 'day' | 'month' = 'day';
    
    switch (dateRange) {
      case 'week':
        start = subDays(new Date(), 7);
        break;
      case 'month':
        start = subDays(new Date(), 30);
        break;
      case 'year':
        start = subYears(new Date(), 1);
        interval = 'month';
        break;
      default:
        start = new Date(startDate);
        end = new Date(endDate);
    }
    
    const newData = generateMockData(start, end, interval);
    setData(newData);
  }, [dateRange, startDate, endDate]);

  const formatXAxis = (tickItem: Date) => {
    if (dateRange === 'year') {
      return format(new Date(tickItem), 'MMM');
    }
    return format(new Date(tickItem), 'MMM dd');
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    
    if (range === 'week') {
      setStartDate(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
      setEndDate(format(new Date(), 'yyyy-MM-dd'));
    } else if (range === 'month') {
      setStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
      setEndDate(format(new Date(), 'yyyy-MM-dd'));
    } else if (range === 'year') {
      setStartDate(format(subYears(new Date(), 1), 'yyyy-MM-dd'));
      setEndDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Calendar className="w-6 h-6 text-amber-500 mr-2" />
        <h1 className="text-2xl font-bold">Historical Hive Data</h1>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Date Range</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'week' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'month' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleDateRangeChange('year')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'year' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Last Year
            </button>
            <button
              onClick={() => handleDateRangeChange('custom')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'custom' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Custom Range
            </button>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`flex items-center px-4 py-2 ${
              activeTab === 'temperature' 
                ? 'border-b-2 border-amber-500 text-amber-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('temperature')}
          >
            <Thermometer className="w-5 h-5 mr-2" />
            Temperature
          </button>
          <button
            className={`flex items-center px-4 py-2 ${
              activeTab === 'humidity' 
                ? 'border-b-2 border-amber-500 text-amber-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('humidity')}
          >
            <Droplets className="w-5 h-5 mr-2" />
            Humidity
          </button>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              interval={dateRange === 'year' ? 0 : Math.floor(data.length / 7)}
            />
            <YAxis 
              domain={activeTab === 'temperature' ? [25, 40] : [30, 90]}
              label={{ 
                value: activeTab === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              formatter={(value: number) => [
                `${value} ${activeTab === 'temperature' ? '°C' : '%'}`,
                activeTab === 'temperature' ? 'Temperature' : 'Humidity'
              ]}
              labelFormatter={(label) => format(new Date(label), 'MMMM dd, yyyy')}
            />
            <Legend />
            {activeTab === 'temperature' ? (
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#f59e0b" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Temperature"
              />
            ) : (
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Humidity"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-200">
        <h3 className="font-medium text-amber-800 mb-2">About This Data</h3>
        <p className="text-amber-700 text-sm">
          This chart displays historical {activeTab === 'temperature' ? 'temperature' : 'humidity'} data from inside the beehive. 
          {activeTab === 'temperature' 
            ? ' Optimal hive temperature is typically between 32-36°C.' 
            : ' Optimal hive humidity is typically between 50-60%.'
          }
        </p>
      </div>
    </div>
  );
};

export default HistoricalData;
