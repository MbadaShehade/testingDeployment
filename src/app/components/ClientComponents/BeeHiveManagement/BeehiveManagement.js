'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import './BeehiveManagement.css';

const BeehiveManagement = () => {
  const [hiveGroups, setHiveGroups] = useState([
    { 
      id: 1, 
      hives: [
        {
          id: 1,
          name: 'Hive 1',
          position: 2,
          condition: 'Good',
          lastInspection: new Date().toLocaleDateString()
        },
        {
          id: 2,
          name: 'Hive 2',
          position: 4,
          condition: 'Alert: Low Population',
          hasAlert: true,
          lastInspection: new Date().toLocaleDateString()
        }
      ] 
    }
  ]);
  const [selectedHive, setSelectedHive] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Function to add a new hive
  const addHive = (groupId, hexIndex) => {
    setHiveGroups(currentGroups => {
      return currentGroups.map(group => {
        if (group.id !== groupId) return group;
        
        // Check if this position already has a hive
        if (group.hives.some(hive => hive.position === hexIndex)) {
          return group;
        }
        
        // Calculate total hives across all groups for unique ID and naming
        const totalHives = currentGroups.reduce((sum, g) => sum + g.hives.length, 0);
        
        // Create a new hive
        const newHive = {
          id: totalHives + 1,
          name: `Hive ${totalHives + 1}`,
          position: hexIndex,
          condition: 'Good',
          hasAlert: false,
          lastInspection: new Date().toLocaleDateString()
        };
        
        return {
          ...group,
          hives: [...group.hives, newHive]
        };
      });
    });
  };
  
  // Function to add a new group of hexagons
  const addNewGroup = () => {
    const newGroupId = hiveGroups.length + 1;
    setHiveGroups([...hiveGroups, { id: newGroupId, hives: [] }]);
  };
  
  // Function to handle hive selection
  const selectHive = (hive) => {
    setSelectedHive(hive);
    setIsDetailView(true);
  };
  
  // Function to return to main view
  const returnToMain = () => {
    setIsDetailView(false);
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
                condition: 'Good - Resolved',
                lastInspection: new Date().toLocaleDateString()
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
      condition: 'Good - Resolved',
      lastInspection: new Date().toLocaleDateString()
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
  
  // Render hexagon grid or detail view
  if (isDetailView && selectedHive) {
    return (
      <div className={`detail-view-container theme-${theme}`}>
        <div className="detail-card">
          <div className="detail-header">
            <h1 className="detail-title">{selectedHive.name} Details</h1>
            {selectedHive.hasAlert && (
              <div className="alert-badge">
                <AlertTriangle className="alert-icon" size={16} />
                <span className="alert-text">Alert</span>
              </div>
            )}
          </div>
          
          <div className="detail-content">
            <p className="detail-info">
              <span className="detail-label">Condition: </span> 
              <span className={selectedHive.hasAlert ? "alert-condition" : ""}>
                {selectedHive.condition}
              </span>
            </p>
            <p className="detail-info"><span className="detail-label">Last Inspection:</span> {selectedHive.lastInspection}</p>
            
            {selectedHive.hasAlert && (
              <div className="alert-details">
                <h3 className="alert-details-title">Alert Details</h3>
                <p>This hive shows signs of population decline. Immediate inspection is recommended to check for:</p>
                <ul className="alert-list">
                  <li>Queen health and egg-laying patterns</li>
                  <li>Parasites or disease presence</li>
                  <li>Food stores adequacy</li>
                </ul>
              </div>
            )}
            
            <p className="additional-info">Additional hive information would appear here.</p>
          </div>
          
          <div className="detail-actions">
            <button 
              onClick={returnToMain}
              className="back-button"
            >
              Back to Hive Overview
            </button>
            
            {selectedHive.hasAlert && (
              <button 
                onClick={resolveAlert}
                className="resolve-button"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create a hexagon SVG that matches the image style
  const Hexagon = ({ filled, label, hasAlert, onClick }) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="hexagon-container" onClick={onClick}>
        <svg viewBox="0 0 100 100" width="100" height="100">
          <polygon 
            points="50 3, 95 25, 95 75, 50 97, 5 75, 5 25" 
            stroke={hasAlert ? "#e53e3e" : (isDark ? "#e5e7eb" : "black")}
            strokeWidth={hasAlert ? "4" : "3"}
            fill={filled ? (hasAlert ? "#fff5f5" : (isDark ? "#3a3a3a" : "#f0f0f0")) : (isDark ? "#2d2d2d" : "white")}
          />
          
          {filled ? (
            <>
              <text 
                x="50" 
                y={hasAlert ? "45" : "55"} 
                textAnchor="middle" 
                style={{ fontWeight: 600 }}
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
              style={{ fontSize: '12px' }}
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
      <div className="content-wrapper">
        <div className="header">
          <h1 className={`main-title ${theme === 'dark' ? 'dark' : 'light'}`}>Beehive Management</h1>
          
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
                      const top = Math.sin(radian) * 95;
                      const left = Math.cos(radian) * 95;
                      
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
    </div>
  );
};

export default BeehiveManagement;