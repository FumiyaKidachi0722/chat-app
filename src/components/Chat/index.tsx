import React from 'react';

import { ArrowUp } from '../atoms/Icon/HeroIcons';

export const Chat = () => {
  return (
    <div className="bg-gray-200 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-gray-900 font-semibold mb-4">Room 1</h1>
      <div className="flex-grow overflow-y-auto mb-4">
        <div className="text-right">
          <div className="bg-blue-200 inline-block rounded px-4 py-2 mb-2">
            <p className="text-gray-900 font-medium">Hello</p>
          </div>
        </div>
        <div className="text-left">
          <div className="bg-green-200 inline-block rounded px-4 py-2 mb-2">
            <p className="text-gray-900 font-medium">Hello</p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="border-2 rounded w-full pr-10 focus:outline-none p-2"
        />
        <button className="absolute inset-y-0 right-2 flex items-center">
          <ArrowUp />
        </button>
      </div>
    </div>
  );
};
