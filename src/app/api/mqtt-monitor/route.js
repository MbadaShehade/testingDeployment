import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/_lib/mongodb';
import mqtt from 'mqtt';

// Global variables to track air pump activations across all hives
const activePumps = {};
let mqttClient = null;
let isMonitoring = false;

// Start monitoring function to track MQTT messages
function startMonitoring() {
  if (isMonitoring) return; // Don't start multiple monitoring instances
  
  try {
    // Connect to MQTT broker
    mqttClient = mqtt.connect('ws://test.mosquitto.org:8080', {
      clientId: `server_monitor_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000
    });
    
    // Set up listeners
    mqttClient.on('connect', () => {
      console.log('[MQTT Monitor] Connected to MQTT broker');
      isMonitoring = true;
      
      // Subscribe to wildcard topic to capture all air pump messages
      mqttClient.subscribe('+/moldPrevention/+/airPump', (err) => {
        if (err) {
          console.error('[MQTT Monitor] Failed to subscribe to air pump topics:', err);
        } else {
          console.log('[MQTT Monitor] Subscribed to air pump topics');
        }
      });
    });
    
    mqttClient.on('message', async (topic, message) => {
      try {
        // Parse the topic to extract password (user identifier) and hiveId
        // Format: {password}/moldPrevention/hive{hiveId}/airPump
        const topicParts = topic.split('/');
        if (topicParts.length !== 4 || !topicParts[2].startsWith('hive')) {
          return; // Invalid topic format
        }
        
        const userPassword = topicParts[0];
        const hiveId = topicParts[2].replace('hive', '');
        const status = message.toString();
        
        console.log(`[MQTT Monitor] Received air pump status for hive ${hiveId}: ${status}`);
        
        // Get the associated email from the database using the password
        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ password: userPassword });
        
        if (!user) {
          console.log(`[MQTT Monitor] No user found with password: ${userPassword}`);
          return;
        }
        
        const email = user.email;
        const username = user.username || 'User';
        
        if (status === 'ON') {
          // Start tracking activation
          if (!activePumps[`${hiveId}-${email}`]) {
            activePumps[`${hiveId}-${email}`] = {
              startTime: new Date(),
              hiveId,
              email,
              username
            };
            console.log(`[MQTT Monitor] Started tracking air pump for hive ${hiveId}`);
          }
        } else if (status === 'OFF') {
          // End tracking and save activation
          const pumpKey = `${hiveId}-${email}`;
          if (activePumps[pumpKey]) {
            const startTime = activePumps[pumpKey].startTime;
            const endTime = new Date();
            const durationMs = endTime - startTime;
            
            // Format duration as HH:MM:SS
            const hours = Math.floor(durationMs / 3600000);
            const minutes = Math.floor((durationMs % 3600000) / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Format date as DD/MM/YYYY HH:MM
            const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = startTime.toLocaleDateString('en-GB', dateOptions).replace(',', '');
            
            // Create activation record
            const activation = {
              date: formattedDate,
              duration: formattedDuration,
              hiveId,
              email,
              username: activePumps[pumpKey].username,
              timestamp: new Date().toISOString()
            };
            
            // Save to database
            try {
              // Try to update user document
              const updateResult = await db.collection('users').updateOne(
                { email, "beehives.id": hiveId },
                { $push: { "beehives.$.airPumpActivations": activation } }
              );
              
              // Also save to dedicated collection
              await db.collection('air_pump_activations').insertOne(activation);
              
              console.log(`[MQTT Monitor] Saved air pump activation for hive ${hiveId}, duration: ${formattedDuration}`);
              
              // Clean up tracking
              delete activePumps[pumpKey];
            } catch (dbError) {
              console.error('[MQTT Monitor] Error saving activation:', dbError);
            }
          }
        }
      } catch (error) {
        console.error('[MQTT Monitor] Error processing message:', error);
      }
    });
    
    mqttClient.on('error', (err) => {
      console.error('[MQTT Monitor] Connection error:', err);
      isMonitoring = false;
    });
    
    mqttClient.on('close', () => {
      console.log('[MQTT Monitor] Connection closed');
      isMonitoring = false;
    });
    
  } catch (error) {
    console.error('[MQTT Monitor] Error setting up MQTT client:', error);
    isMonitoring = false;
  }
}

// GET endpoint to check monitoring status and start if needed
export async function GET() {
  if (!isMonitoring) {
    startMonitoring();
    return NextResponse.json({ status: 'started', message: 'MQTT monitoring started' });
  }
  
  return NextResponse.json({ 
    status: 'running', 
    message: 'MQTT monitoring is already running',
    activePumps: Object.keys(activePumps).length
  });
}

// In Next.js 13+, we can't use an actual background service
// But we can start the monitor on first API call
startMonitoring();

export async function POST() {
  return NextResponse.json({ status: 'not_implemented', message: 'POST method is not implemented' });
} 