import { configureStore } from '@reduxjs/toolkit';

import roomReducer from '@/redux/roomSlice';
import uiReducer from '@/redux/uiSlice';
import userReducer from '@/redux/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
