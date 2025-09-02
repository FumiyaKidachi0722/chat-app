'use client';

import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import type { RootState } from '@/redux/store';
import { setBusy } from '@/redux/uiSlice';
import { gptResponse } from '@/hooks/openai';

type ParsedRow = {
  room_name: string;
  message: string;
};

function parseCsv(text: string): ParsedRow[] {
  // Minimal CSV parser for headers: room_name,message
  // Assumes no embedded commas or quotes; trims whitespace.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const roomIdx = header.indexOf('room_name');
  const msgIdx = header.indexOf('message');
  if (roomIdx === -1 || msgIdx === -1) return [];
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const room = (cols[roomIdx] || '').trim();
    const msg = (cols[msgIdx] || '').trim();
    if (room && msg) rows.push({ room_name: room, message: msg });
  }
  return rows;
}

export const CSVImport: React.FC = () => {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.user.userId);
  const dispatch = useDispatch();

  const onSelect = async (f: File) => {
    setIsParsing(true);
    setFeedback(null);
    try {
      const text = await f.text();
      const parsed = parseCsv(text);
      setRows(parsed);
      if (parsed.length === 0) {
        setFeedback('CSVの形式は room_name,message のヘッダーが必要です。');
      }
    } catch (e: any) {
      setFeedback('CSVの読み込みに失敗しました。');
    } finally {
      setIsParsing(false);
    }
  };

  const onImport = async () => {
    if (!userId) {
      setFeedback('ログインが必要です。');
      return;
    }
    if (rows.length === 0) {
      setFeedback('取り込む行がありません。');
      return;
    }
    setIsImporting(true);
    dispatch(setBusy({ value: true, message: 'CSV importing...' }));
    setFeedback(null);
    let success = 0;
    for (const r of rows) {
      try {
        const newRoomRef = collection(db, 'rooms');
        const roomDoc = await addDoc(newRoomRef, {
          name: r.room_name,
          userId,
          createdAt: serverTimestamp(),
        });
        const msgCol = collection(doc(db, 'rooms', roomDoc.id), 'messages');
        await addDoc(msgCol, {
          text: r.message,
          sender: 'user',
          createdAt: serverTimestamp(),
        });
        // Ask AI for a reply and store as bot message (best-effort)
        // Best-effort AI reply with a small retry on failure
        const callAI = async () => {
          const text = (await gptResponse(r.message)) || '';
          if (!text.trim()) throw new Error('empty_response');
          return text;
        };
        try {
          let ai = await callAI();
          await addDoc(msgCol, { text: ai, sender: 'bot', createdAt: serverTimestamp() });
        } catch (e1: any) {
          // one backoff retry (800ms)
          await new Promise((rr) => setTimeout(rr, 800));
          try {
            const ai2 = await callAI();
            await addDoc(msgCol, { text: ai2, sender: 'bot', createdAt: serverTimestamp() });
          } catch (e2: any) {
            const emsg = String(e2?.message || e1?.message || '');
            const fallback = emsg.includes('未設定') || /missing openai api key/i.test(emsg)
              ? 'OpenAI APIキーが未設定です。サイドバーの設定から登録してください。'
              : emsg.includes('429')
              ? '現在AIが利用できません（429: 利用上限/請求設定をご確認ください）。'
              : 'AI応答でエラーが発生しました。時間をおいて再試行してください。';
            try {
              await addDoc(msgCol, { text: fallback, sender: 'bot', createdAt: serverTimestamp() });
            } catch {}
          }
        }
        success++;
      } catch (e) {
        // continue next row
      }
      // gentle spacing to avoid rapid-fire requests
      await new Promise((r) => setTimeout(r, 800));
    }
    setIsImporting(false);
    dispatch(setBusy({ value: false, message: null }));
    setFeedback(`${success}/${rows.length} 件のルームを作成しました。`);
  };

  return (
    <div className="p-3 border rounded-md bg-white">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-gray-900">CSVインポート</div>
        <button
          className="text-sm text-blue-700 underline"
          onClick={() => fileInput.current?.click()}
        >
          CSVを選択
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
          }}
        />
      </div>

      {isParsing && (
        <div className="text-sm text-gray-600 mt-2">解析中...</div>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-2 text-sm text-gray-800">
            {rows.length} 行を読み込みました（room_name, message）。
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-gray-600 w-16">#</th>
                  <th className="px-2 py-2 text-left text-gray-600">room_name</th>
                  <th className="px-2 py-2 text-left text-gray-600">message</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-2 py-2 align-top text-gray-500">{i + 1}</td>
                    <td className="px-2 py-2 align-top break-words">{r.room_name}</td>
                    <td className="px-2 py-2 align-top break-words whitespace-pre-wrap">
                      {r.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={onImport}
          disabled={isImporting || rows.length === 0}
        >
          {isImporting ? '取り込み中...' : '取り込み実行'}
        </button>
      </div>

      {feedback && (
        <div className="mt-2 text-sm text-gray-700">{feedback}</div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        期待ヘッダー: <code>room_name,message</code>
      </div>
    </div>
  );
};

export default CSVImport;
