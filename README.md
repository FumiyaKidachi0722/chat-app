# Chat-App

## 概要

Chat-Appは、Firebaseを使用した認証とデータベース連携を備えたリアルタイムチャットアプリです。

---

## インストール方法

### 1. リポジトリのクローン

```bash
git clone git@github.com:FumiyaKidachi0722/chat-app.git
cd chat-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. .envファイルの設定

ルートディレクトリに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_OPENAI_API_KEY=
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリを確認してください。

---
