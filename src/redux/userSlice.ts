import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string | null;
  displayName?: string;
  photoURL?: string;
}

interface UserState {
  userId: string | null;
  user: User | null;
}

const initialState: UserState = {
  userId: null,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.userId = action.payload.userId;
      state.user = action.payload.user;
    },
    clearUser(state) {
      state.userId = null;
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const createUserPayload = (
  userId: string,
  email: string | null
): UserState => ({
  userId,
  user: { email },
});

export default userSlice.reducer;
