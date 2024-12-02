'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { OverlaySpinner } from '@/components/atoms/Icon/OverlaySpinner';
import { Chat } from '@/components/Chat';
import { Sidebar } from '@/components/Sidebar';
import { RootState } from '@/redux/store';

export const HomeTemplate = () => {
  const userId = useSelector((state: RootState) => state.user.userId);
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      router.push('/auth/login');
    }
  }, [userId, router]);

  if (!userId) {
    <OverlaySpinner />;
    return null;
  }

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{ width: '1280px' }}>
        <div className="w-1/5 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
};
