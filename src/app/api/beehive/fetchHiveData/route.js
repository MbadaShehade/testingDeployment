import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { hiveId, email } = await request.json();

    // For now, return mock data
    // In a real application, you would fetch this from your database
    const mockData = {
      name: `Hive ${hiveId}`,
      temperature: 32.5 + (Math.random() * 2 - 1), // Random temperature between 31.5 and 33.5
      humidity: 55 + (Math.random() * 10 - 5),     // Random humidity between 50 and 60
      historicalData: {
        labels: generateDateLabels(7),
        datasets: [
          {
            label: 'Temperature (°C)',
            data: generateRandomData(7, 32.5, 1),
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
            data: generateRandomData(7, 55, 5),
            borderColor: '#0EA5E9',
            backgroundColor: '#0EA5E9',
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2,
            fill: false,
            yAxisID: 'y2'
          }
        ]
      },
      summaryData: {
        labels: generateDateLabels(7),
        datasets: [
          {
            label: 'Temperature (°C)',
            data: generateRandomData(7, 32.5, 1),
            borderColor: '#ba6719',
            backgroundColor: '#ba6719',
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Humidity (%)',
            data: generateRandomData(7, 55, 5),
            borderColor: '#0EA5E9',
            backgroundColor: '#0EA5E9',
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2,
            fill: false,
            yAxisID: 'humidity'
          }
        ]
      },
      analysisData: {
        tempAvg: 32.5,
        tempMin: 31.5,
        tempMax: 33.5,
        humidityAvg: 55,
        humidityMin: 50,
        humidityMax: 60
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error in fetchHiveData:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hive data' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get the hiveId from the query parameters
    const params = new URL(request.url).searchParams;
    const hiveId = params.get('hiveId');
    
    if (!hiveId) {
      return NextResponse.json({ 
        error: 'Missing hiveId parameter' 
      }, { status: 400 });
    }
    
    // Since we're in a server-side API route, we can't directly access localStorage
    // For this specific example, we'll return dummy data that will be overridden
    // by the data from localStorage on the client side
    
    // In a production app, you'd query your database here
    const dummyData = {
      temperature: 33.5,
      humidity: 55.2
    };
    
    return NextResponse.json(dummyData);
  } catch (error) {
    console.error('Error fetching hive data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hive data: ' + error.message 
    }, { status: 500 });
  }
}

// Helper function to generate date labels
function generateDateLabels(days) {
  const labels = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }));
  }
  return labels;
}

// Helper function to generate random data
function generateRandomData(count, baseline, variance) {
  return Array(count).fill(0).map(() => 
    baseline + (Math.random() * variance * 2 - variance)
  );
} 