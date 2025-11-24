# Runyoro-Rutooro Dictionary

A modern, full-stack web dictionary application for the Runyoro-Rutooro language, built with React Router v7 and deployed on Cloudflare's edge network.

## 🌍 About the Project

The Runyoro-Rutooro Dictionary is a digital language resource that provides translations and audio pronunciations for words in Runyoro/Rutooro, English, and Swahili. The project aims to preserve and promote the Runyoro-Rutooro language, spoken primarily in Western Uganda.

### Key Features

- **🔍 Full-Text Search**: Fast, fuzzy search across all dictionary entries using SQLite FTS5
- **🔤 Alphabetical Browse**: Interactive radial dial for browsing words by first letter
- **🎵 Audio Pronunciations**: Native speaker audio for ~2,000+ words served from Cloudflare R2
- **📱 Responsive Design**: Optimized mobile and desktop experiences with adaptive layouts
- **⚡ Edge-First**: Deployed on Cloudflare Workers for global low-latency access
- **🎨 Modern UI**: Clean, accessible interface with smooth animations using Framer Motion
- **🌐 SEO Optimized**: Individual URLs for each word with proper meta tags

> [!IMPORTANT] > **Educational Purpose**: This project is created for educational and learning purposes to demonstrate modern web development practices using React Router v7, Cloudflare Workers, and edge computing technologies.
>
> **Data Ownership**: The dictionary data (translations and audio pronunciations) used in this project is sourced from [runyorodictionary.com](http://runyorodictionary.com). I do not own or claim ownership of this data. All content rights belong to their respective owners. This project serves as a technical implementation showcase and tribute to the original work.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 + React Router v7 (Framework Mode)
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for audio files
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Language**: TypeScript

### Project Structure

```
dictionary/
├── app/
│   ├── routes/              # Route definitions
│   │   ├── _layout.tsx      # Master-detail layout
│   │   ├── _layout._index.tsx    # Home/welcome page
│   │   ├── _layout.word.$slug.tsx # Word detail pages
│   │   └── api.audio.$filename.ts # Audio API endpoint
│   ├── components/          # React components
│   │   ├── AudioPlayer.tsx  # Audio playback UI
│   │   ├── Header.tsx       # App header with branding
│   │   ├── RadialDial.tsx   # Alphabet navigation
│   │   └── SearchBar.tsx    # Search input with debouncing
│   ├── utils/              # Utility functions
│   │   └── audio.ts        # Audio URL generation
│   ├── db.server.ts        # Database queries
│   ├── context.ts          # Cloudflare context types
│   └── entry.worker.tsx    # Cloudflare Worker entry point
├── drizzle/                # Database migrations & schema
│   ├── schema.ts           # Drizzle schema definitions
│   ├── seed.sql            # Database seed data
│   └── 0000_*.sql          # Migration files
├── data/
│   └── upload/             # Audio files for R2 upload
├── wrangler.json           # Cloudflare configuration
└── upload-to-r2.sh         # R2 upload script
```

## 📄 Pages & Routes

### Route Configuration

The app uses React Router v7's file-based routing with a master-detail pattern:

```typescript
// app/routes.ts
[
  layout("routes/_layout.tsx", [
    index("routes/_layout._index.tsx"), // Home page
    route("word/:slug", "routes/_layout.word.$slug.tsx"), // Word details
  ]),
  route("api/audio/:filename", "routes/api.audio.$filename.ts"), // Audio API
];
```

### Pages

#### 1. **Home Page** (`/`)

- **Route**: `_layout._index.tsx`
- **Features**:
  - Welcome message
  - Search bar with real-time debounced search
  - Alphabetical radial dial (vertical on desktop, horizontal on mobile)
  - Word list with letter filtering
  - Responsive master-detail layout

#### 2. **Word Detail Page** (`/word/:slug`)

- **Route**: `_layout.word.$slug.tsx`
- **Features**:
  - Word translations (English, Runyoro/Rutooro, Swahili)
  - Audio pronunciation player
  - Usage examples
  - SEO-optimized meta tags
  - Back navigation
  - Image placeholder for future illustrations

#### 3. **Audio API** (`/api/audio/:filename`)

- **Route**: `api.audio.$filename.ts`
- **Features**:
  - Serves audio files from Cloudflare R2
  - Proper content-type headers
  - Aggressive caching (1 year)
  - 404 handling for missing files

### Layout Structure

The app uses a **master-detail layout** pattern:

```
┌─────────────────────────────────────────┐
│           Header (Sticky)               │
├──────────┬──────────────────────────────┤
│          │                              │
│  Radial  │                              │
│   Dial   │        Main Content          │
│ (A-Z)    │     (Word List / Detail)     │
│          │                              │
│  Word    │                              │
│  List    │                              │
│          │                              │
└──────────┴──────────────────────────────┘
   Desktop Layout
```

**Mobile Layout**: Stacks vertically with conditional rendering:

- Search bar → Radial dial → Word list (on home)
- Word detail (full screen when viewing a word)

## 🎵 Audio Implementation

Audio files are served from Cloudflare R2 storage.

### How It Works

1. **Database Storage**: Audio paths stored as `"audio/ball.mp3"`
2. **R2 Bucket**: Files uploaded to `dictionary-r2/audio/`
3. **API Route**: `/api/audio/:filename` fetches from R2
4. **Utility Function**: `getAudioUrl()` converts DB paths to API URLs
5. **Component**: `<AudioPlayer>` handles playback UI

### Upload Audio Files

```bash
# Upload all audio files to R2 (remote)
./upload-to-r2.sh
```

## 🗄️ Database Schema

The app uses Cloudflare D1 (SQLite) with the following schema:

```sql
-- Main dictionary entries table
CREATE TABLE dictionary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english_term TEXT NOT NULL,
  runyoro_term TEXT NOT NULL,
  swahili_term TEXT,
  examples TEXT,
  audio_path TEXT,
  image_path TEXT
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE dictionary_search USING fts5(
  english_term,
  runyoro_term,
  swahili_term,
  content='dictionary_entries',
  content_rowid='id'
);
```

### Key Features

- **FTS5 Search**: Fast full-text search with ranking
- **Letter Filtering**: Efficient alphabetical browsing
- **Slug-based URLs**: SEO-friendly word URLs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Cloudflare account (for deployment)
- Wrangler CLI

### Installation

```bash
# Clone the repository
cd dictionary

# Install dependencies
pnpm install

# Generate TypeScript types
pnpm run cf-typegen
```

### Development

```bash
# Start local development server
pnpm dev

# The app will be available at http://localhost:5173
```

### Database Setup

```bash
# Seed local database
pnpm run local-seed

# Seed remote database (production)
pnpm run remote-seed
```

## 📦 Deployment

### Deploy to Cloudflare

```bash
# Build and deploy to Cloudflare Workers
pnpm run deploy
```

### Environment Setup

1. **Create D1 Database**:

   ```bash
   wrangler d1 create dictionary-db
   ```

2. **Create R2 Bucket**:

   ```bash
   wrangler r2 bucket create dictionary-r2
   ```

3. **Update `wrangler.json`** with your database ID and bucket name

4. **Run Migrations**:

   ```bash
   wrangler d1 migrations apply dictionary-db --remote
   ```

5. **Seed Database (Optional)**:

   ```bash
   pnpm run remote-seed
   ```

6. **Upload Audio**:
   ```bash
   ./upload-to-r2.sh
   ```

## 🔧 Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm typecheck        # Run TypeScript checks

# Database
pnpm local-seed       # Seed local D1 database
pnpm remote-seed      # Seed remote D1 database

# Deployment
pnpm deploy           # Deploy to Cloudflare
pnpm check            # Dry-run deployment check

# Type Generation
pnpm cf-typegen       # Generate Cloudflare + React Router types
pnpm rr-typegen       # Generate React Router types only
pnpm rr-routes        # Show route tree
```

## 📊 Data Sources

All dictionary data and audio pronunciations are sourced from [runyorodictionary.com](http://runyorodictionary.com), a comprehensive online resource for the Runyoro-Rutooro language developed through community contributions and linguistic research. Audio pronunciations are recorded by native speakers.

**Source**: http://runyorodictionary.com

## 🤝 Contributing -- Coming soon

<!-- Contributions are welcome! Areas for contribution:

- Adding more dictionary entries
- Recording audio pronunciations
- Improving translations
- UI/UX enhancements
- Bug fixes -->

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The dictionary data is sourced from [runyorodictionary.com](http://runyorodictionary.com) and is used with attribution.

## 🙏 Acknowledgments

- Runyoro Dictionary [runyorodictionary.com](http://runyorodictionary.com)

## 📞 Contact

**Email**: michealndo@gmail.com  
**WhatsApp**: +256 76 996 613

---
