# Application Development & Architecture Memory

## 1. Overview & Feature Summaries

This document acts as the persistent memory log of all implemented features, design enhancements, Supabase Storage rules, and codebase modifications completed in the system.

---

## 2. Implemented Features & UI Improvements

### A. AI Chat & AI Assistant Tab Parity
- **Standardized Sub-Tabs**: Synced sub-tabs (`AI Chat`, `Recent`, `My Prompts`) across both `categoryFilter === 'ai'` (Sparkles icon) and `categoryFilter === 'ai-assistant'` (Bot icon) in `email-list.tsx`.
- **Active Category Highlights**: Applied matching active background colors to the toolbar icons:
  - `AI Chat` / `AI Assistant`: `bg-indigo-500/15 text-indigo-600`
  - `Tasks`: `bg-purple-500/15`
  - `Chat`: `bg-emerald-500/15`

### B. Mobile View Card-First Navigation
- **Behavior**: On mobile screens (or when selecting tabs), clicking any toolbar tab displays preview cards (Task Card, AI Card, Voucher Card, Email Card, Chat Card) first on the main screen.
- **Full View Detail Screen**: Tapping a card opens its corresponding page/view in full screen view.
- **Top-Right Close Cross (`X`) Buttons**: Integrated standardized close (`<X>`) buttons in top-right headers across all embedded components (`AiChatPanel`, `CalendarTemplate`, `KanbanTemplate`, `EmailView`, `ChatView`, `NotificationDetailPanel`, `MessageEmailSettings`).

### C. File Preview Header Actions Integration
- **Header Actions Component**: Integrated [`HeaderActions`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/chat/header-actions.tsx) into the top-right header of [`DocumentViewerHeader.tsx`](file:///e:/morrai/shadcn-admin-main/src/components/DocumentViewer/DocumentViewerHeader.tsx) next to the close button (`X`).
- **Quick Action Tools**: Flag, Alert, Document options, and 3-dot dropdown menu (Reply, Forward, Archive, Share, Print, Download, Delete).

### D. Primary Theme Color Buttons
- **New & Upload Buttons**: Updated the `New +` compose email button and `Upload +` file button in [`email-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-list.tsx) and [`FileUploadForm`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/files/file-upload-form.tsx) to match the project's primary theme color (`bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20`).

---

## 3. Centralized Contact File Space Architecture (Supabase Storage)

### Core Storage Rule
> **ONE CONTACT = ONE FILE SPACE**

All object paths in Supabase Storage follow the universal routing format:
```text
{contact-email}/{section}/{file-type}/{filename}
```

### Key Policy Specifications
1. **Normalized Contact Email Root**:
   - Anchored by contact email: `email.trim().toLowerCase()` (e.g. `" John@Company.COM "` → `"john@company.com"`).
   - Strict fallback resolution prevents any `anonymous@user.com` folder generation.

2. **No `.keep` Dummy Files**:
   - Disabled creation of empty `.keep` placeholder files. Empty folders contain no dummy files; folders appear dynamically in Supabase Storage when actual files are uploaded.

3. **Dual-Folder Storage (Sender & Receiver)**:
   - When User A (`senderEmail`) sends a file to User B (`receiverEmail`), the file is automatically uploaded to **BOTH**:
     - `senderEmail/Chat/{category}/{unique-filename}`
     - `receiverEmail/Chat/{category}/{unique-filename}`

4. **5 Standard Sections**:
   - `Files`, `Chat` (**ACTIVE**), `Email`, `AI Chat`, `Order`

5. **10 File-Type Categories**:
   - `Doc` (`.doc`, `.docx`)
   - `Xls` (`.xls`, `.xlsx`)
   - `Ppt` (`.ppt`, `.pptx`)
   - `Pdf` (`.pdf`)
   - `Txt` (`.txt`)
   - `Csv` (`.csv`)
   - `Images` (`.jpg`, `.png`, `.webp`, `.svg`, etc.)
   - `Videos` (`.mp4`, `.mov`, `.avi`, etc.)
   - `Zip` (`.zip`, `.rar`, `.7z`, etc.)
   - `Other` (any unknown or unsupported file types)

6. **Supabase Headers**:
   - Upload requests include `x-upsert: true` to prevent 409 conflict errors upon uploading/overwriting.

---

## 4. Storage Files Explorer, Action Navbar, & File Upload Architecture

### A. Progressive Click-to-Expand Folder Tree
- **Sidebar Tree Hierarchy**: Initial state renders root 📁 `Chat` (collapsed). Clicking `Chat` expands to 📁 `{userEmail}`. Clicking `{userEmail}` expands to format subfolders (`Images`, `Pdf`, `Doc`, `Xls`, `Videos`, `Ppt`, `Txt`, `Csv`, `Zip`, `Other`).
- **Strict Category Filtering**: Selecting 📂 `Pdf` displays **ONLY PDF files** (`.pdf`). Selecting 📂 `Images` displays **ONLY Image files**. Selecting 📂 `Doc` displays **ONLY Word Document files**.
- **Parent Folder Placeholder**: Clicking root 📁 `Chat` or 📁 `{userEmail}` displays placeholder: *"Select a category folder to view files"*.

### B. Action Navbar & Data Grid Table View (`tablecn.com/data-grid`)
- **Action Toolbar**: Positioned below top header featuring:
  - **LTR**: Direction toggle
  - **FILTER**: Format filter dropdown (Images, PDF, Word, Excel, Videos)
  - **SORT**: Sort dropdown (Date Newest/Oldest, Name A-Z/Z-A, Size)
  - **SHORT**: Reset filters button
  - **VIEW**: Dropdown menu switching between **Card View** and **Table View**.
- **Full-Size Search Bar**: Positioned directly **BELOW** the Action Toolbar Navbar. Real-time search filters files instantly on the first character typed (matching File Name, File UUID, Folder Path, Category, Version, or Sender Name).
- **Data Grid Table View (`tablecn.com/data-grid`)**: Columns rendered with real Supabase Storage & DB metadata:
  1. **File ID (UUID)**: Real object UUID badge (click to copy full UUID).
  2. **File Name**: Format icon + File title.
  3. **Main Folder Name**: Section folder (`📁 Chat`, `📁 Files`, `📁 Email`).
  4. **Sub Folder Name**: Category subfolder (`📂 Images`, `📂 Pdf`, `📂 Doc`, `📂 Xls`, `📂 Videos`).
  5. **Version No**: Dedicated version number column (`v1.0`, `v1.1`).
  6. **Date & Time Stamp**: Real formatted timestamp (`Aug 17, 2026 10:45 AM`).
  7. **User Name**: Sender/uploader avatar & name (`Aman`).
  8. **3-Dot Action Menu (`...`)**: Dropdown menu containing Preview, Download, Share, and Delete.
- **Card View Footer Actions**: Left side: `Preview` + `Download` buttons. Right side: 3-Dot Options Menu (`Edit`, `View`, `Share`).
- **Header Actions & Mobile-Only Close Cross (`X`)**: Integrated `HeaderActions` (Flag, Alert, Document, 3-Dot menu) and close cross (`X`) button (hidden on desktop `md:hidden`, visible on mobile).

### C. File Upload Form (`FileUploadForm`)
- **UI Parity with NewEmail Form**: Exact layout and design match with `NewEmail` compose form (rich text editor formatting toolbar, template selector, document title/subject, attachment cards with progress bars).
- **Primary Save Button**: Replaced `Send` button with primary **`Save`** button (`<Save />`) styled with `bg-primary text-primary-foreground hover:bg-primary/90`.
- **Folder, Sub folder & Remarks Fields**: Positioned directly **ABOVE** the file attachments section matching user UI screenshot:
  - **Folder**: Select dropdown (`Finance`, `Chat`, `Files`, `Email`, `AI Chat`, `Order`).
  - **Sub folder**: Select dropdown (`Banking`, `Images`, `Pdf`, `Doc`, `Xls`, `Videos`, `Zip`, `Other`).
  - **Remarks**: Textarea field (`Add a note about these attachments...`).
- **Supabase Storage Upload**: Saves attached files directly to Supabase storage bucket `chat-files` under `{userEmail}/{Folder}/{SubFolder}/{fileName}` and refreshes tree folders in real-time.
- **Zero Side Effects**: Zero impact on `NewEmail` mail compose form.

### D. Section-Restricted Toolbar Action Buttons & Left-Sidebar Search
- **Section-Restricted Buttons**:
  - `New +` compose email button is displayed strictly on the **Mail tab** (`categoryFilter === 'mail'`).
  - `Upload +` file button is displayed strictly on the **File tab** (`categoryFilter === 'vouchers'`).
### E. Google OAuth Account Switching & Session Purging
- **Force Account Selection**: Configured `authorization: { params: { prompt: 'select_account' } }` in NextAuth `GoogleProvider` to guarantee that Google displays the account selection prompt on login instead of reusing the previously active session.
- **Deep Session Purge**: Enhanced `/api/auth/mobile-logout` and `SignOutDialog` to invalidate all NextAuth session tokens, Zustand auth store state, NextAuth client session cache, and all Supabase auth cookies (`sb-*`, `supabase-auth-token`).

### G. File Section 20-Card Pagination & Clean UI Architecture
- **Pagination Sub-bar (`1–20 of 25 < >`)**: Positioned directly below the full-size search bar in `UserFileCardsView`, displaying current range and total count with `<` and `>` arrow buttons to navigate pages of 20 cards/rows. Automatically resets to page 1 upon search/filtering/sorting.
- **Clean UI & Border Removal**:
  - Removed line next to "File Explorer" header in left panel (`email-list.tsx`).
  - Removed harsh top and bottom borders around the search bar in `UserFileCardsView` and reduced unnecessary padding across action toolbar, search bar, and card grid.
- **Universal Top-Left Close (`X`) Icon on Mobile**:
  - **Chat View**: Replaced right-side button with top-left `<X />` close button in `ChatView`.
  - **Task / Kanban View**: Added top-left `<X />` close button in `KanbanTemplate` header.
  - **AI Chat & AI Assistant**: Added top-left `<X />` close button in `AiChatPanel` header.
  - **Calendar View**: Added top-left `<X />` close button in `CalendarTemplate` header.
  - **Notifications**: Standardized top-left `<X />` close button in `NotificationDetailPanel`.
  - **Email View**: Standardized top-left `<X />` close button in `Message/index.tsx`.

---

## 5. Codebase File Inventory

| File Path | Action | Description |
| :--- | :---: | :--- |
| `src/features/Message/components/files/user-file-cards-view.tsx` | **MODIFIED** | Added 20-card pagination (`1-20 of N < >`) below search bar, removed unnecessary borders, reduced vertical padding, and wired paginated data. |
| `src/features/Message/components/emails/email-list.tsx` | **MODIFIED** | Removed separator line next to "File Explorer" in left sidebar. |
| `src/features/Message/components/chat/chat-view.tsx` | **MODIFIED** | Positioned close (`X`) button on top-left of mobile chat header. |
| `src/features/kanbantemplate/index.tsx` | **MODIFIED** | Positioned close (`X`) button on top-left of mobile Kanban header. |
| `src/features/Message/components/panels/ai-chat-panel.tsx` | **MODIFIED** | Positioned close (`X`) button on top-left of mobile AI Assistant header. |
| `src/features/calendartemplate/index.tsx` | **MODIFIED** | Positioned close (`X`) button on top-left of mobile Calendar header. |
| `src/features/Message/components/panels/notification-detail-panel.tsx` | **MODIFIED** | Standardized close (`X`) button on left side of header. |
| `src/features/Message/index.tsx` | **MODIFIED** | Standardized top-left close (`X`) button on mobile email view. |
| `src/lib/auth.ts` | **MODIFIED** | Added `prompt: 'select_account'` to GoogleProvider for account switching. |
| `src/components/sign-out-dialog.tsx` | **MODIFIED** | Purged NextAuth client session, Supabase auth session, and Zustand auth store on logout. |
| `app/api/auth/mobile-logout/route.ts` | **MODIFIED** | Purged all incoming cookies including `auth_user_data`, `thisisjustarandomstring`, and `sb-*`. |
| `app/api/auth/mobile-login/route.ts` | **MODIFIED** | Purged stale cookies before Google OAuth redirect. |
| `app/api/auth/mobile-set-cookie/route.ts` | **MODIFIED** | Purged old session cookies before setting new token. |
| `src/components/providers.tsx` | **MODIFIED** | Removed early-return guard in NextAuthSync for clean account sync. |
| `memory.md` | **MODIFIED** | Persistent memory documentation of all project updates. |