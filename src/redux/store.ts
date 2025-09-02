import { configureStore } from '@reduxjs/toolkit';

import roomReducer from '@/redux/roomSlice';
import userReducer from '@/redux/userSlice';
import uiReducer from '@/redux/uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
