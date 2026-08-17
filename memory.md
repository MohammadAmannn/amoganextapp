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
- **Left-Sidebar Folder Search**: Typing in the left-side search input (`Search...`) filters `userFolders` in real-time by folder name, path, or section.

---

## 5. Codebase File Inventory

| File Path | Action | Description |
| :--- | :---: | :--- |
| `src/features/Message/services/user-storage-files.service.ts` | **CREATED** | Queries real Supabase Storage `chat-files` bucket & DB vouchers for user files, real object UUIDs, version numbers (`v1.0`), and builds nested tree folders. |
| `src/features/Message/components/files/user-file-cards-view.tsx` | **CREATED** | Renders horizontally aligned file cards, Data Grid Table view (`tablecn.com/data-grid`), full-size search bar, Action Navbar (LTR, FILTER, SORT, SHORT, VIEW), card 3-dot menu, and mobile close button. |
| `src/features/Message/components/files/file-upload-form.tsx` | **CREATED** | Upload form matching `NewEmail` layout with Folder, Sub folder, and Remarks fields above attachments; saves directly to Supabase storage. |
| `src/features/chattemplate/chat/services/chat-storage.service.ts` | **CREATED** | Storage helper (`getStoragePath`, `getChatFileCategory`, `normalizeContactEmail`, `generateUniqueFileName`). |
| `src/features/chattemplate/files/managers/attachment-uploader.ts` | **MODIFIED** | Manages dual XHR & fetch uploads to Sender & Receiver folders with `x-upsert: true` and session email fallback. |
| `src/features/chattemplate/chat/hooks/use-attachments.ts` | **MODIFIED** | Hook passing `senderEmail` and `receiverEmail` down to `uploadAttachment`. |
| `src/features/Message/components/chat/realtime-chat-view.tsx` | **MODIFIED** | Dynamically resolves `senderEmail` and `receiverEmail` from session and conversation members. |
| `src/features/chattemplate/contacts/api/contacts.api.ts` | **MODIFIED** | Normalizes contact email on contact creation without `.keep` files. |
| `src/features/chattemplate/chat/services/chat-storage.service.test.ts` | **CREATED** | Vitest test suite (`17/17 passed`) for storage rules. |
| `src/components/DocumentViewer/DocumentViewerHeader.tsx` | **MODIFIED** | Integrated `HeaderActions` on the top-right header next to close (`X`). |
| `src/features/Message/components/emails/email-list.tsx` | **MODIFIED** | Render user storage folders on left sidebar under File tab (`categoryFilter === 'vouchers'`), real-time folder search, section-restricted `New`/`Upload` buttons with primary theme styling. |
| `src/features/Message/index.tsx` | **MODIFIED** | Wired user storage folders, `UserFileCardsView`, `FileUploadForm`, and deferred SMTP email loading to Email tab. |
| `memory.md` | **MODIFIED** | Persistent memory documentation of all project updates. |