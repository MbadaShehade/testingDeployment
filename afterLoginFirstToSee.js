import React, { useState } from 'react';

const BeehiveManagement = () => {
  const [hiveGroups, setHiveGroups] = useState([
    { id: 1, hives: [] }
  ]);
  const [selectedHive, setSelectedHive] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  
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
  
  // Check if a group is full (all positions have hives)
  const isGroupFull = (group) => {
    return group.hives.length >= 7; // 7 hexagons per group
  };
  
  // Render hexagon grid or detail view
  if (isDetailView && selectedHive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-bold text-amber-800 mb-4">{selectedHive.name} Details</h1>
          <div className="mb-4">
            <p className="text-lg"><span className="font-semibold">Condition:</span> {selectedHive.condition}</p>
            <p className="text-lg"><span className="font-semibold">Last Inspection:</span> {selectedHive.lastInspection}</p>
            <p className="text-lg text-gray-600 italic mt-4">Additional hive information would appear here.</p>
          </div>
          <button 
            onClick={returnToMain}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Back to Hive Overview
          </button>
        </div>
      </div>
    );
  }

  // Create a hexagon SVG that matches the image style
  const Hexagon = ({ filled, label, onClick }) => (
    <div className="hexagon-container" onClick={onClick}>
      <svg viewBox="0 0 100 100" width="100" height="100">
        <polygon 
          points="50 3, 95 25, 95 75, 50 97, 5 75, 5 25" 
          stroke="black"
          strokeWidth="3"
          fill={filled ? "#f0f0f0" : "white"}
        />
        
        {filled ? (
          <text 
            x="50" 
            y="55" 
            textAnchor="middle" 
            className="font-semibold"
            fill="black"
          >
            {label}
          </text>
        ) : (
          <text 
            x="50" 
            y="55" 
            textAnchor="middle" 
            fontSize="12"
            className="font-medium"
            fill="#999999"
          >
            Add Hive
          </text>
        )}
      </svg>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Beehive Management</h1>
      <p className="text-center mb-6 text-gray-700">Click on a hexagon to add a new hive or view details</p>
      
      {/* Hexagon groups */}
      <div className="flex flex-wrap justify-center gap-16">
        {hiveGroups.map((group) => {
          // If this group is full and it's the last group, show an "Add Group" button
          const isLastGroup = group.id === hiveGroups.length;
          const showAddGroupButton = isGroupFull(group) && isLastGroup;
          
          return (
            <div key={group.id} className="relative mb-16">
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
                    const top = Math.sin(radian) * 95;
                    const left = Math.cos(radian) * 95;
                    
                    return (
                      <div 
                        key={index} 
                        className="absolute hex-position" 
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
                <div className="text-center mt-20 font-medium text-gray-700">
                  Group {group.id}
                </div>
              </div>
              
              {/* Add Group Button */}
              {showAddGroupButton && (
                <button 
                  onClick={addNewGroup}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Add New Group
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-8 text-center p-4 bg-white rounded-lg shadow max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">How to use:</h2>
        <ul className="text-left pl-6 list-disc">
          <li className="mb-1">Click on a hexagon to add a new hive or view existing hive details</li>
          <li className="mb-1">When a group is full, a new group can be added</li>
          <li>Total hives: {hiveGroups.reduce((sum, group) => sum + group.hives.length, 0)}</li>
        </ul>
      </div>
      
      {/* CSS for honeycomb layout with proper spacing */}
      <style jsx>{`
        .honeycomb-grid {
          position: relative;
          width: 300px;
          height: 300px;
        }
        
        .center-hex {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        
        .surrounding-hexes {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
        }
        
        .hex-position {
          margin-top: -45px;
          margin-left: -45px;
        }
        
        .hexagon-container {
          width: 90px;
          height: 90px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .hexagon-container:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default BeehiveManagement;
