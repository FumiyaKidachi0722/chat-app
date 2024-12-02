// src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';

import AuthWrapper from '@/app/AuthWrapper';
import { store } from '@/redux/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}
