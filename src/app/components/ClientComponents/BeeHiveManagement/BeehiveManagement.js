'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import  './BeehiveManagement.css';
import mqtt from 'mqtt';

const BeehiveManagement = ({email, username, password, hiveGroups, setHiveGroups}) => {
  const router = useRouter();
  const [selectedHive, setSelectedHive] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAddHiveConfirm, setShowAddHiveConfirm] = useState(false);
  const [pendingHiveAdd, setPendingHiveAdd] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Log when props change
  useEffect(() => {
    console.log('BeehiveManagement props updated:', { email, username, password: password ? '[PRESENT]' : '[MISSING]' });
  }, [email, username, password]);

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const addHive = async (groupId, hexIndex) => {
    // Check if this position already has a hive in the current state
    const existingHive = hiveGroups.find(g => g.id === groupId)?.hives.find(h => h.position === hexIndex);
    if (existingHive) {
      console.log('This position already has a hive');
      return;
    }
    // Store the pending hive information and show confirmation
    setPendingHiveAdd({ groupId, hexIndex });
    setShowAddHiveConfirm(true);
  };

  const handleConfirmAddHive = async () => {
    const { groupId, hexIndex } = pendingHiveAdd;
    
    // Calculate total hives across all groups for unique ID and naming
    const totalHives = hiveGroups.reduce((sum, g) => sum + g.hives.length, 0);
    
    const newHive = {
      id: totalHives + 1,
      name: `Hive ${totalHives + 1}`,
      position: hexIndex,
    };
    
    try {
      const response = await fetch('/api/beehive/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          hive: newHive,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add hive to the database');
      }

      // Only update the state after successful API call
      setHiveGroups(currentGroups => {
        const updatedGroups = currentGroups.map(group => {
          if (group.id !== groupId) return group;
          return {
            ...group,
            hives: [...group.hives, newHive]
          };
        });
        
        return updatedGroups;
      });

      setMessage({ text: 'Hive added successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (error) {
      console.error('Error adding hive:', error);
      setMessage({ text: error.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } finally {
      setShowAddHiveConfirm(false);
      setPendingHiveAdd(null);
    }
  };

  const handleCancelAddHive = () => {
    setShowAddHiveConfirm(false);
    setPendingHiveAdd(null);
  };

  // Function to handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target.className === 'logout-modal-overlay') {
      setShowAddHiveConfirm(false);
      setPendingHiveAdd(null);
    }
  };
  
  // Function to add a new group of hexagons
  const addNewGroup = () => {
    const newGroupId = hiveGroups.length + 1;
    setHiveGroups([...hiveGroups, { id: newGroupId, hives: [] }]);
  };
  
  // Function to handle hive selection
  const selectHive = async (hive) => {
    console.log('Selecting hive with password:', password ? '[PRESENT]' : '[MISSING]');
    setSelectedHive(hive);
    setIsLoading(true);
    setMessage({ text: 'Connecting to hive sensors...', type: 'info' });
    
    try {
      // Try to get password from props or sessionStorage
      const userPassword = password || sessionStorage.getItem('userPassword');
      
      if (!userPassword) {
        console.error('No password provided to BeehiveManagement');
        setMessage({ text: 'Error: Missing password', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        setIsLoading(false);
        return;
      }

      // Connect to MQTT and wait for initial data
      const client = mqtt.connect('ws://test.mosquitto.org:8080', {
        clientId: `hiveguard_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
      });

      let initialDataReceived = {
        temperature: false,
        humidity: false
      };

      // First, create variables to store both values
      let tempValue = null;
      let humidityValue = null;

      // Set a timeout for waiting for data
      const timeout = setTimeout(() => {
        client.end();
        setMessage({ text: 'Timeout waiting for hive data. Please try again.', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        setIsLoading(false);
      }, 10000); // 10 second timeout

      client.on('connect', () => {
        console.log('Connected to MQTT broker for initial data');
        const tempTopic = `${userPassword}/moldPrevention/hive${hive.id}/temp`;
        const humidityTopic = `${userPassword}/moldPrevention/hive${hive.id}/humidity`;
        
        client.subscribe([tempTopic, humidityTopic]);
      });

      client.on('message', (topic, message) => {
        const value = parseFloat(message.toString());
        if (isNaN(value)) return;

        if (topic.endsWith('/temp')) {
          tempValue = value;  
          initialDataReceived.temperature = true;
        } else if (topic.endsWith('/humidity')) {
          humidityValue = value;  
          initialDataReceived.humidity = true;
        }

        if (initialDataReceived.temperature && initialDataReceived.humidity) {
          clearTimeout(timeout);
          client.end();
          
          // Store the initial data with correct values
          localStorage.setItem(`hiveData_${hive.id}`, JSON.stringify({
            data: {
              temperature: tempValue,    
              humidity: humidityValue,   
              name: `Hive ${hive.id}`
            },
            timestamp: Date.now()
          }));

          router.push(`/hiveDetails?id=${hive.id}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(userPassword)}`);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT Error:', err);
        clearTimeout(timeout);
        client.end();
        setMessage({ text: 'Error connecting to hive sensors', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error fetching hive data:', error);
      setMessage({ text: 'Failed to load hive data', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      setIsLoading(false);
    }
  };
    
  const isGroupFull = (group) => {
    return group.hives.length >= 7; 
  };
  
  // Don't render until client-side to avoid hydration mismatch
  if (!mounted) return null;
  
  // Create a hexagon SVG with hive name
  const Hexagon = ({ filled, label, onClick }) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="hexagon-container" onClick={onClick}>
        <svg viewBox="0 0 100 100" width="170" height="170">
          <polygon 
            points="50 3, 95 25, 95 75, 50 97, 5 75, 5 25" 
            stroke={isDark ? "#e5e7eb" : "black"}
            strokeWidth="1.5"
            fill={filled ? (isDark ? "#3a3a3a" : "#f0f0f0") : (isDark ? "#2d2d2d" : "white")}
          />
          
          {filled ? (
            <>
              <text 
                x="50" 
                y="55" 
                textAnchor="middle" 
                style={{ fontWeight: 510 , fontFamily: 'FreeMono, monospace'}}
                fill={isDark ? "#f9fafb" : "black"}
              >
                {label}
              </text>
            </>
          ) : (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              fill={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' ,  fontFamily: 'FreeMono, monospace'}}
            >
              Add Hive
            </text>
          )}
        </svg>
      </div>
    );
  };
  
  return (
    <div className={`app-container theme-${theme}`}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading hive data...</p>
          </div>
        </div>
      )}
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="content-wrapper">
        <div className="header">
          <h1 className={`main-titlez ${theme === 'dark' ? 'dark' : 'light'}`}>Beehive Management</h1>
        </div>
        
        {/* Hexagon groups */}
        <div className="groups-container">
          {hiveGroups.map((group) => {
            // If this group is full and it's the last group, show an "Add Group" button
            const isLastGroup = group.id === hiveGroups.length;
            const showAddGroupButton = isGroupFull(group) && isLastGroup;
            
            return (
              <div key={group.id} className="group-wrapper">
                <div className="honeycomb-grid">
                  {/* Center hexagon (position 0) */}
                  <div className="center-hex">
                    {(() => {
                      const hexIndex = 0;
                      const existingHive = group.hives.find(hive => hive.position === hexIndex);
                      
                      return (
                        <Hexagon 
                          filled={!!existingHive}
                          label={existingHive?.name || ''}
                          onClick={() => existingHive ? selectHive(existingHive) : addHive(group.id, hexIndex)}
                        />
                      );
                    })()}
                  </div>
                  
                  {/* Surrounding hexagons (positions 1-6) */}
                  <div className="surrounding-hexes">
                    {[1, 2, 3, 4, 5, 6].map((index) => {
                      const existingHive = group.hives.find(hive => hive.position === index);
                      
                      // Calculate position based on index (60 degrees apart)
                      const angle = (index - 1) * 60;
                      const radian = angle * Math.PI / 180;
                      const radius = 155; // Adjusted to make hexagons touch with minimal gap
                      const top = Math.sin(radian) * radius;
                      const left = Math.cos(radian) * radius;
                      
                      return (
                        <div 
                          key={index} 
                          className="hex-position" 
                          style={{ 
                            transform: `translate(${left}px, ${top}px)` 
                          }}
                        >
                          <Hexagon 
                            filled={!!existingHive}
                            label={existingHive?.name || ''}
                            onClick={() => existingHive ? selectHive(existingHive) : addHive(group.id, index)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Group Label */}
                  <div className="group-label">
                    Group {group.id}
                  </div>
                </div>
                
                {/* Add Group Button */}
                {showAddGroupButton && (
                  <button 
                    onClick={addNewGroup}
                    className="add-group-button"
                  >
                    Add New Group
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Instructions */}
        <div className="instructions-card">
          <h2 className="instructions-title">How to use:</h2>
          <ul className="instructions-list">
            <li>You need to set up sensors in your hive to view temperature and humidity data</li>
            <li>Click on a hexagon to add a new hive or view existing hive details</li>
            <li>When a group is full, a new group can be added</li>
            <li>Total hives: {hiveGroups.reduce((sum, group) => sum + group.hives.length, 0)}</li>
          </ul>
        </div>
      </div>

      {/* Add Hive Confirmation Modal */}
      {showAddHiveConfirm && (
        <div className="logout-modal-overlay" onClick={handleOverlayClick}>
          <div className="logout-modal">
            <div className="logout-modal-content">
              <h3 className="logout-modal-title">Add New Beehive</h3>
              <p style={{ textAlign: 'center', marginBottom: '20px', color: theme === 'dark' ? '#e0e0e0' : '#333' }}>
                Are you sure you want to add a new beehive to this position?
              </p>
              <div className="logout-modal-buttons">
                <button 
                  onClick={handleCancelAddHive} 
                  className="logout-modal-button cancel-button"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAddHive} 
                  className="logout-modal-button confirm-button"
                >
                  Add Hive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeehiveManagement;