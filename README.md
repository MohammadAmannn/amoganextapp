# AmogaApp — Enterprise Dashboard, Messaging & Voucher Platform

AmogaApp is a full-featured, production-ready enterprise dashboard and real-time messaging application built with **Next.js 15 App Router**, **TypeScript**, **NextAuth v4**, **Supabase PostgreSQL**, **Capacitor Mobile (Android/iOS)**, and **Tailwind CSS**.

---

## 🚀 Key Features

### 🔐 Authentication & Profile Sync
- **NextAuth v4 Integration**: Complete authentication system supporting **Google OAuth** and credentials login.
- **Deterministic UUID Mapping**: Custom `stringToUuid` generator in NextAuth maps Google numeric IDs and user emails to valid PostgreSQL UUID keys (`profiles.id` and `profiles.auth_user_id`).
- **Profile Synchronization**: Automatically creates and updates user profiles in the Supabase PostgreSQL `public.profiles` table upon sign-in.
- **Capacitor Mobile OAuth**: Native deep link intent architecture (`com.aman.amoganextapp://auth/callback` & `intent://auth/callback`) with Chrome Custom Tab handoff and native webview cookie synchronization via `/api/auth/mobile-set-cookie`.
- **Seamless Logout**: Instant sign-out redirection to `/sign-in` with zero UI freezing or blank screens.

### 🧾 Invoice & Voucher Management
- **OCR AI Form Extraction**: Extract invoice fields from uploaded PDF/image documents automatically.
- **Vector PDF Generator**: Popup-free 1-click A4 PDF voucher generation using `jsPDF`.
- **Right-Window Document Viewer**: Side-by-side document preview powered by `@cyntler/react-doc-viewer` with Zoom, Rotate, Fullscreen, and Original vs. Voucher View toggles.
- **User-Scoped Isolation**: Vouchers and uploaded files are isolated in user-scoped paths (`vouchers/${userId}/originals/` & `vouchers/${userId}/edited/`).

### 💬 Real-Time Messaging & Chat
- **Supabase Realtime**: Live message delivery, typing indicators, and voice note recording broadcasts.
- **Media Attachments**: Support for text, images, videos, audio voice notes, and document files.
- **Document Scanner**: Built-in OpenCV WebAssembly document scanner with 4-corner edge detection, perspective transformation, and image filters.
- **PDF & Document Converter**: Built-in multi-format document converter (PDF, DOCX, XLSX, TXT, PNG, JPG).
- **Asynchronous PDF Text Processing**: Non-blocking background PDF text extraction and layout parsing (`pdftext` & `pdf2json`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Authentication**: NextAuth v4 + Google Provider
- **Database & Storage**: Supabase PostgreSQL + Supabase Storage
- **Mobile Container**: Capacitor 7 (Android / iOS) + `@capacitor/browser` + `@capacitor/app`
- **Styling**: Tailwind CSS + Shadcn UI + Lucide Icons
- **State Management**: Zustand (Persisted Stores)
- **Document Viewer**: `@cyntler/react-doc-viewer`
- **PDF Generation**: `jsPDF` + `pdf-lib`

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://amoganextapp.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# OpenRouter AI SDK (Optional for AI Chat)
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🏃 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile App (Capacitor Android)

### 1. Sync Capacitor
```bash
npx cap sync android
```

### 2. Open Android Studio
```bash
npx cap open android
```

### 3. Build & Run
Build and deploy directly to an Android device or emulator from Android Studio.

---

## 🚢 Production Deployment

Deploy directly to Vercel:

```bash
vercel --prod
```

---

## 📄 License
MIT License. Built for production deployment.
