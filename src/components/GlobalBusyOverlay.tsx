'use client';

import React from 'react';
import { useSelector } from 'react-redux';

import { OverlaySpinner } from '@/components/Icon/OverlaySpinner';
import type { RootState } from '@/redux/store';

export const GlobalBusyOverlay: React.FC = () => {
  const isBusy = useSelector((s: RootState) => s.ui.isBusy);
  if (!isBusy) return null;
  return <OverlaySpinner />;
};

export default GlobalBusyOverlay;
