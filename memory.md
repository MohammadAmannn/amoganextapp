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

### D. Mail Section Theme Color Button
- **New Compose Button**: Updated the `New +` compose email button in [`email-list.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/emails/email-list.tsx) to use the primary theme color (`bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20`).

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

### E. User Storage Folders & File Cards Preview in File Tab
- **On-Demand Expand/Collapse Tree View**:
  - Initial State: Only 📁 `Chat` (Root folder) is displayed.
  - Clicking 📁 `Chat` expands to reveal 📁 `{userEmail}` folder.
  - Clicking 📁 `{userEmail}` expands to reveal non-empty category subfolders (`Images`, `Pdf`, `Doc`, `Xls`, `Videos`, `Ppt`, `Txt`, `Csv`, `Zip`, `Other`).
- **Strict Category Filtering**:
  - Selecting 📂 `Pdf` displays **ONLY PDF files** (`.pdf`). No images, no doc files!
  - Selecting 📂 `Images` displays **ONLY Image files** (`.jpg`, `.png`, `.webp`, `.svg`, `.gif`).
  - Selecting 📂 `Doc` displays **ONLY Word Document files** (`.doc`, `.docx`).
  - Selecting 📂 `Xls` displays **ONLY Excel spreadsheets** (`.xls`, `.xlsx`).
  - Selecting 📂 `Videos` displays **ONLY Video files** (`.mp4`, `.mov`, `.avi`).
- **Default Empty State for Parent Folders**:
  - Clicking root 📁 `Chat` or 📁 `{userEmail}` expands/collapses the sidebar tree without showing all files on the right window.
  - The right-side window shows the placeholder: **"Select a category folder to view files"**.
  - File cards are rendered **ONLY** when a specific format category subfolder (`Images`, `Pdf`, `Doc`, `Xls`, `Videos`, `Ppt`, `Txt`, `Csv`, `Zip`, `Other`) is selected.
- **Deferred SMTP Email Fetching**:
  - Removed global automatic SMTP email loading on initial mount.
  - SMTP inbox and sent emails (`/api/mail/inbox` and `/api/mail/sent`) are fetched **ONLY WHEN** the **Email tab** is active (`sectionMode === 'mail'`).
  - Uses `hasFetchedMail` state flag to trigger real SMTP email loading as soon as the user opens/activates the Email tab, replacing mock demo emails with real inbox messages.
  - Switching to `File` tab, `Chat` tab, `Tasks` tab, `AI Chat` tab, etc., renders instantly without waiting for SMTP network connections.
- **Right Side Window Horizontal File Cards**: Selecting any folder presents files in that folder as horizontally aligned cards (`flex flex-row flex-wrap gap-4`) displaying file thumbnails/icons, category format badges, file names, size, and formatted dates.
- **Eye & Download Card Actions**: Each card features Eye (preview) and Download action buttons. Clicking Download triggers direct file download; clicking Eye or the card opens document preview in the same right window.
- **Document Preview Integration**: Previews files using `SafeDocumentPreview` and `DocumentViewer` with `DocumentViewerHeader` (featuring `HeaderActions`, file title, user profile icon, and close `X` button).

---

## 4. Codebase File Inventory

| File Path | Action | Description |
| :--- | :---: | :--- |
| `src/features/Message/services/user-storage-files.service.ts` | **CREATED** | Fetches user storage files and folders from Supabase Storage `chat-files` bucket & database vouchers. |
| `src/features/Message/components/files/user-file-cards-view.tsx` | **CREATED** | Renders horizontally aligned file cards with Eye and Download action buttons and search filtering. |
| `src/features/chattemplate/chat/services/chat-storage.service.ts` | **CREATED** | Storage helper (`getStoragePath`, `getChatFileCategory`, `normalizeContactEmail`, `generateUniqueFileName`). |
| `src/features/chattemplate/files/managers/attachment-uploader.ts` | **MODIFIED** | Manages dual XHR & fetch uploads to Sender & Receiver folders with `x-upsert: true` and session email fallback. |
| `src/features/chattemplate/chat/hooks/use-attachments.ts` | **MODIFIED** | Hook passing `senderEmail` and `receiverEmail` down to `uploadAttachment`. |
| `src/features/Message/components/chat/realtime-chat-view.tsx` | **MODIFIED** | Dynamically resolves `senderEmail` and `receiverEmail` from session and conversation members. |
| `src/features/chattemplate/contacts/api/contacts.api.ts` | **MODIFIED** | Normalizes contact email on contact creation without `.keep` files. |
| `src/features/chattemplate/chat/services/chat-storage.service.test.ts` | **CREATED** | Vitest test suite (`17/17 passed`) for storage rules. |
| `src/components/DocumentViewer/DocumentViewerHeader.tsx` | **MODIFIED** | Integrated `HeaderActions` on the top-right header next to close (`X`). |
| `src/features/Message/components/emails/email-list.tsx` | **MODIFIED** | Render user storage folders on left sidebar under File tab (`categoryFilter === 'vouchers'`). |
| `src/features/Message/index.tsx` | **MODIFIED** | Wired user storage folders, horizontally aligned `UserFileCardsView`, and `SafeDocumentPreview` in right window. |
| `memory.md` | **MODIFIED** | Persistent memory documentation of all project updates. |