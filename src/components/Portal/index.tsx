'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portalコンポーネント
 * childrenをid="portal-root" に描画する
 */
type PortalProps = {
  children: React.ReactNode;
};

export const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // クライアント側でマウントされたときにのみ描画
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};
