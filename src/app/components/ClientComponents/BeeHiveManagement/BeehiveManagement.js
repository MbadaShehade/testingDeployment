'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import  './BeehiveManagement.css';

const BeehiveManagement = ({email, username}) => {
  const router = useRouter();
  const [selectedHive, setSelectedHive] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAddHiveConfirm, setShowAddHiveConfirm] = useState(false);
  const [pendingHiveAdd, setPendingHiveAdd] = useState(null);

  const [hiveGroups, setHiveGroups] = useState([
    {
      id: 1,
      hives: []
    }
  ]);

  // Initialize EventSource connection for MongoDB Change Streams
  useEffect(() => {
    // Create EventSource connection to the server endpoint
    const eventSource = new EventSource(`/api/beehive/changes?email=${encodeURIComponent(email)}`);

    // Listen for hive updates from the change stream
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received hive update:', data);
      // Update the UI with the latest data
      if (data.beehives) {
        setHiveGroups(data.beehives);
      }
    };

    // Handle any errors
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    // Initial fetch of hives
    fetchAllHives();

    return () => {
      eventSource.close();
    };
  }, [email]);

  const fetchAllHives = async () => {
    try {
      const response = await fetch('/api/beehive/fetchAllHives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hives');
      }

      const data = await response.json();
      if (!data.beehives || data.beehives.length === 0) {
        setHiveGroups([{
          id: 1,
          hives: []
        }]);
      } else {
        setHiveGroups(data.beehives);
      }
    } catch (error) {
      console.error('Error fetching hives:', error);
      setHiveGroups([{
        id: 1,
        hives: []
      }]);
    }
  }

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    fetchAllHives();
  }, [email]);

  // Function to add a new hive
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

  // Function to handle confirmed hive addition
  const handleConfirmAddHive = async () => {
    const { groupId, hexIndex } = pendingHiveAdd;
    
    // Calculate total hives across all groups for unique ID and naming
    const totalHives = hiveGroups.reduce((sum, g) => sum + g.hives.length, 0);
    
    // Create a new hive
    const newHive = {
      id: totalHives + 1,
      name: `Hive ${totalHives + 1}`,
      position: hexIndex,
      hasAlert: false,
      temperature: null,
      humidity: null,
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

      // After successful add, force an immediate fetch
      await fetchAllHives();

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

  // Function to handle canceling hive addition
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
  const selectHive = (hive) => {
    router.push(`/hiveDetails?id=${hive.id}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
  };
  
  // Function to return to main view
  const returnToMain = () => {
    setSelectedHive(null);
  };
  
  // Function to resolve an alert
  const resolveAlert = () => {
    setHiveGroups(currentGroups => {
      return currentGroups.map(group => {
        return {
          ...group,
          hives: group.hives.map(hive => {
            if (hive.id === selectedHive.id) {
              return {
                ...hive,
                hasAlert: false,
              };
            }
            return hive;
          })
        };
      });
    });
    
    setSelectedHive(prev => ({
      ...prev,
      hasAlert: false,
    }));
  };
  
  // Check if a group is full (all positions have hives)
  const isGroupFull = (group) => {
    return group.hives.length >= 7; // 7 hexagons per group
  };
  
  // Get total alerts count
  const getTotalAlerts = () => {
    return hiveGroups.reduce((sum, group) => {
      return sum + group.hives.filter(hive => hive.hasAlert).length;
    }, 0);
  };
  
  // Don't render until client-side to avoid hydration mismatch
  if (!mounted) return null;
  
  // Create a hexagon SVG with hive name and alert icon if needed
  const Hexagon = ({ filled, label, hasAlert, onClick }) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="hexagon-container" onClick={onClick}>
        <svg viewBox="0 0 100 100" width="170" height="170">
          <polygon 
            points="50 3, 95 25, 95 75, 50 97, 5 75, 5 25" 
            stroke={hasAlert ? "#e53e3e" : (isDark ? "#e5e7eb" : "black")}
            strokeWidth={hasAlert ? "4" : "1.5"}
            fill={filled ? (hasAlert ? "#fff5f5" : (isDark ? "#3a3a3a" : "#f0f0f0")) : (isDark ? "#2d2d2d" : "white")}
          />
          
          {filled ? (
            <>
              <text 
                x="50" 
                y={hasAlert ? "45" : "55"} 
                textAnchor="middle" 
                style={{ fontWeight: 510 , fontFamily: 'FreeMono, monospace'}}
                fill={hasAlert ? "#e53e3e" : (isDark ? "#f9fafb" : "black")}
              >
                {label}
              </text>
              
              {hasAlert && (
                <g transform="translate(50, 70)">
                  <circle cx="0" cy="0" r="13" fill="#e53e3e" />
                  <text 
                    x="0" 
                    y="5" 
                    textAnchor="middle" 
                    fill="white" 
                    style={{ fontWeight: 700, fontSize: '20px' }}
                  >
                    !
                  </text>
                </g>
              )}
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
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="content-wrapper">
        <div className="header">
          <h1 className={`main-titlez ${theme === 'dark' ? 'dark' : 'light'}`}>Beehive Management</h1>
          
          {/* Alert indicator in header */}
          {getTotalAlerts() > 0 && (
            <div className="header-alert">
              <AlertTriangle className="header-alert-icon" size={18} />
              <span className="header-alert-text">
                {getTotalAlerts()} {getTotalAlerts() === 1 ? 'hive needs' : 'hives need'} attention
              </span>
            </div>
          )}
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
                          hasAlert={existingHive?.hasAlert}
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
                            hasAlert={existingHive?.hasAlert}
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
            <li>Click on a hexagon to add a new hive or view existing hive details</li>
            <li>When a group is full, a new group can be added</li>
            <li>Red-bordered hexagons with &ldquo;!&rdquo; indicate alerts that need attention</li>
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
