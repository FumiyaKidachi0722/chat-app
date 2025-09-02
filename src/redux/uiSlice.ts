import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isBusy: boolean;
  busyMessage?: string | null;
}

const initialState: UIState = {
  isBusy: false,
  busyMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBusy(state, action: PayloadAction<{ value: boolean; message?: string | null }>) {
      state.isBusy = action.payload.value;
      state.busyMessage = action.payload.message ?? null;
    },
  },
});

export const { setBusy } = uiSlice.actions;
export default uiSlice.reducer;

