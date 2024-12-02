import React from 'react';

import { Chat } from '@/components/Chat';
import { Sidebar } from '@/components/Sidebar';

export const HomeTemplate = () => {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{ width: '1280px' }}>
        <div className="w-1/5 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full border-r">
          <Chat />
        </div>
      </div>
    </div>
  );
};
