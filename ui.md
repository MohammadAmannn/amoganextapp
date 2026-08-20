# UI & Design System Architecture Guide (`ui.md`)

This document is the authoritative design system and component UI reference for the **Message Page**, **Design System Gallery**, **Document Viewer**, **Chat Template**, **Kanban Board**, **Vouchers**, **Analytics**, **Stats**, **Data Cards**, **Charts**, and **Maps** modules. It defines exact styling tokens, tab underlines, card layouts, font hierarchies, icon button specs, mobile responsive flows, and file mappings to guarantee 100% visual and structural consistency across the application.

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

---

## 2. Category Toolbar & Category Token Mapping

Category toolbar pills use multi-line wrap with category-specific HSL badge colors:
- **Container**: `flex flex-wrap items-center gap-1.5 p-2.5 bg-muted/10 border-b border-border/60`.
- **Category HSL Colors**:
  - **Data Cards**: `bg-teal-500/10 text-teal-600 border-teal-200/50 dark:border-teal-900/40 dark:text-teal-400`
  - **Analytics**: `bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/40 dark:text-blue-400`
  - **Stats**: `bg-purple-500/10 text-purple-600 border-purple-200/50 dark:border-purple-900/40 dark:text-purple-400`
  - **Charts**: `bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-900/40 dark:text-amber-400`
  - **Maps**: `bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/40 dark:text-emerald-400`

---

## 3. Data Cards Category & Component Architecture

### A. Data Cards Category (Selected 6 Card Components)
- **Category**: `Data Cards`
- **File**: [`src/features/MessageComponentGallery/previews/DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx)
- **Selected Cards**:
  1. **Card 19 - Integration Card**: `card-19-integration` (Slack toggle switch, connection status badge, and configure settings link).
  2. **Card 18 - Credit Card**: `card-18-credit-card` (Dark gradient VISA card with EMV chip, contactless wave icon, card number, and expiry date).
  3. **Card 17 - Ecommerce Product Variant Card**: `card-17-ecommerce-variant` (Product variant card with rating stars, price discount tag, color swatches, size selectors, and Add to Cart button).
  4. **Card 11 - Assign Task Card**: `card-11-assign-task` (Task assignment card with high priority badge, assignee avatar, due date, and Assign button).
  5. **Card 10 - Appointment Card**: `card-10-appointment` (Medical/Meeting appointment card with practitioner avatar, confirmed status, date, time, location room, and reschedule/telehealth buttons).
  6. **Card 06 - Statistics Card**: `card-06-statistics` (Revenue metric card with +18.4% growth badge, sparkline bar visualization, and target achievement ratio).

---

## 4. Complete File & UI Component Mapping

| Component Name | File Path | Description |
| :--- | :--- | :--- |
| **Card 19 - Integration Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Slack app integration card with toggle switch. |
| **Card 18 - Credit Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Dark gradient credit card component with EMV chip. |
| **Card 17 - Ecommerce Variant Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Product card with interactive color & size selectors. |
| **Card 11 - Assign Task Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Task assignment card with priority tag and assignee. |
| **Card 10 - Appointment Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Scheduled appointment card with date, time, and room location. |
| **Card 06 - Statistics Card** | [`DataCardsPreview.tsx`](file:///e:/morrai/shadcn-admin-main/src/features/MessageComponentGallery/previews/DataCardsPreview.tsx) | Revenue metric card with sparkline visualization. |