'use client';
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/ClientComponents/Header/Header';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import BeehiveManagement from '../components/ClientComponents/BeeHiveManagement/BeehiveManagement';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import './loggedIn.css';
import React, { Suspense } from 'react';
import LoggedInPageInner from './LoggedInPageInner';

export default function LoggedInPageWrapper(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoggedInPageInner {...props} />
    </Suspense>
  );
}
