import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Monitor hive conditions and return a report
 * @param {string} userId - The ID of the user
 * @param {string} hiveId - The ID of the hive to monitor
 * @returns {Promise<Object>} Result with success status and optional data
 */
export async function monitorHiveConditions(userId, hiveId) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const hives = db.collection('hives');
    
    // Find the hive
    const hive = await hives.findOne({ 
      _id: new ObjectId(hiveId),
      userId: userId 
    });
    
    if (!hive) {
      return { 
        success: false, 
        message: 'Hive not found' 
      };
    }
    
    // Get the latest sensor readings
    // In a real implementation, you might query from a time-series collection
    // For now, we'll use the data stored in the hive document
    const temperature = hive.temperature || 25; // Default value if not available
    const humidity = hive.humidity || 60; // Default value if not available
    
    // Analyze conditions
    const isTemperatureOk = temperature >= 20 && temperature <= 35;
    const isHumidityOk = humidity >= 40 && humidity <= 70;
    const overallStatus = isTemperatureOk && isHumidityOk ? 'healthy' : 'attention_needed';
    
    // Prepare recommendations
    let recommendations = [];
    
    if (!isTemperatureOk) {
      if (temperature < 20) {
        recommendations.push('Hive temperature is too low. Consider adding insulation.');
      } else {
        recommendations.push('Hive temperature is too high. Ensure adequate ventilation.');
      }
    }
    
    if (!isHumidityOk) {
      if (humidity < 40) {
        recommendations.push('Hive humidity is too low. Consider adding a water source nearby.');
      } else {
        recommendations.push('Hive humidity is too high. Risk of mold formation. Improve ventilation.');
      }
    }
    
    // Return monitoring results
    return {
      success: true,
      data: {
        hiveId,
        timestamp: new Date(),
        readings: {
          temperature,
          humidity
        },
        analysis: {
          status: overallStatus,
          temperatureStatus: isTemperatureOk ? 'normal' : 'abnormal',
          humidityStatus: isHumidityOk ? 'normal' : 'abnormal'
        },
        recommendations
      }
    };
    
  } catch (error) {
    console.error('Error monitoring hive conditions:', error);
    return {
      success: false,
      message: 'Failed to monitor hive conditions: ' + error.message
    };
  }
} 