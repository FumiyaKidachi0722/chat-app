'use client';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { db } from '@/firebase';
import { setSelectedRoom } from '@/redux/roomSlice';
import { RootState } from '@/redux/store';

import { ArrowRightStartOnRectangle } from '../atoms/Icon/HeroIcons';

type Room = {
  id: string;
  name: string;
  createdAt: Timestamp;
};
export const Sidebar = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const userId = useSelector((state: RootState) => state.user.userId);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      const roomCollectionRef = collection(db, 'rooms');
      const q = query(
        roomCollectionRef,
        where('userId', '==', userId),
        orderBy('createdAt')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newRooms: Room[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
        }));
        setRooms(newRooms);
      });

      return () => unsubscribe();
    };

    fetchRooms();
  }, [userId]);

  const selecteRoom = (roomId: string) => {
    dispatch(setSelectedRoom(roomId));
  };

  return (
    <div
      className="h-full overflow-y-auto px-5 flex flex-col"
      style={{
        backgroundColor: '#f8f4ec',
      }}
    >
      <div className="flex-grow">
        <div className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-100 duration-150">
          <span className="text-gray-900 p-4 text-2xl">+</span>
          <h1 className="text-gray-900 text-lg font-semibold p-4">New Chat</h1>
        </div>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className="curspr-pointer border-b p-4 text-gray-900 hover:bg-blue-100 duration-150"
              onClick={() => selecteRoom(room.id)}
            >
              {room.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 text-slate-600 hover:bg-slate-200 duration-150">
        <span>ログアウト</span>
        <ArrowRightStartOnRectangle />
      </div>
    </div>
  );
};
