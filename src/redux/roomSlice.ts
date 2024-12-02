import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  selectedRoom: string | null;
  selectedRoomName: string | null;
}

const initialState: RoomState = {
  selectedRoom: null,
  selectedRoomName: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setSelectedRoom(state, action: PayloadAction<string>) {
      state.selectedRoom = action.payload;
    },
    setSelectedRoomName(state, action: PayloadAction<string>) {
      state.selectedRoomName = action.payload;
    },
    clearSelectedRoom(state) {
      state.selectedRoom = null;
      state.selectedRoomName = null;
    },
  },
});

export const { setSelectedRoom, setSelectedRoomName, clearSelectedRoom } =
  roomSlice.actions;
export default roomSlice.reducer;
