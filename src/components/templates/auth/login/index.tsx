'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { auth } from '@/firebase';

type Inputs = {
  email: string;
  password: string;
};
export const AuthLoginTemplate = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log('data: ', data);

    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.log('error.message: ', error.message);
        if (
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/user-not-found'
        ) {
          alert('メールアドレスもしくはパスワードが間違っています');
        } else {
          alert(error.message);
        }
      });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="mb-4 text-2xl text-gray-700 font-medium">ログイン</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            {...register('email', {
              required: 'メールアドレスは必須項目です',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '無効なメールアドレスです',
              },
            })}
            type="text"
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            {...register('password', {
              required: 'パスワードは必須項目です',
              minLength: {
                value: 8,
                message: 'パスワードは8文字以上入力してください',
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};:'",.<>?\\|`~^/-]).+$/,
                message:
                  'パスワードは大文字、小文字、数字、記号をそれぞれ1文字以上含めてください',
              },
            })}
            type="password"
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.password && (
            <span className="text-red-600 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">
            アカウントをお持ちでは場合
          </span>
          <Link
            href={'/auth/register'}
            className="text-blue-500 text-sm font-bold ml-1 hover:text-blue-700"
          >
            新規登録ページへ
          </Link>
        </div>
      </form>
    </div>
  );
};
