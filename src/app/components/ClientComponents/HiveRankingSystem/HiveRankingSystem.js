'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { AlertTriangle, ThermometerSun, Droplets, Shield } from 'lucide-react';
import './HiveRankingSystem.css';

const HiveRankingSystem = ({ hiveGroups }) => {
  const { theme } = useTheme();
  const [rankedHives, setRankedHives] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('overall');

  // Weights for different factors
  const weights = {
    temperature: 0.4,    // 40% weight for temperature
    humidity: 0.4,       // 40% weight for humidity
    stability: 0.2       // 20% weight for environmental stability
  };

  // Calculate scores and rank hives
  useEffect(() => {
    if (!hiveGroups) return;

    const calculateHiveScore = (hive) => {
      // Temperature score (optimal range: 32-36°C)
      const tempScore = hive.temperature ? (
        hive.temperature >= 32 && hive.temperature <= 36 ? 100 :
        hive.temperature >= 30 && hive.temperature < 32 ? 80 :
        hive.temperature > 36 && hive.temperature <= 38 ? 80 :
        hive.temperature >= 28 && hive.temperature < 30 ? 60 :
        hive.temperature > 38 && hive.temperature <= 40 ? 60 : 40
      ) : 0;

      // Humidity score (optimal range: 50-70%)
      const humidityScore = hive.humidity ? (
        hive.humidity >= 50 && hive.humidity <= 70 ? 100 :
        hive.humidity >= 45 && hive.humidity < 50 ? 80 :
        hive.humidity > 70 && hive.humidity <= 75 ? 80 :
        hive.humidity >= 40 && hive.humidity < 45 ? 60 :
        hive.humidity > 75 && hive.humidity <= 80 ? 60 : 40
      ) : 0;

      // Stability score (based on alert status)
      const stabilityScore = hive.hasAlert ? 40 : 100;

      // Calculate weighted score
      const overallScore = (
        tempScore * weights.temperature +
        humidityScore * weights.humidity +
        stabilityScore * weights.stability
      );

      return {
        ...hive,
        scores: {
          temperature: tempScore,
          humidity: humidityScore,
          stability: stabilityScore,
          overall: Math.round(overallScore)
        }
      };
    };

    // Process all hives
    const allHives = hiveGroups.flatMap(group => 
      group.hives.map(hive => ({
        ...hive,
        groupId: group.id
      }))
    );

    const scoredHives = allHives.map(calculateHiveScore);
    const sortedHives = [...scoredHives].sort((a, b) => b.scores[sortCriteria] - a.scores[sortCriteria]);
    setRankedHives(sortedHives);
  }, [hiveGroups, sortCriteria]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className={`ranking-system ${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="ranking-header">
        <h2>Hive Health Ranking</h2>
        <div className="sorting-controls">
          <label>Sort by:</label>
          <select 
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className={`sort-select ${theme === 'dark' ? 'dark' : 'light'}`}
          >
            <option value="overall">Overall Health</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
          </select>
        </div>
      </div>

      <div className="hives-grid">
        {rankedHives.map((hive, index) => (
          <div key={hive.id} className={`hive-card ${theme === 'dark' ? 'dark' : 'light'}`}>
            <div className="hive-card-header">
              <h3>{hive.name}</h3>
              <span className="rank">#{index + 1}</span>
            </div>
            
            <div className="score-details">
              <div className="score-item">
                <ThermometerSun size={20} />
                <span className="score-label">Temperature</span>
                <span className={`score-value ${getScoreColor(hive.scores.temperature)}`}>
                  {hive.scores.temperature}
                </span>
              </div>
              
              <div className="score-item">
                <Droplets size={20} />
                <span className="score-label">Humidity</span>
                <span className={`score-value ${getScoreColor(hive.scores.humidity)}`}>
                  {hive.scores.humidity}
                </span>
              </div>
              
              <div className="score-item">
                <Shield size={20} />
                <span className="score-label">Stability</span>
                <span className={`score-value ${getScoreColor(hive.scores.stability)}`}>
                  {hive.scores.stability}
                </span>
              </div>
            </div>

            <div className="overall-score">
              <div className="score-circle">
                <span className="score-number">{hive.scores.overall}</span>
                <span className="score-label">Overall</span>
              </div>
              <div className={`health-status ${getHealthStatus(hive.scores.overall).toLowerCase().replace(' ', '-')}`}>
                {getHealthStatus(hive.scores.overall)}
              </div>
            </div>

            {hive.hasAlert && (
              <div className="alert-indicator">
                <AlertTriangle size={16} />
                <span>Needs Attention</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ranking-info">
        <h3>About This Ranking</h3>
        <p>
          Hives are ranked based on a weighted scoring system that considers:
        </p>
        <ul>
          <li>Temperature (40%): Optimal range 32-36°C</li>
          <li>Humidity (40%): Optimal range 50-70%</li>
          <li>Environmental Stability (20%): Based on alert status</li>
        </ul>
      </div>
    </div>
  );
};

export default HiveRankingSystem; 