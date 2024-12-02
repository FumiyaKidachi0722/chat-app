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
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { db } from '@/firebase';
import { gpt3Response } from '@/hooks/openai';
import { RootState } from '@/redux/store';

import { ArrowUp } from '../atoms/Icon/HeroIcons';
import { OverlaySpinner } from '../atoms/Icon/OverlaySpinner';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
};
export const Chat = () => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const selectedRoom = useSelector(
    (state: RootState) => state.room.selectedRoom
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const selectedRoomName = useSelector(
    (state: RootState) => state.room.selectedRoomName
  );

  const scrollDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = async () => {
      const roomDocRef = doc(db, 'rooms', selectedRoom);

      const messageCollectionRef = collection(roomDocRef, 'messages');

      const q = query(messageCollectionRef, orderBy('createdAt'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
        setMessages(newMessages);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [selectedRoom]);

  useEffect(() => {
    const element = scrollDiv.current;

    element?.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

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

    setInputMessage('');
    setIsLoading(true);

    const response = gpt3Response(inputMessage);
    const botResponse = (await response).choices[0].message.content;
    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: 'bot',
      createdAt: serverTimestamp(),
    });

    setIsLoading(false);
  };

  return (
    <div className="bg-gray-200 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-gray-900 font-semibold mb-4">
        {selectedRoomName}
      </h1>
      <div className="flex-grow overflow-y-auto mb-4" ref={scrollDiv}>
        {messages.map((message, index) => {
          const isUserMessage = message.sender === 'user';
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
                <p className="text-gray-900 font-medium">{message.text}</p>
              </div>
            </div>
          );
        })}

        {isLoading && <OverlaySpinner />}
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="border-2 rounded w-full pr-10 focus:outline-none p-2"
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          disabled={!selectedRoomName}
        />
        <button
          className="absolute inset-y-0 right-2 flex items-center"
          onClick={() => sendMessage()}
          disabled={!selectedRoomName}
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
};
