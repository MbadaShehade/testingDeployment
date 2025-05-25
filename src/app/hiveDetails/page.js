'use client';
export const dynamic = "force-dynamic";


import './hiveDetails.css';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Header from '../components/ClientComponents/Header/Header';
import { useRouter } from 'next/navigation';
import { Thermometer, Droplets, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import RealTimeTemperatureGraph from '../components/ClientComponents/RealTimeTemperatureGraph/RealTimeTemperatureGraph';
import RealTimeHumidityGraph from '../components/ClientComponents/RealTimeHumidityGraph/RealTimeHumidityGraph';
import HistoricalDataGraph from '../components/ClientComponents/HistoricalDataGraph/HistoricalDataGraph';
import TelegramModals from '../components/ClientComponents/TelegramModals/TelegramModals';
import ClearHistoryModal from '../components/ClientComponents/ClearHistoryModal/ClearHistoryModal';
import mqtt from 'mqtt';
import { Chart } from 'chart.js/auto';
import { MQTT_URL } from '../_lib/mqtt-config';
import { checkMQTTMonitorStatus } from '@/app/_lib/mqtt-helpers';
import { saveTimerState, loadTimerState, clearTimerState } from '@/app/_lib/timerStorage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import HiveDetailsComponent from './HiveDetailsComponent';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_DATA_POINTS = 10;

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const sortDates = (dates) => {
  if (!Array.isArray(dates)) return [];
  return [...new Set(dates)].sort();
};

export default function PageWrapper(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HiveDetailsComponent {...props} />
    </Suspense>
  );
}