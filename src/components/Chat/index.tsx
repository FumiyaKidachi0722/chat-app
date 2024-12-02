'use client';

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { db } from '@/firebase';
import { RootState } from '@/redux/store';

import { ArrowUp } from '../atoms/Icon/HeroIcons';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
};
export const Chat = () => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [message, setMessage] = useState<Message[]>([]);
  const selectedRoom = useSelector(
    (state: RootState) => state.room.selectedRoom
  );

  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = async () => {
      const roomDocRef = doc(db, 'rooms', selectedRoom);

      const messageCollectionRef = collection(roomDocRef, 'messages');

      const q = query(messageCollectionRef, orderBy('createdAt'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
        setMessage(newMessages);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [selectedRoom]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: 'user',
      createdAt: serverTimestamp(),
    };

    const roomDocRef = doc(db, 'rooms', 'UxtrrWqyT7yRMSZLWAVf');
    const messageCollectionRef = collection(roomDocRef, 'messages');
    await addDoc(messageCollectionRef, messageData);
  };

  return (
    <div className="bg-gray-200 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-gray-900 font-semibold mb-4">Room 1</h1>
      <div className="flex-grow overflow-y-auto mb-4">
        {message.map((data, index) => {
          const isUserMessage = data.sender === 'user';
          return (
            <div
              className={`${isUserMessage ? 'text-right' : 'text-left'}`}
              key={index}
            >
              <div
                className={`inline-block rounded px-4 py-2 mb-2 ${
                  isUserMessage ? 'bg-blue-200' : 'bg-green-200'
                }`}
              >
                <p className="text-gray-900 font-medium">{data.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="border-2 rounded w-full pr-10 focus:outline-none p-2"
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          className="absolute inset-y-0 right-2 flex items-center"
          onClick={() => sendMessage()}
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
};
