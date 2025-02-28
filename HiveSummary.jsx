import React, { useState, useEffect } from 'react';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { FileBarChart, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type DateRange = 'week' | 'month' | 'year';

interface SummaryData {
  minTemperature: number;
  maxTemperature: number;
  avgTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  avgHumidity: number;
  period: string;
}

// Mock data generator for summary statistics
const generateSummaryData = (startDate: Date, endDate: Date, interval: 'day' | 'month'): SummaryData => {
  // Generate random but realistic values
  const minTemp = 28 + Math.random() * 4;
  const maxTemp = 34 + Math.random() * 4;
  const avgTemp = minTemp + ((maxTemp - minTemp) * 0.6);
  
  const minHumidity = 35 + Math.random() * 10;
  const maxHumidity = 60 + Math.random() * 20;
  const avgHumidity = minHumidity + ((maxHumidity - minHumidity) * 0.6);
  
  let periodText = '';
  if (interval === 'day') {
    periodText = `${format(startDate, 'MMMM d, yyyy')} to ${format(endDate, 'MMMM d, yyyy')}`;
  } else {
    periodText = `${format(startDate, 'MMMM yyyy')} to ${format(endDate, 'MMMM yyyy')}`;
  }
  
  return {
    minTemperature: parseFloat(minTemp.toFixed(1)),
    maxTemperature: parseFloat(maxTemp.toFixed(1)),
    avgTemperature: parseFloat(avgTemp.toFixed(1)),
    minHumidity: parseFloat(minHumidity.toFixed(1)),
    maxHumidity: parseFloat(maxHumidity.toFixed(1)),
    avgHumidity: parseFloat(avgHumidity.toFixed(1)),
    period: periodText
  };
};

// Generate daily data for detailed analysis
const generateDailyData = (startDate: Date, endDate: Date) => {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  
  return dates.map(date => {
    const temperature = 30 + Math.random() * 8;
    const humidity = 40 + Math.random() * 40;
    
    return {
      date,
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1))
    };
  });
};

// Generate monthly data for yearly view
const generateMonthlyData = (startDate: Date, endDate: Date) => {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  return months.map(date => {
    const temperature = 30 + Math.random() * 8;
    const humidity = 40 + Math.random() * 40;
    
    return {
      date,
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1))
    };
  });
};

// Generate a text summary based on the data
const generateTextSummary = (data: SummaryData): string => {
  let summary = `During this period, the hive maintained an average temperature of ${data.avgTemperature}°C, `;
  
  // Temperature analysis
  if (data.minTemperature < 30) {
    summary += `with concerning low temperatures dropping to ${data.minTemperature}°C. `;
  } else if (data.maxTemperature > 38) {
    summary += `with potentially stressful high temperatures reaching ${data.maxTemperature}°C. `;
  } else {
    summary += `staying within the optimal range between ${data.minTemperature}°C and ${data.maxTemperature}°C. `;
  }
  
  // Humidity analysis
  summary += `Humidity levels averaged ${data.avgHumidity}%, `;
  
  if (data.minHumidity < 40) {
    summary += `with periods of dryness (${data.minHumidity}%) that could affect brood development. `;
  } else if (data.maxHumidity > 70) {
    summary += `with periods of high humidity (${data.maxHumidity}%) that could promote fungal growth. `;
  } else {
    summary += `maintaining healthy levels between ${data.minHumidity}% and ${data.maxHumidity}%. `;
  }
  
  // Overall assessment
  const isTemperatureOptimal = data.avgTemperature >= 32 && data.avgTemperature <= 36;
  const isHumidityOptimal = data.avgHumidity >= 50 && data.avgHumidity <= 60;
  
  if (isTemperatureOptimal && isHumidityOptimal) {
    summary += `Overall, the hive conditions were excellent for colony health and honey production.`;
  } else if (isTemperatureOptimal || isHumidityOptimal) {
    summary += `Overall, the hive conditions were generally acceptable, but monitoring should continue.`;
  } else {
    summary += `Overall, the hive conditions require attention to ensure optimal colony health.`;
  }
  
  return summary;
};

// Get condition status for display
const getConditionStatus = (value: number, type: 'temperature' | 'humidity'): { status: 'optimal' | 'warning' | 'critical', icon: React.ReactNode } => {
  if (type === 'temperature') {
    if (value >= 32 && value <= 36) {
      return { status: 'optimal', icon: <CheckCircle className="w-5 h-5 text-green-500" /> };
    } else if (value >= 30 && value <= 38) {
      return { status: 'warning', icon: <Info className="w-5 h-5 text-amber-500" /> };
    } else {
      return { status: 'critical', icon: <AlertTriangle className="w-5 h-5 text-red-500" /> };
    }
  } else { // humidity
    if (value >= 50 && value <= 60) {
      return { status: 'optimal', icon: <CheckCircle className="w-5 h-5 text-green-500" /> };
    } else if (value >= 40 && value <= 70) {
      return { status: 'warning', icon: <Info className="w-5 h-5 text-amber-500" /> };
    } else {
      return { status: 'critical', icon: <AlertTriangle className="w-5 h-5 text-red-500" /> };
    }
  }
};

const HiveSummary: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [textSummary, setTextSummary] = useState<string>('');
  
  useEffect(() => {
    let start: Date;
    let end: Date = new Date();
    let interval: 'day' | 'month' = 'day';
    
    switch (dateRange) {
      case 'week':
        start = subDays(new Date(), 7);
        break;
      case 'month':
        start = subMonths(new Date(), 1);
        break;
      case 'year':
        start = subYears(new Date(), 1);
        interval = 'month';
        break;
      default:
        start = subDays(new Date(), 7);
    }
    
    // Generate summary data
    const newSummaryData = generateSummaryData(start, end, interval);
    setSummaryData(newSummaryData);
    
    // Generate text summary
    const summary = generateTextSummary(newSummaryData);
    setTextSummary(summary);
    
  }, [dateRange]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FileBarChart className="w-6 h-6 text-amber-500 mr-2" />
        <h1 className="text-2xl font-bold">Hive Condition Summary</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Time Period</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-md ${
              dateRange === 'week' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-md ${
              dateRange === 'month' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-md ${
              dateRange === 'year' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>
      
      {summaryData && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Generated Summary for {summaryData.period}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-amber-800 font-semibold border-b">Metric</th>
                    <th className="py-3 px-4 text-left text-amber-800 font-semibold border-b">Minimum</th>
                    <th className="py-3 px-4 text-left text-amber-800 font-semibold border-b">Maximum</th>
                    <th className="py-3 px-4 text-left text-amber-800 font-semibold border-b">Average</th>
                    <th className="py-3 px-4 text-left text-amber-800 font-semibold border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b font-medium">Temperature (°C)</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.minTemperature}°C
                        {getConditionStatus(summaryData.minTemperature, 'temperature').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.maxTemperature}°C
                        {getConditionStatus(summaryData.maxTemperature, 'temperature').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.avgTemperature}°C
                        {getConditionStatus(summaryData.avgTemperature, 'temperature').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {summaryData.avgTemperature >= 32 && summaryData.avgTemperature <= 36 
                        ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Optimal</span>
                        : summaryData.avgTemperature >= 30 && summaryData.avgTemperature <= 38
                          ? <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Acceptable</span>
                          : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Concerning</span>
                      }
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b font-medium">Humidity (%)</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.minHumidity}%
                        {getConditionStatus(summaryData.minHumidity, 'humidity').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.maxHumidity}%
                        {getConditionStatus(summaryData.maxHumidity, 'humidity').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        {summaryData.avgHumidity}%
                        {getConditionStatus(summaryData.avgHumidity, 'humidity').icon}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {summaryData.avgHumidity >= 50 && summaryData.avgHumidity <= 60 
                        ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Optimal</span>
                        : summaryData.avgHumidity >= 40 && summaryData.avgHumidity <= 70
                          ? <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Acceptable</span>
                          : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Concerning</span>
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Condition Analysis</h2>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <p className="text-amber-800">{textSummary}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <ul className="list-disc pl-5 text-blue-800 space-y-2">
                {summaryData.minTemperature < 30 && (
                  <li>Consider adding insulation to the hive to prevent temperature drops.</li>
                )}
                {summaryData.maxTemperature > 38 && (
                  <li>Provide additional ventilation or shade during hot periods.</li>
                )}
                {summaryData.minHumidity < 40 && (
                  <li>Place a water source near the hive to help bees regulate humidity.</li>
                )}
                {summaryData.maxHumidity > 70 && (
                  <li>Improve ventilation to reduce excess moisture in the hive.</li>
                )}
                <li>Continue regular monitoring to ensure optimal hive conditions.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HiveSummary;
