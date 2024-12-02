import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  selectedRoom: string | null;
}

const initialState: RoomState = {
  selectedRoom: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setSelectedRoom(state, action: PayloadAction<string>) {
      state.selectedRoom = action.payload;
    },
    clearSelectedRoom(state) {
      state.selectedRoom = null;
    },
  },
});

export const { setSelectedRoom, clearSelectedRoom } = roomSlice.actions;
export default roomSlice.reducer;
