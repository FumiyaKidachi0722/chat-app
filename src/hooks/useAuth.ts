'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { auth } from '@/firebase';
import { setUser, clearUser, createUserPayload } from '@/redux/userSlice';

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('--- start ---');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('user: ', user);
      if (user) {
        dispatch(setUser(createUserPayload(user.uid, user.email)));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
};