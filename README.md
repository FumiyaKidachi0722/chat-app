# Chat-App

📦 **Live Demo:** https://fk-chat-app.vercel.app/

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

OPENAI_MODEL=o4-mini
```

以下、参照
https://drive.google.com/drive/u/0/folders/18182qmlryG_ojOYnYmJjWxR-Gcx7Xevd

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリを確認してください。

---

## CSVインポート（サンプルCSV付き）

サイドバーの「CSV インポート」ボタンからモーダルを開き、以下の形式の CSV を選択して「取り込み実行」を押すと、各行についてルームを作成し、最初のユーザーメッセージを登録します。その後、AI への問い合わせを順次実行し、ボットの初回返信も自動で登録します（レート制御のため少し間隔を空けて送信）。

- 期待ヘッダー: `room_name,message`
- 例: `public/sample-rooms.csv`

CSV サンプル:

```
room_name,message
顧客Aの相談,最初の質問です。見積もりをお願いします。
社内タスク,来週の会議アジェンダをまとめてください。
学習メモ,Reactのカスタムフックについて要点を整理してください。
```

注意事項:

- 簡易パーサーのため、現状は引用符/カンマ埋め込みに未対応です（必要なら強化可能）。
- 取り込みはクライアント側で実行され、`rooms` と `rooms/{roomId}/messages` に書き込みます。
