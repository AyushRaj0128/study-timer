# Focus Nook

Focus Nook is a calm, client-side study desk for focused work. It combines an accurate Pomodoro timer, a lightweight task list, quick notes, atmosphere themes, and a small progress view without requiring an account or backend.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite. To create a production build:

```bash
npm run build
npm run preview
```

The app is ready to deploy as a static site to Vercel, Netlify, or any host that serves the Vite `dist` directory.

## Included

- Accurate timestamp-based timer modes: Focus, Short break, Long break, Stopwatch, and Custom.
- Timer state, tasks, sessions, notes, themes, and preferences persisted in local storage.
- Task priorities, subject tags, completion tracking, current-task linking, and filters.
- Eight atmosphere themes plus automatic light/dark switching by time of day.
- Quick notes with autosave, keyboard shortcuts, a zen mode, and touch-friendly responsive layout.
- Insights page with daily bars, task progress, a study heatmap, and JSON export/import.
- Ambient mixer UI and a user-supplied YouTube link field. Focus Nook does not bundle or download copyrighted audio.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start or pause the timer |
| `R` | Reset the timer |
| `F` | Toggle zen mode |
| `T` | Cycle through themes |

## Media notes

The music and ambient areas are deliberately user-supplied. Add embeddable YouTube playlist IDs to `src/data/defaultPlaylists.ts` when you want to curate a starter library. Add only royalty-free, properly licensed files to `public/audio` or `public/ambient`, and document each file in the matching `CREDITS.md`.

Music links are played through YouTube. Focus Nook does not host or distribute copyrighted music.

## Privacy

There is no analytics, account, or server-side storage. Timer history, tasks, notes, and settings stay in the browser. Use the export control on Insights if you want a portable backup.
