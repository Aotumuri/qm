# QMeo

- Keep UI text in `src/i18n/messages/en.ts` and `ja.ts`; keep both dictionaries in sync.
- Keep views/components small; store access belongs in `src/services/` and app state in `src/composables/`.
- Memo content must stay in browser storage. Do not add analytics, a backend, or external runtime resources.
- Preserve GitHub Pages base-path support. Run `npm test` and `npm run build`.
