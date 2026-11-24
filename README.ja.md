# QMeo

[English](README.md)

QMeo は、英語・日本語に対応したシンプルなメモアプリです。メモはブラウザー内の IndexedDB に保存され、サーバーには送信されません。

## 開発

```sh
npm install
npm run dev
npm test
npm run build
```

GitHub Actions による GitHub Pages へのデプロイを設定しています。Pages の公開元を **GitHub Actions** にしてください。

ヘッダーの「表示サイズ」から、文字や画面全体を80〜125%に調整できます。設定はこのブラウザーに保存されます。

アプリ自体はオンラインで配信されますが、メモは利用中の端末・ブラウザー内に保存されます。ブラウザーのデータを消去するとメモも削除されます。
