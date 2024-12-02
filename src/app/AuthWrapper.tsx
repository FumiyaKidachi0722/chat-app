'use client';

import React from 'react';

import { useAuthListener } from '@/hooks/useAuth';

/**
 * クライアントサイドの認証ロジックを処理するコンポーネント
 */
export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthListener(); // 認証状態をリッスン

  return <>{children}</>;
}
