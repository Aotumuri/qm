# QMeo

[日本語](README.ja.md)

QMeo is a small bilingual memo app. Memo content is stored in the browser's IndexedDB and is never sent to a server.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

GitHub Pages deployment is configured in GitHub Actions. Set the repository's Pages source to **GitHub Actions**.

Use **Display settings** to adjust the interface size and memo-body line spacing; preferences are saved in this browser.

Memo bodies support bold text and heading levels 1–3; the memo title remains separate.

The app itself is hosted online, but memo data stays in the current browser on the current device. Clearing browser data removes saved memos.
