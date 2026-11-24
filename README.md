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

Use the **Display size** control to adjust the interface from 80% to 125%; the preference is saved in this browser.

The app itself is hosted online, but memo data stays in the current browser on the current device. Clearing browser data removes saved memos.
