# Fotti

A React web application built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Setup & Run

This project uses `pnpm` as its package manager.

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server
pnpm dev
```

### Other Commands

- **Build for production:** `pnpm build`
- **Preview production build:** `pnpm preview`
- **Lint the code:** `pnpm lint`
- **Format the code:** `pnpm format`

## 📁 Directory Structure

The main application code lives in the `src` directory:

- `src/components/` - Reusable UI components (e.g., ChartsPanel, StatsTable).
- `src/hooks/` - Custom React hooks and Context providers for global state (Theme, Language, Match).
- `src/utils/` - Helper functions, data processing (stats, storage, export, zones).
- `src/lib/` - External library integrations and core utilities (e.g., translations, `clsx`/`tailwind-merge` utils).
- `src/types/` - TypeScript type definitions and interfaces.

## 📦 Three Main Libraries

- **React** (v19) - Core UI library.
- **Tailwind CSS** (v4) - Utility-first CSS framework for styling.
- **Recharts** - Composable charting library built on React components for data visualization.
