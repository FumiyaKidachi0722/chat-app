'use client';

import React, { useEffect, useState } from 'react';

import { Portal } from '@/components/Portal';

export const OpenAIKeyButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [masked, setMasked] = useState('');

  useEffect(() => {
    const k = localStorage.getItem('openai_api_key');
    if (k) setMasked(maskKey(k));
  }, []);

  return (
    <>
      <button
        className="w-full cursor-pointer flex items-center justify-between border mt-2 rounded-md hover:bg-blue-100 duration-150 px-4 py-3 text-gray-900"
        onClick={() => setOpen(true)}
        aria-label="Open OpenAI key settings"
      >
        <span className="font-semibold">API キー</span>
        <span className="text-xs text-gray-600">{masked || '未設定'}</span>
      </button>

      {open && (
        <OpenAIKeyModal
          onClose={() => setOpen(false)}
          onSaved={(k) => setMasked(maskKey(k))}
        />
      )}
    </>
  );
};

export const OpenAIKeyModal: React.FC<{
  onClose: () => void;
  onSaved: (key: string) => void;
}> = ({ onClose, onSaved }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const k = localStorage.getItem('openai_api_key');
    if (k) setValue(k);
  }, []);

  const save = () => {
    const v = value.trim();
    if (!v) {
      setError('キーを入力してください');
      return;
    }
    try {
      localStorage.setItem('openai_api_key', v);
      onSaved(v);
      onClose();
    } catch {
      setError('保存に失敗しました');
    }
  };

  const remove = () => {
    localStorage.removeItem('openai_api_key');
    onSaved('');
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">OpenAI API キー</h2>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-3">
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="sk-..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded border" onClick={remove}>
                削除
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                onClick={save}
              >
                保存
              </button>
            </div>
            <p className="text-xs text-gray-600">
              キーはブラウザのローカルストレージにのみ保存され、サーバーやDBには保存されません。
            </p>
          </div>
        </div>
      </div>
    </Portal>
  );
};

function maskKey(k: string) {
  if (k.length <= 8) return '••••';
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

export default OpenAIKeyButton;
