'use client';

import React, { useState } from 'react';
import { Portal } from '@/components/Portal';
import { CSVImport } from './index';

export const CSVImportButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="w-full cursor-pointer flex items-center justify-between border mt-2 rounded-md hover:bg-blue-100 duration-150 px-4 py-3 text-gray-900"
        onClick={() => setOpen(true)}
        aria-label="Open CSV Import"
      >
        <span className="font-semibold">CSV インポート</span>
        <span className="text-xl">⇪</span>
      </button>

      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">CSV インポート</h2>
                <button
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <CSVImport />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default CSVImportButton;

