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
  createdAt: Timestamp | null;
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
      try {
        const roomDocRef = doc(db, 'rooms', selectedRoom);
        const messageCollectionRef = collection(roomDocRef, 'messages');
        const q = query(messageCollectionRef, orderBy('createdAt'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              if (
                typeof data.text === 'string' &&
                typeof data.sender === 'string' &&
                (data.createdAt === null || data.createdAt instanceof Timestamp)
              ) {
                return data as Message;
              }
              console.warn('Invalid message data:', data);
              return null;
            })
            .filter((message): message is Message => message !== null);
          setMessages(newMessages);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const unsubscribe = fetchMessages();

    return () => {
      if (unsubscribe instanceof Function) unsubscribe();
    };
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

    const roomDocRef = doc(db, 'rooms', selectedRoom || 'defaultRoomId'); // エラーハンドリング
    const messageCollectionRef = collection(roomDocRef, 'messages');

    try {
      const userMessage = {
        text: inputMessage,
        sender: 'user',
        createdAt: serverTimestamp(),
      };

      await addDoc(messageCollectionRef, userMessage);

      setInputMessage('');
      setIsLoading(true);

      const response = await gpt3Response(inputMessage);
      const botResponse = response?.choices?.[0]?.message?.content || '...';

      const botMessage = {
        text: botResponse,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };

      await addDoc(messageCollectionRef, botMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-gray-900 font-semibold mb-4">
        {selectedRoomName || 'Chat Room'}
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
          aria-label="Message Input"
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
