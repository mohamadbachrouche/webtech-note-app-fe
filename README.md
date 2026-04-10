# Webtech Note App - Frontend

A modern, responsive note-taking application built with **Vue.js 3** and **TypeScript** for the Web Technologies course (WiSe 2025/26) at HTW Berlin.

## 🌐 Live Demo

- **Frontend:** https://webtech-note-app-fe.onrender.com
- **Backend:** https://webtech-note-app-be.onrender.com
- **Backend Repository:** https://github.com/mohamadbachrouche/webtech-note-app-be

## ✨ Features

- **Create, Edit & Delete Notes** - Full CRUD functionality with rich text editing
- **Rich Text Editor** - Bold, italic, underline, headings, lists, and hyperlinks (powered by Tiptap)
- **Pin Notes** - Keep important notes at the top
- **Trash & Restore** - Soft delete with recovery option
- **Search & Sort** - Filter notes by title, sort by date or alphabetically
- **Dark Mode** - Toggle between light and dark themes
- **Background Themes** - Choose from multiple background images
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

| Category         | Technology                 |
| ---------------- | -------------------------- |
| Framework        | Vue.js 3 (Composition API) |
| Language         | TypeScript                 |
| Build Tool       | Vite                       |
| Testing          | Vitest                     |
| HTTP Client      | Axios                      |
| Rich Text Editor | Tiptap                     |
| Deployment       | Render.com (Static Site)   |
| CI/CD            | GitHub Actions             |

## 📦 Project Setup

```sh
npm install
```

### Development Server

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Run Unit Tests

```sh
npm run test:unit
```

### Type Check

```sh
npm run type-check
```

### Lint & Format

```sh
npm run lint
npm run format
```

## 📁 Project Structure

```
src/
├── components/          # Vue components
│   ├── NoteEditor.vue   # Rich text editor
│   ├── NoteItem.vue     # Note list item
│   ├── SideBar.vue      # Navigation & note list
│   └── TopBar.vue       # Header & theme controls
├── services/            # API service layer
├── types/               # TypeScript interfaces
├── constants.ts         # App configuration
├── App.vue              # Root component
└── main.ts              # Entry point
```

## 🔧 Environment Variables

Create `.env.development` for local development:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Production uses `.env.production`:

```
VITE_API_BASE_URL=https://webtech-note-app-be.onrender.com/api
```

## 🔒 Security notes

- **JWT storage.** The auth token is currently persisted in `localStorage` for
  simplicity. This exposes it to any XSS on the page, so the rich-text editor
  validates link URLs (only `http:`, `https:`, and `mailto:` are allowed) and
  the backend tightly scopes what the token can do. A fully-hardened setup
  would move the token to an HTTP-only cookie set by the backend — that's out
  of scope for the current coursework but tracked as future work.
- **Logout wiping.** Logging out clears all app-specific `localStorage` keys
  (token, email, darkMode, appBackground, sidebarCollapsed) so nothing leaks
  to the next user on a shared device.
- **Env validation.** `src/main.ts` throws on startup if `VITE_API_BASE_URL`
  is not set — no silent misconfiguration.

## 👨‍💻 Author

Mohamad Bachrouche - HTW Berlin
