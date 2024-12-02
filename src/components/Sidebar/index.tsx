import React from 'react';

import { ArrowRightStartOnRectangle } from '../atoms/Icon/HeroIcons';

export const Sidebar = () => {
  return (
    <div
      className="h-full overflow-y-auto px-5 flex flex-col"
      style={{
        backgroundColor: '#f8f4ec',
      }}
    >
      <div className="flex-grow">
        <div className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-100 duration-150">
          <span className="text-gray-900 p-4 text-2xl">+</span>
          <h1 className="text-gray-900 text-lg font-semibold p-4">New Chat</h1>
        </div>
        <ul>
          <li className="curspr-pointer border-b p-4 text-gray-900 hover:bg-blue-100 duration-150">
            Room 1
          </li>
          <li className="curspr-pointer border-b p-4 text-gray-900 hover:bg-blue-100 duration-150">
            Room 2
          </li>
        </ul>
      </div>

      <div className="text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 text-slate-600 hover:bg-slate-200 duration-150">
        <span>ログアウト</span>
        <ArrowRightStartOnRectangle />
      </div>
    </div>
  );
};
