import { configureStore } from '@reduxjs/toolkit';

import roomReducer from '@/redux/roomSlice';
import userReducer from '@/redux/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
