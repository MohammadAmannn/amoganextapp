# UI & Design System Architecture Guide (`ui.md`)

This document is the authoritative design system and component UI reference for the **Message Page**, **Design System Gallery**, **Document Viewer**, and **Chat Template** modules. It defines exact styling tokens, tab underlines, card layouts, font hierarchies, icon button specs, mobile responsive flows, and file mappings to guarantee 100% visual and structural consistency across the application.

---

## 1. Core Visual Design Tokens & Typography

### HSL Color Tokens
- **Background & Card**: `bg-background` (`hsl(var(--background))`), `bg-card` (`hsl(var(--card))`), `bg-muted/10` to `bg-muted/30`.
- **Borders & Dividers**: `border-border` (`hsl(var(--border))`), `border-border/60`, `border-border/80`.
- **Text & Foreground**: `text-foreground` (primary headings & titles), `text-muted-foreground` (subtitles & timestamps).
- **Primary Brand Accent**: `bg-primary`, `text-primary`, `border-primary`.

### Typography Standard
- **Font Family**: Modern sans-serif (`font-sans antialiased`).
- **Font Sizes**:
  - `text-[9px]` / `text-[10px]`: Micro badges, uppercase labels, type tags (`FILE`, `DOC`, `XLS`, `PDF`).
  - `text-[11px]`: Secondary card subtitles, metadata, file sizes.
  - `text-xs`: Standard body text, tab labels, form field labels, button text.
  - `text-sm`: Component titles, card headers, user names, input text.
  - `text-base` / `text-lg`: Section titles, page headers.
- **Font Weights**:
  - `font-normal`: Body descriptions.
  - `font-medium`: Tab text, timestamps, subtitle metadata.
  - `font-semibold` / `font-bold`: Card titles, active tabs, header text.

---

## 2. Tab Navigation & Active Underline Standard

### A. Underline Tab Style (SubTabsBar, Gallery Stage Switcher)
All tab bars across the Message page, Email view, and Design System stage inspector enforce the **Underline Tab Pattern**:
- **Container**: `flex items-center gap-3 sm:gap-4 text-xs font-medium px-0.5 whitespace-nowrap overflow-x-auto shrink-0 select-none`.
- **Active Tab Style**:
  ```tsx
  'pb-1 border-b-2 border-primary text-foreground font-semibold cursor-pointer transition-all'
  ```
- **Inactive Tab Style**:
  ```tsx
  'pb-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground cursor-pointer transition-all'
  ```

### B. Category Toolbar Pills & HSL Token Mapping
Category toolbar pills use multi-line wrap with category-specific HSL badge colors:
- **Container**: `flex flex-wrap items-center gap-1.5 p-2.5 bg-muted/10 border-b border-border/60`.
- **Category HSL Colors**:
  - **Mail**: `bg-indigo-500/10 text-indigo-600 border-indigo-200/50 dark:border-indigo-900/40 dark:text-indigo-400`
  - **AI**: `bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-900/40 dark:text-amber-400`
  - **Chat**: `bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/40 dark:text-emerald-400`
  - **Task**: `bg-purple-500/10 text-purple-600 border-purple-200/50 dark:border-purple-900/40 dark:text-purple-400`
  - **Files**: `bg-sky-500/10 text-sky-600 border-sky-200/50 dark:border-sky-900/40 dark:text-sky-400`
  - **Notifications**: `bg-rose-500/10 text-rose-600 border-rose-200/50 dark:border-rose-900/40 dark:text-rose-400`
  - **Shared**: `bg-slate-500/10 text-slate-600 border-slate-200/50 dark:border-slate-800 dark:text-slate-400`
  - **Date Picker**: `bg-teal-500/10 text-teal-600 border-teal-200/50 dark:border-teal-900/40 dark:text-teal-400`
  - **Calendar**: `bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/40 dark:text-blue-400`
  - **Wizards**: `bg-violet-500/10 text-violet-600 border-violet-200/50 dark:border-violet-900/40 dark:text-violet-400`

---

## 3. Attachment Cards UI & "Attach Files" Standard

### A. Attachment Cards Group Container
Used across Email View, Chat View, Message Page, Vouchers, and Design System:
- **Outer Box**: `border border-border rounded-xl overflow-hidden bg-background w-full shadow-2xs`.
- **Card Rows**: `group flex items-center justify-between p-3 border-b border-border/80 last:border-b-0 w-full transition-colors hover:bg-muted/20`.

### B. Left Type Badge & Info Specs
- **Type Box**: `bg-muted/80 w-10 h-10 flex items-center justify-center rounded-lg border border-border/60 shrink-0`.
- **Type Label**: `<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{att.type}</span>` (e.g. `FILE`, `DOC`, `XLS`, `PDF`).
- **Filename**: `<p className="text-xs font-semibold text-foreground hover:underline truncate">{att.name}</p>`.
- **File Size**: `<p className="text-[10px] text-muted-foreground">{att.size}</p>`.

### C. Right Action Buttons Specs
- **Download Button**:
  ```tsx
  <button
    type="button"
    onClick={() => handleDownload(att)}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
    title="Download file"
  >
    <Download className="h-4 w-4" />
  </button>
  ```
- **Eye Icon (Preview Button)**:
  ```tsx
  <button
    type="button"
    onClick={() => handleOpenPreview(att)}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
    title="View file"
  >
    <Eye className="h-4 w-4" />
  </button>
  ```

### D. "Attach Files" Trigger Button
Full-width button placed below the attachment cards group:
```tsx
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-all cursor-pointer shadow-2xs"
>
  <Paperclip className="h-4 w-4 text-muted-foreground" />
  <span>Attach Files</span>
</button>
```

---

## 4. Document Viewer (`SafeDocumentPreview`) Architecture

All document and PDF viewing across Message page, Email view, Chat, Vouchers, and Design System strictly uses **`SafeDocumentPreview`** (`@/components/dynamic-form/SafeDocumentPreview`).

### A. Right Window Inline Canvas Container
- `w-full h-full flex-1 flex flex-col bg-background border-0 p-0 m-0 overflow-hidden`.

### B. Header Bar Architecture (`DocumentViewerHeader`)
- **Container**: `h-12 bg-card px-4 py-2.5 border-b border-border/80 flex items-center justify-between shrink-0 select-none w-full gap-3 shadow-2xs`.
- **Left Group**:
  - **Close Cross (`X`) Button**: `<Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"><X className="h-4.5 w-4.5" /></Button>`.
  - **Avatar Circle**: `<div className="h-9 w-9 rounded-full bg-[#EAE5FF] text-[#7C5CFC] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-[#DDD5FF]">M1</div>`.
  - **File Title**: `<h2 className="text-xs sm:text-sm text-foreground font-bold truncate">{fileName}</h2>`.
- **Right Group**: Notification Bell, Flag, 3-Dot options menu.

### C. Sub-Toolbar Controls Bar
- **Container**: `flex flex-none items-center justify-between border-b border-border bg-muted/10 px-4 py-1.5 select-none gap-2 z-10 flex-wrap`.
- **Zoom Controls**: `-` (Minus), `+` (Plus), Percentage readout (e.g. `105%`), `<->` (fit width), `Square` (reset view).
- **Download Action**: Right aligned `<button onClick={handleDownload}><Download className="size-3.5" /></button>`.

---

## 5. Mobile Responsiveness & Overlay Close (`X`) Flow

### A. Mobile Breakpoint Standard
- **Breakpoint**: `md` (`768px`).

### B. Mobile Screen Overlay Transition (`< md`)
- **ListComponent State**: On mobile screens, the left sidebar occupies full width.
- **Detail / Preview Transition**: Selecting a card or clicking the Eye icon toggles `isMobileDetailOpen` to `true`.
- **Full-Screen Stage Overlay**:
  ```tsx
  'fixed inset-0 z-50 flex flex-col w-full h-full bg-background md:relative md:inset-auto md:z-auto'
  ```

### C. Mobile Close Cross (`X`) Button Standard
- Upper-left of Stage Control Bar on mobile screens (`md:hidden`):
  ```tsx
  <button
    type="button"
    onClick={() => setIsMobileDetailOpen(false)}
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted cursor-pointer transition-colors md:hidden"
    title="Close & Back to List"
  >
    <X className="h-4.5 w-4.5" />
  </button>
  ```

---

## 6. Complete File & UI Component Mapping

### A. Core Document Viewer Components
| Component Name | File Path | Description |
| :--- | :--- | :--- |
| **Safe Document Preview** | [`SafeDocumentPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/components/dynamic-form/SafeDocumentPreview.tsx) | App-wide standard for rendering PDFs, images, text, and documents with zoom controls and header actions. |
| **Attachment Card Uploader** | [`attachment-card-uploader.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/Message/components/shared/attachment-card-uploader.tsx) | Standard attachment list cards layout (`FILE`, `DOC`, `XLS`, `PDF`) with download, eye icon preview, and full-width "Attach Files" button. |
| **Gallery File Uploader & Viewer** | [`FileUploaderAndViewerPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/FileUploaderAndViewerPreview.tsx) | Design system template component integrating `AttachmentCardUploader` card standard and `SafeDocumentPreview`. |