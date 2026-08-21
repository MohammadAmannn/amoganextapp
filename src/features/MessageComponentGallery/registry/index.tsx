'use client'

/**
 * Message Component Gallery — Registry
 *
 * Central registry of all Message Page components and full section layout views.
 * 100% mock data, zero Supabase calls, zero production modifications.
 */

import React from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  X,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  MoreHorizontal,
} from 'lucide-react'

// ─── Existing Message Page Components (unchanged) ────────────────────────────
import { ChatCardItem } from '@/features/Message/components/sidebar/chat-card-item'
import { ChatHeader } from '@/features/Message/components/chat/chat-header'
import { ChatView } from '@/features/Message/components/chat/chat-view'
import { MessageBubble } from '@/features/Message/components/chat/message-bubble'
import { MessageInput } from '@/features/Message/components/chat/message-input'
import { FileUploadProgress } from '@/features/Message/components/chat/file-upload-progress'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'
import { ThreeDotMenu } from '@/features/Message/components/chat/three-dot-menu'
import { AttachmentCardUploader } from '@/features/Message/components/shared/attachment-card-uploader'
import { EmailCardItem } from '@/features/Message/components/sidebar/email-card-item'
import { EmailListSkeleton } from '@/features/Message/components/sidebar/email-list-skeleton'
import { AiCardItem } from '@/features/Message/components/sidebar/ai-card-item'
import { TaskCardItem } from '@/features/Message/components/sidebar/task-card-item'
import { NotificationCardItem } from '@/features/Message/components/sidebar/notification-card-item'
import { FolderTreeItem } from '@/features/Message/components/sidebar/folder-tree-item'
import { SidebarHeader } from '@/features/Message/components/sidebar/sidebar-header'
import { CategoryToolbar } from '@/features/Message/components/sidebar/category-toolbar'
import { SubTabsBar } from '@/features/Message/components/sidebar/sub-tabs-bar'
import { SidebarSearchBar } from '@/features/Message/components/sidebar/sidebar-search-bar'
import { SidebarPagination } from '@/features/Message/components/sidebar/sidebar-pagination'

// ─── Rich Full-View Section Previews ─────────────────────────────────────────
import {
  CompleteTaskPagePreview,
  CompleteMailPagePreview,
  CompleteNotificationPagePreview,
  CompleteFilesPagePreview,
  CompleteChatPagePreview,
  CompleteAiPagePreview,
  MailViewPreview,
  EmailEditorPreview,
  NewEmailPreview,
  AiChatWindowPreview,
  EmailDetailPreview,
  QuestionnaireWizardPreview,
  ProgressLinearPreview,
  ProgressStepIndicatorPreview,
  ProgressCircularPreview,
  FileUploaderAndViewerPreview,
  FileUploadFormPreview,
  CompleteKanbanBoardPreview,
  CompleteVouchersPagePreview,
  AnalyticsPreview,
  StatsPreview,
  AreaChartPreview,
  BarChartPreview,
  LineChartPreview,
  PieChartPreview,
  RadarChartPreview,
  RadialChartPreview,
  TooltipChartPreview,
  MapPreview,
  DataCardsPreview,
  IntegrationCardPreview,
  CreditCardPreview,
  EcommerceProductCardPreview,
  AssignTaskCardPreview,
  AppointmentCardPreview,
  StatisticsCardPreview,
  NewVouncherScan,
  RichEditorPreview,
  NewVouncher,
  AppThemesPreview,
  LucideIconsPreview,
} from '../previews'

import {
  DatePickerSimplePreview,
  DatePickerRangePreview,
  DatePickerPresetsPreview,
  DatePickerFormPreview,
  CalendarSinglePreview,
  CalendarRangePreview,
  CalendarEventsPreview,
} from '../previews/DatePickerAndCalendarPreviews'

// ─── Mock Data ────────────────────────────────────────────────────────────────
import {
  mockChatEmails,
  mockChatMessages,
  mockChatMessageWithDoc,
  mockChatMessageReply,
  mockCurrentUser,
  mockEmails,
  mockNotifications,
  mockFolders,
  mockAiMessages,
} from '../mocks'

// ─── Types ────────────────────────────────────────────────────────────────────
export type GalleryCategory =
  | 'All'
  | 'Wizards'
  | 'Vouchers'
  | 'Kanban Board'
  | 'Data Cards'
  | 'Analytics'
  | 'Stats'
  | 'Charts'
  | 'Maps'
  | 'Task'
  | 'Mail'
  | 'Notifications'
  | 'Files'
  | 'Chat'
  | 'AI'
  | 'Shared'
  | 'Date Picker'
  | 'Calendar'
  | 'Rich Editor'
  | 'Theme'

export interface ComponentState {
  label: string
  description?: string
}

export interface GalleryEntry {
  id: string
  name: string
  category: GalleryCategory
  badge?: string
  description: string
  filePath: string
  states: ComponentState[]
  renderPreview: (stateIndex: number, options?: { viewport?: string; isMobileView?: boolean }) => React.ReactNode
  usageCode: (stateIndex: number) => string
}

// ─── Shared no-op helpers ─────────────────────────────────────────────────────
const noop = () => {}

function FloatingChatToolbarPill({ isCardClicked }: { isCardClicked?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const isVisible = isMenuOpen || isCardClicked

  return (
    <div
      className={cn(
        'absolute bottom-2 right-2 transition-all duration-200 transform z-10',
        isVisible
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-1 group-hover:translate-y-0'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='flex items-center gap-1 rounded-full border border-border/80 bg-background/95 px-2.5 py-1 shadow-lg text-muted-foreground text-xs backdrop-blur-xs'>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            toast.info('Playing audio...')
          }}
          className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          title='Audio'
        >
          <Volume2 className='h-3.5 w-3.5' />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            toast.success('Liked')
          }}
          className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          title='Like'
        >
          <ThumbsUp className='h-3.5 w-3.5' />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            toast.info('Disliked')
          }}
          className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          title='Dislike'
        >
          <ThumbsDown className='h-3.5 w-3.5' />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            toast.success('Copied text')
          }}
          className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          title='Copy'
        >
          <Copy className='h-3.5 w-3.5' />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            toast.info('Shared link')
          }}
          className='p-1 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          title='Share'
        >
          <Share2 className='h-3.5 w-3.5' />
        </button>
        <ThreeDotMenu onOpenChange={setIsMenuOpen} />
      </div>
    </div>
  )
}

function SideListCardPreview({ stateIndex }: { stateIndex: number }) {
  const [isClicked, setIsClicked] = React.useState(false)

  return (
    <div className='w-full flex flex-col items-start justify-start select-none font-sans'>
      <div
        onClick={() => setIsClicked((prev) => !prev)}
        className={cn(
          'group relative flex flex-col gap-1.5 rounded-xl p-4 transition-all duration-200 cursor-pointer border w-full',
          stateIndex === 1
            ? 'border-purple-300 dark:border-purple-700 bg-purple-500/15 shadow-sm'
            : 'border-purple-200/60 dark:border-purple-900/40 bg-purple-500/10 hover:bg-purple-500/15'
        )}
      >
        {/* Left accent bar */}
        <div className='absolute top-0 bottom-0 left-0 w-1 bg-purple-600 rounded-l-xl' />

        {/* Top Row: Sender Name & Clean Aligned Timestamp */}
        <div className='flex items-start justify-between gap-3 pl-1 pr-1'>
          <span className='font-bold text-sm text-foreground truncate'>
            Jordan Lee
          </span>
          <div className='text-right text-xs text-muted-foreground shrink-0 font-medium leading-tight'>
            <div>18 aug 26 14.41</div>
            <div className='text-[10px] text-muted-foreground/70 font-normal'>about 2 hours ago</div>
          </div>
        </div>

        {/* Subject & Body */}
        <div className='pl-1 pr-1 space-y-0.5 pb-2'>
          <p className='text-xs font-semibold text-foreground/90 line-clamp-1'>
            test to check auto sync aug 18 2.40
          </p>
          <p className='text-xs text-muted-foreground/80 line-clamp-1'>
            test to check auto sync aug 18 2.40
          </p>
        </div>

        {/* Mouse Hover / Mobile Click Floating Chat Icon Bar at Bottom */}
        <FloatingChatToolbarPill isCardClicked={isClicked} />
      </div>
    </div>
  )
}

// ─── Registry Definition ──────────────────────────────────────────────────────
export const galleryRegistry: GalleryEntry[] = [
  // ───────────────────────── TASK SECTION ───────────────────────────────────

  {
    id: 'complete-task-page',
    name: 'Complete Task Page (Sprint Board & Kanban)',
    category: 'Task',
    badge: 'Task Page',
    description: 'Exact full-view dual pane layout matching the Task section: Left sidebar with active Task card + Right main Sprint Board with draggable Kanban columns (To Do, In Progress, Under Review, Completed), priority badges, avatars, and task actions.',
    filePath: 'src/features/kanbantemplate/index.tsx',
    states: [
      { label: 'Live Sprint Board Layout', description: 'Full responsive dual-pane layout with interactive Kanban board' },
    ],
    renderPreview: (_si, opts) => <CompleteTaskPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  {/* Left Sidebar */}
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="tasks" />
    <SidebarSearchBar categoryFilter="tasks" />
    <div className="px-4 py-1 text-xs font-bold uppercase">Tasks</div>
    <TaskCardItem isSelected={true} onSelect={() => {}} />
  </div>

  {/* Right Main Stage */}
  <div className="flex-1 overflow-y-auto">
    <KanbanTemplate embedded={true} />
  </div>
</div>`,
  },

  {
    id: 'task-card-item',
    name: 'Task Card Item',
    category: 'Task',
    badge: 'Task Card',
    description: 'Sidebar card representing the Tasks / Kanban Board section. Shows project title, date range badge, and Kanban label.',
    filePath: 'src/features/Message/components/sidebar/task-card-item.tsx',
    states: [
      { label: 'Selected (Active)', description: 'Active selected state with purple indicator' },
      { label: 'Default', description: 'Normal unselected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <TaskCardItem isSelected={si === 0} onSelect={noop} />
      </div>
    ),
    usageCode: (si) => `<TaskCardItem
  isSelected={${si === 0}}
  onSelect={() => setSelectedView('tasks')}
/>`,
  },

  // ───────────────────────── NOTIFICATIONS SECTION ────────────────────────────

  {
    id: 'complete-notification-page',
    name: 'Complete Notifications Page (Layout)',
    category: 'Notifications',
    badge: 'Notifications',
    description: 'Full-view layout for Notifications: Left sidebar showing notification cards with unread badges + Right panel displaying detailed notification context, sender info, action triggers, and quick response options.',
    filePath: 'src/features/Message/components/panels/notification-detail-panel.tsx',
    states: [
      { label: 'Interactive Notifications View', description: 'Dual-pane notification management experience' },
    ],
    renderPreview: (_si, opts) => <CompleteNotificationPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader isNotificationSelected={true} />
    <CategoryToolbar />
    <SidebarSearchBar />
    {notifications.map(n => (
      <NotificationCardItem key={n.id} notification={n} isSelected={selectedId === n.id} onSelect={setSelected} />
    ))}
  </div>

  <div className="flex-1">
    <NotificationDetailPanel notification={selected} messageDetail={detail} isLoadingMessage={false} onClose={handleClose} />
  </div>
</div>`,
  },

  {
    id: 'notification-card-item',
    name: 'Notification Card Item',
    category: 'Notifications',
    badge: 'Notice Card',
    description: 'Sidebar notification item card. Shows sender name, message text, unread dot, timestamp, and Notification badge.',
    filePath: 'src/features/Message/components/sidebar/notification-card-item.tsx',
    states: [
      { label: 'Unread', description: 'Unread notification with bold styling' },
      { label: 'Read', description: 'Read notification, lighter styling' },
      { label: 'Selected', description: 'Active / selected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <NotificationCardItem
          notification={si === 1 ? mockNotifications[2] : mockNotifications[0]}
          isSelected={si === 2}
          onSelect={noop}
        />
      </div>
    ),
    usageCode: (si) => `<NotificationCardItem
  notification={mockNotification}
  isSelected={${si === 2}}
  onSelect={(notification) => openNotificationPanel(notification)}
/>`,
  },

  // ───────────────────────── FILES SECTION ───────────────────────────────────

  {
    id: 'complete-files-page',
    name: 'Complete Files Page (Storage Explorer)',
    category: 'Files',
    badge: 'Files Page',
    description: 'Full-view layout for Storage Files: Left sidebar showing the 3-level folder tree (Root -> User -> Subfolders) + Right area rendering the categorized file cards grid (PDF, Images, Word, Spreadsheets) with search, filter, and upload triggers.',
    filePath: 'src/features/Message/components/files/user-file-cards-view.tsx',
    states: [
      { label: 'Interactive Storage Explorer', description: 'Dual-pane storage and file explorer view' },
    ],
    renderPreview: (_si, opts) => <CompleteFilesPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="vouchers" />
    <SubTabsBar categoryFilter="vouchers" />
    <SidebarSearchBar categoryFilter="vouchers" onUploadFileClick={openUpload} />
    {folders.map(folder => (
      <FolderTreeItem key={folder.id} folder={folder} isFolderActive={selectedFolder.id === folder.id} onSelectFolder={setSelectedFolder} />
    ))}
  </div>

  <div className="flex-1 overflow-y-auto">
    <UserFileCardsView folder={selectedFolder} files={storageFiles} onSelectFileForPreview={previewFile} />
  </div>
</div>`,
  },

  {
    id: 'folder-tree-item',
    name: 'Folder Tree Item',
    category: 'Files',
    badge: 'Folder Tree',
    description: 'Collapsible folder tree node. Supports 3-level nesting (root → user email → category), file count badge, active/expanded states.',
    filePath: 'src/features/Message/components/sidebar/folder-tree-item.tsx',
    states: [
      { label: 'Root Level (L0)', description: 'Top-level folder' },
      { label: 'User Level (L1)', description: 'User email folder' },
      { label: 'Category Level (L2)', description: 'Sub-category folder' },
      { label: 'Active', description: 'Currently selected folder' },
    ],
    renderPreview: (si) => {
      const folder = mockFolders[si === 3 ? 2 : Math.min(si, 2)]
      return (
        <div className='w-72 p-2 space-y-1'>
          <FolderTreeItem
            folder={folder}
            isFolderActive={si === 3}
            isExpanded={si === 1}
            onToggleExpand={noop}
            onSelectFolder={() => toast.info(`Selected: ${folder.name} (preview only)`)}
          />
        </div>
      )
    },
    usageCode: (si) => `<FolderTreeItem
  folder={userFolder}
  isFolderActive={${si === 3}}
  isExpanded={${si === 1}}
  onToggleExpand={(id, e) => toggleFolder(id)}
  onSelectFolder={(folder) => setSelectedFolder(folder)}
/>`,
  },
  {
    id: 'file-uploader-viewer',
    name: 'File Uploader & Document Viewer',
    category: 'Files',
    badge: 'Doc Viewer',
    description: 'Interactive drag-and-drop file uploader with attachment cards, download action, JSON state export, and system default DocumentViewer file preview modal.',
    filePath: 'src/features/MessageComponentGallery/previews/FileUploaderAndViewerPreview.tsx',
    states: [
      { label: 'Interactive Uploader', description: 'Drag & drop uploader with attachment list, @zrimo/viewer document preview, and JSON export' },
    ],
    renderPreview: (si) => <FileUploaderAndViewerPreview stateIndex={si} />,
    usageCode: (si) => `// File Uploader & Document Viewer Component
import { FileUploaderAndViewer } from '@/components/DocumentViewer'

export default function FileUploaderPage() {
  return <FileUploaderAndViewer stateIndex={${si}} />
}`,
  },
  {
    id: 'file-upload-form',
    name: 'File Upload Form',
    category: 'Files',
    badge: 'Upload Form',
    description: 'Full-featured file upload form with template selector, subject input, folder & sub-folder dropdowns, rich body editor, attachment cards, upload progress bar, and submit action.',
    filePath: 'src/features/Message/components/files/file-upload-form.tsx',
    states: [
      { label: 'File Upload Form', description: 'Interactive upload form matching the Message page file section upload modal' },
    ],
    renderPreview: (si) => <FileUploadFormPreview stateIndex={si} />,
    usageCode: (si) => `// File Upload Form Component
import { FileUploadForm } from '@/features/Message/components/files/file-upload-form'

export default function UploadPage() {
  return (
    <FileUploadForm
      userEmail="user@amoga.app"
      onClose={() => console.log('Close')}
      onUploadSuccess={() => console.log('Success')}
    />
  )
}`,
  },

  // ───────────────────────── KANBAN BOARD SECTION ─────────────────────────

  {
    id: 'complete-kanban-board',
    name: 'Complete Kanban Board Template',
    category: 'Kanban Board',
    badge: 'Kanban Board',
    description: 'Full interactive Kanban Board template featuring draggable task columns (To Do, In Progress, Under Review, Completed), priority badges, assignee avatars, progress tracking, column actions, and task modals.',
    filePath: 'src/features/kanbantemplate/index.tsx',
    states: [
      { label: 'Kanban Board Template', description: 'Full responsive draggable Kanban Board template ready to reuse' },
    ],
    renderPreview: (si) => <CompleteKanbanBoardPreview stateIndex={si} />,
    usageCode: () => `// Complete Kanban Board Component
import KanbanTemplate from '@/features/kanbantemplate'

export default function KanbanPage() {
  return <KanbanTemplate embedded={true} />
}`,
  },

  // ───────────────────────── VOUCHERS SECTION ───────────────────────────────

  {
    id: 'complete-vouchers-page',
    name: 'Voucher Form (AI OCR & Print)',
    category: 'Vouchers',
    badge: 'Voucher Form',
    description: 'Complete interactive 3-step Voucher creation form (Upload Document, Edit Fields, Voucher Preview) featuring OCR document parser (PDF, PNG, JPG, DOCX), structured field editor (ReviewPanel), and document print preview.',
    filePath: 'src/features/vouchers/components/invoice-maker.tsx',
    states: [
      { label: 'Voucher Creation Form', description: 'Interactive 3-step voucher wizard with AI OCR document parser and review panel' },
    ],
    renderPreview: (si) => <CompleteVouchersPagePreview stateIndex={si} />,
    usageCode: () => `// Standalone Voucher Creation Form Component
import { InvoiceMaker } from '@/features/vouchers/components/invoice-maker'

export default function NewVoucherPage() {
  return <InvoiceMaker />
}`,
  },

//----new vouncher scan 
  {
    id: 'new-voucher-scan',
    name: 'New Voucher Scan',
    category: 'Vouchers',
    badge: 'Voucher Scan',
    description: 'Voucher document processing workflow featuring the file metadata upload form on Step 1 with auto OCR extraction.',
    filePath: 'src/features/MessageComponentGallery/previews/NewVouncherScan.tsx',
    states: [
      { label: 'Step 1: File Upload Form', description: 'Document upload with metadata fields' },
      { label: 'Step 2: Edit Fields', description: 'Review auto-parsed voucher fields' },
      { label: 'Step 3: Voucher Preview', description: 'Voucher preview and print' },
    ],
    renderPreview: (stateIndex) => <NewVouncherScan stateIndex={stateIndex} />,
    usageCode: () => `import { NewVouncher } from '@/features/MessageComponentGallery/previews'\n\nexport default function Page() {\n  return <NewVouncher />\n}`,
  },

  //----New Vounhcer 

   {
    id: 'new-vouncher',
    name: 'New Voucher ',
    category: 'Vouchers',
    badge: 'New Voucher',
    description: 'Voucher document processing workflow featuring the file metadata upload form on Step 1 with auto OCR extraction.',
    filePath: 'src/features/MessageComponentGallery/previews/NewVouncher.tsx',
    states: [ 
      { label: 'Step 1: File Upload Form', description: 'Document upload with metadata fields' },
      { label: 'Step 2: Edit Fields', description: 'Review auto-parsed voucher fields' },
      { label: 'Step 3: Voucher Preview', description: 'Voucher preview and print' },
    ],
    renderPreview: (stateIndex) => <NewVouncher stateIndex={stateIndex} />,
    usageCode: () => `import { NewVouncher } from '@/features/MessageComponentGallery/previews'\n\nexport default function Page() {\n  return <NewVouncher />\n}`,
  },


  

  // ───────────────────────── ANALYTICS SECTION ──────────────────────────────

  {
    id: 'complete-analytics-dashboard',
    name: 'Analytics Dashboard',
    category: 'Analytics',
    badge: 'Analytics',
    description: 'Complete analytics dashboard component featuring weekly traffic overview line chart, click metric cards (+12.4%), unique visitors, bounce rate, average session duration, top referrers, and device distribution lists.',
    filePath: 'src/features/dashboard/components/analytics.tsx',
    states: [
      { label: 'Analytics Dashboard', description: 'Full responsive analytics overview with charts, metrics, and referrer lists' },
    ],
    renderPreview: (si) => <AnalyticsPreview stateIndex={si} />,
    usageCode: () => `// Analytics Dashboard Component
import { Analytics } from '@/features/dashboard/components/analytics'

export default function AnalyticsPage() {
  return <Analytics />
}`,
  },

  // ───────────────────────── STATS SECTION ──────────────────────────────────

  {
    id: 'complete-stats-blocks',
    name: 'Stats Blocks Collection',
    category: 'Stats',
    badge: 'Stats Blocks',
    description: 'Complete collection of 15 beautifully styled metric & stats blocks: Trending indicators, border cards, badges, status indicators, circular progress rings, area sparklines, and usage breakdown bars.',
    filePath: 'src/features/dashboard/components/stats.tsx',
    states: [
      { label: 'All Stats Blocks (15)', description: 'Complete collection of 15 metric & stats cards' },
    ],
    renderPreview: () => <StatsPreview />,
    usageCode: () => `// Stats Component
import { Stats } from '@/features/dashboard/components/stats'

export default function StatsPage() {
  return <Stats />
}`,
  },

  // ───────────────────────── DATA CARDS SECTION ─────────────────────────────

  {
    id: 'card-19-integration',
    name: 'Card 19 - Integration Card',
    category: 'Data Cards',
    badge: 'Integration',
    description: 'App integration card featuring Slack integration status, toggle switch, connection badge, description, and settings link.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Integration Card', description: 'App integration card with toggle switch and status badge' },
    ],
    renderPreview: () => <IntegrationCardPreview />,
    usageCode: () => `import { IntegrationCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <IntegrationCardPreview />\n}`,
  },

  {
    id: 'card-18-credit-card',
    name: 'Card 18 - Credit Card',
    category: 'Data Cards',
    badge: 'Credit Card',
    description: 'Sleek credit card component featuring EMV chip, contactless wave icon, card number, cardholder name, expiration date, and Visa logo.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Credit Card', description: 'Dark gradient credit card with EMV chip and details' },
    ],
    renderPreview: () => <CreditCardPreview />,
    usageCode: () => `import { CreditCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <CreditCardPreview />\n}`,
  },

  {
    id: 'card-17-ecommerce-variant',
    name: 'Card 17 - Ecommerce Product Variant Card',
    category: 'Data Cards',
    badge: 'Ecommerce',
    description: 'Product card featuring product image, rating stars, price discount tag, interactive color swatches, size selector buttons, and Add to Cart button.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Ecommerce Variant Card', description: 'Product variant card with color & size selectors' },
    ],
    renderPreview: () => <EcommerceProductCardPreview />,
    usageCode: () => `import { EcommerceProductCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <EcommerceProductCardPreview />\n}`,
  },

  {
    id: 'card-11-assign-task',
    name: 'Card 11 - Assign Task Card',
    category: 'Data Cards',
    badge: 'Assign Task',
    description: 'Task assignment card featuring priority badge, task description, assignee selector avatar, due date indicator, and Assign Task confirm button.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Assign Task Card', description: 'Task assignment card with priority badge and assignee selector' },
    ],
    renderPreview: () => <AssignTaskCardPreview />,
    usageCode: () => `import { AssignTaskCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <AssignTaskCardPreview />\n}`,
  },

  {
    id: 'card-10-appointment',
    name: 'Card 10 - Appointment Card',
    category: 'Data Cards',
    badge: 'Appointment',
    description: 'Medical & Meeting appointment card featuring practitioner avatar, confirmation status badge, scheduled date & time, location room, and reschedule/join actions.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Appointment Card', description: 'Appointment card with date, time, location, and action buttons' },
    ],
    renderPreview: () => <AppointmentCardPreview />,
    usageCode: () => `import { AppointmentCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <AppointmentCardPreview />\n}`,
  },

  {
    id: 'card-06-statistics',
    name: 'Card 06 - Statistics Card',
    category: 'Data Cards',
    badge: 'Statistics',
    description: 'Revenue & Metric statistics card featuring primary metric value ($128,450.00), growth percentage badge (+18.4%), mini sparkline visualization, and target achievement ratio.',
    filePath: 'src/features/MessageComponentGallery/previews/DataCardsPreview.tsx',
    states: [
      { label: 'Statistics Card', description: 'Metric stat card with percent growth badge and sparkline' },
    ],
    renderPreview: () => <StatisticsCardPreview />,
    usageCode: () => `import { StatisticsCardPreview } from '@/features/MessageComponentGallery/previews'\n\nexport default function CardPage() {\n  return <StatisticsCardPreview />\n}`,
  },

  // ───────────────────────── CHARTS SECTION ─────────────────────────────────

  {
    id: 'area-chart-card',
    name: 'Area Chart Card',
    category: 'Charts',
    badge: 'Area Chart',
    description: 'Responsive Area Chart component featuring dual gradient filled paths, time range selectors (30d / 7d), interactive tooltip tooltips, and total desktop/mobile visitor metrics.',
    filePath: 'src/features/charttemplate/components/AreaChartCard.tsx',
    states: [
      { label: 'Area Chart', description: 'Gradient area chart with time range selector' },
    ],
    renderPreview: () => <AreaChartPreview />,
    usageCode: () => `import { AreaChartCard } from '@/features/charttemplate/components/AreaChartCard'\n\nexport default function ChartPage() {\n  return <AreaChartCard />\n}`,
  },

  {
    id: 'bar-chart-card',
    name: 'Bar Chart Card',
    category: 'Charts',
    badge: 'Bar Chart',
    description: 'Stacked Bar Chart component displaying multi-series data bars (Desktop vs Mobile) with date axis formatting, legend indicators, and responsive card wrapper.',
    filePath: 'src/features/charttemplate/components/BarChartCard.tsx',
    states: [
      { label: 'Bar Chart', description: 'Stacked bar chart with dual series breakdown' },
    ],
    renderPreview: () => <BarChartPreview />,
    usageCode: () => `import { BarChartCard } from '@/features/charttemplate/components/BarChartCard'\n\nexport default function ChartPage() {\n  return <BarChartCard />\n}`,
  },

  {
    id: 'line-chart-card',
    name: 'Line Chart Card',
    category: 'Charts',
    badge: 'Line Chart',
    description: 'Smooth curved Line Chart component featuring multi-line metrics, active dot highlights, custom tooltip content, and responsive container scaling.',
    filePath: 'src/features/charttemplate/components/LineChartCard.tsx',
    states: [
      { label: 'Line Chart', description: 'Curved multi-line trend chart' },
    ],
    renderPreview: () => <LineChartPreview />,
    usageCode: () => `import { LineChartCard } from '@/features/charttemplate/components/LineChartCard'\n\nexport default function ChartPage() {\n  return <LineChartCard />\n}`,
  },

  {
    id: 'pie-chart-card',
    name: 'Pie & Donut Chart Card',
    category: 'Charts',
    badge: 'Pie Chart',
    description: 'Donut Pie Chart component displaying category distributions, central summary label, colored segment keys, and total percentage breakdown.',
    filePath: 'src/features/charttemplate/components/PieChartCard.tsx',
    states: [
      { label: 'Pie & Donut Chart', description: 'Donut chart with category legend keys' },
    ],
    renderPreview: () => <PieChartPreview />,
    usageCode: () => `import { PieChartCard } from '@/features/charttemplate/components/PieChartCard'\n\nexport default function ChartPage() {\n  return <PieChartCard />\n}`,
  },

  {
    id: 'radar-chart-card',
    name: 'Radar Chart Card',
    category: 'Charts',
    badge: 'Radar Chart',
    description: 'Polygonal Radar Chart component comparing multi-axis performance metrics across desktop and mobile platforms with custom grid colors.',
    filePath: 'src/features/charttemplate/components/RadarChartCard.tsx',
    states: [
      { label: 'Radar Chart', description: 'Multi-axis radar polygon chart' },
    ],
    renderPreview: () => <RadarChartPreview />,
    usageCode: () => `import { RadarChartCard } from '@/features/charttemplate/components/RadarChartCard'\n\nexport default function ChartPage() {\n  return <RadarChartCard />\n}`,
  },

  {
    id: 'radial-chart-card',
    name: 'Radial Bar Chart Card',
    category: 'Charts',
    badge: 'Radial Chart',
    description: 'Concentric Radial Bar Chart displaying percentage completion rings with central metric text and subtle background tracks.',
    filePath: 'src/features/charttemplate/components/RadialChartCard.tsx',
    states: [
      { label: 'Radial Chart', description: 'Circular radial progress rings' },
    ],
    renderPreview: () => <RadialChartPreview />,
    usageCode: () => `import { RadialChartCard } from '@/features/charttemplate/components/RadialChartCard'\n\nexport default function ChartPage() {\n  return <RadialChartCard />\n}`,
  },

  {
    id: 'tooltip-chart-card',
    name: 'Tooltip & Formatted Chart Card',
    category: 'Charts',
    badge: 'Tooltip Chart',
    description: 'Advanced Interactive Chart featuring custom popover tooltips, currency formatters, date range toggles, and detail data inspection.',
    filePath: 'src/features/charttemplate/components/TooltipChartCard.tsx',
    states: [
      { label: 'Tooltip Chart', description: 'Interactive chart with popover detail inspector' },
    ],
    renderPreview: () => <TooltipChartPreview />,
    usageCode: () => `import { TooltipChartCard } from '@/features/charttemplate/components/TooltipChartCard'\n\nexport default function ChartPage() {\n  return <TooltipChartCard />\n}`,
  },

  // ───────────────────────── MAPS SECTION ───────────────────────────────────

  {
    id: 'complete-map-template',
    name: 'Interactive Map Template',
    category: 'Maps',
    badge: 'Map View',
    description: 'Full interactive Leaflet/MapLibre map component with location search bar (`MapSearchBar`), custom pin markers, popup detail cards (`MapPopup`), explore location panels, and zoom controls.',
    filePath: 'src/features/map/index.tsx',
    states: [
      { label: 'Interactive Map', description: 'Full responsive map view with search bar and location markers' },
    ],
    renderPreview: (si) => <MapPreview stateIndex={si} />,
    usageCode: () => `// Complete Map Template Component
import MapPage from '@/features/map'

export default function MapScreen() {
  return <MapPage />
}`,
  },

  // ───────────────────────── MAIL SECTION ───────────────────────────────────

  {
    id: 'complete-mail-page',
    name: 'Complete Mail Page (Layout)',
    category: 'Mail',
    badge: 'Mail Page',
    description: 'Full split-screen Mail Page layout showing the interactive left sidebar (Inbox/Sent tabs, search bar, email cards, pagination) combined with the active email reader and composer.',
    filePath: 'src/features/Message/index.tsx',
    states: [
      { label: 'Interactive Live Mail Page', description: 'Full responsive dual-pane layout with email switching and compose mode' },
    ],
    renderPreview: (_si, opts) => <CompleteMailPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader unreadCount={unreadCount} />
    <CategoryToolbar categoryFilter="mail" />
    <SubTabsBar categoryFilter="mail" activeTab={activeTab} onTabChange={setActiveTab} />
    <SidebarSearchBar searchQuery={query} setSearchQuery={setQuery} categoryFilter="mail" />
    <div className="overflow-y-auto">
      {emails.map(email => (
        <EmailCardItem key={email.id} email={email} isSelected={selectedId === email.id} onSelect={setSelectedEmail} />
      ))}
    </div>
    <SidebarPagination page={page} limit={20} total={total} />
  </div>

  <div className="flex-1">
    {isComposing ? (
      <NewEmail onCancel={() => setIsComposing(false)} onSend={handleSend} onSaveDraft={handleDraft} />
    ) : selectedEmail ? (
      <EmailView email={selectedEmail} onBack={handleBack} onDelete={handleDelete} />
    ) : null}
  </div>
</div>`,
  },

  {
    id: 'email-view',
    name: 'Email View (Full Reader)',
    category: 'Mail',
    badge: 'Email Reader',
    description: 'Complete email viewing screen with sender information, recipient badges, CC/BCC display, sanitized HTML body, download buttons, attachments grid, and reply composer.',
    filePath: 'src/features/Message/components/emails/email-view.tsx',
    states: [
      { label: 'Default', description: 'Full email reader with attachments' },
    ],
    renderPreview: (_si) => <MailViewPreview />,
    usageCode: (_si) => `<EmailView
  email={mockEmail}
  onBack={() => navigateBack()}
  onDelete={(id) => deleteEmail(id)}
  onStartChat={() => startChatWithSender()}
  onPreviewAttachment={(attachment) => previewDocument(attachment)}
/>`,
  },

  {
    id: 'new-email',
    name: 'New Email (Composer Modal)',
    category: 'Mail',
    badge: 'New Email',
    description: 'Full-featured email composer with To/CC/BCC recipient fields, Subject input, Template dropdown, Priority flags, Attachment picker with upload progress, and Rich text editor.',
    filePath: 'src/features/Message/components/emails/new-email.tsx',
    states: [
      { label: 'Default Composer', description: 'Full new email creation screen' },
    ],
    renderPreview: (_si) => <NewEmailPreview />,
    usageCode: (_si) => `<NewEmail
  onCancel={() => setIsComposing(false)}
  onSend={(emailData) => handleSendEmail(emailData)}
  onSaveDraft={(emailData) => handleSaveDraft(emailData)}
  onPreviewAttachment={(attachment) => handlePreviewAttachment(attachment)}
/>`,
  },

  {
    id: 'email-editor',
    name: 'Email Editor (Inline Reply)',
    category: 'Mail',
    badge: 'Inline Reply',
    description: 'Inline quick reply editor with rich text toolbar (Bold, Italic, Strikethrough, Code, H1-H6 headings, Lists, Links, Undo/Redo), Cmd+J AI autocomplete tip, and send button.',
    filePath: 'src/features/Message/components/emails/email-editor.tsx',
    states: [
      { label: 'Default Reply Editor', description: 'Inline reply box with toolbar' },
    ],
    renderPreview: (_si) => <EmailEditorPreview />,
    usageCode: (_si) => `<EmailEditor
  recipientName="Jordan Lee"
  recipientEmail="jordan@demo.com"
  onSend={(content) => handleSendReply(content)}
/>`,
  },

  {
    id: 'email-detail',
    name: 'Email Detail View',
    category: 'Mail',
    badge: 'Email Detail',
    description: 'Structured email reader displaying sender avatar, timestamp, sanitized HTML email body or newsletter deal mockup, action icons, and reply composer.',
    filePath: 'src/features/Message/components/emails/email-detail.tsx',
    states: [
      { label: 'Email 1', description: 'Project update email' },
      { label: 'Email 2', description: 'Meeting notes' },
    ],
    renderPreview: (_si) => <EmailDetailPreview />,
    usageCode: (_si) => `<EmailDetail
  email={mockEmail}
  onSendReply={(content) => handleSendReply(content)}
  onDelete={(id) => handleDelete(id)}
  onArchive={(id) => handleArchive(id)}
/>`,
  },

  {
    id: 'email-card-item',
    name: 'Email Card Item',
    category: 'Mail',
    badge: 'Email Card',
    description: 'Email list item card. Shows sender avatar, name, subject, preview snippet, labels, unread dot, timestamp, and 10-action dropdown menu.',
    filePath: 'src/features/Message/components/sidebar/email-card-item.tsx',
    states: [
      { label: 'Unread', description: 'Unread email with bold styling' },
      { label: 'Read', description: 'Read email, lighter styling' },
      { label: 'Selected', description: 'Active / selected state' },
      { label: 'With Attachment', description: 'Email with file attachment' },
    ],
    renderPreview: (si) => {
      const email = si === 3 ? mockEmails[0] : si === 1 ? mockEmails[1] : si === 2 ? { ...mockEmails[0], read: false } : mockEmails[2]
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <EmailCardItem
            email={email}
            isSelected={si === 2}
            isCollapsed={false}
            onSelect={noop}
          />
        </div>
      )
    },
    usageCode: (si) => `<EmailCardItem
  email={mockEmail}
  isSelected={${si === 2}}
  isCollapsed={false}
  onSelect={(email) => setSelectedEmail(email)}
/>`,
  },

  {
    id: 'email-list-skeleton',
    name: 'Email List Skeleton',
    category: 'Mail',
    badge: 'Skeleton',
    description: 'Animated loading skeleton displayed in the sidebar while emails are being fetched.',
    filePath: 'src/features/Message/components/sidebar/email-list-skeleton.tsx',
    states: [
      { label: 'Default', description: 'Loading placeholder' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <EmailListSkeleton />
      </div>
    ),
    usageCode: (_si) => `// Show during email fetch
{isEmailsLoading && <EmailListSkeleton />}`,
  },

  // ───────────────────────── CHAT SECTION ───────────────────────────────────

  {
    id: 'complete-chat-page',
    name: 'Complete Chat Page (Layout)',
    category: 'Chat',
    badge: 'Chat Page',
    description: 'Full-view dual-pane layout for Chat: Left sidebar with subtabs (Chats, Contacts, Groups, Folders) and conversation cards + Right area with active chat view, header, reactions, file progress, and composer.',
    filePath: 'src/features/Message/components/chat/chat-view.tsx',
    states: [
      { label: 'Interactive Live Chat Page', description: 'Full dual-pane chat conversation view' },
    ],
    renderPreview: (_si, opts) => <CompleteChatPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="chat" />
    <SubTabsBar categoryFilter="chat" activeTab="chats" />
    <SidebarSearchBar categoryFilter="chat" />
    {chats.map(c => (
      <ChatCardItem key={c.id} email={c} isSelected={selectedId === c.id} onSelect={setSelected} />
    ))}
  </div>

  <div className="flex-1">
    <ChatView chatName="Alex Johnson" messages={messages} onSendMessage={handleSend} currentUser={currentUser} />
  </div>
</div>`,
  },

  {
    id: 'chat-view',
    name: 'Chat View (Full Screen)',
    category: 'Chat',
    badge: 'Chat View',
    description: 'Complete chat conversation view. Includes header, scrollable message stream with multi-type bubbles (text, media, doc, reply), file upload progress, and message composer.',
    filePath: 'src/features/Message/components/chat/chat-view.tsx',
    states: [
      { label: 'With Messages', description: 'Conversation with mock messages' },
      { label: 'Empty', description: 'No messages yet state' },
    ],
    renderPreview: (si) => (
      <div className='w-full h-[540px] rounded-xl overflow-hidden border border-border relative'>
        <ChatView
          chatName='Alex Johnson'
          chatAvatar=''
          membersCount={2}
          onlineCount={1}
          messages={si === 1 ? [] : mockChatMessages}
          onBack={() => toast.info('Back (preview only)')}
          onSendMessage={() => toast.info('Send (preview only)')}
          currentUser={mockCurrentUser}
        />
      </div>
    ),
    usageCode: (si) => `<ChatView
  chatName="Alex Johnson"
  membersCount={2}
  onlineCount={1}
  messages={${si === 1 ? '[]' : 'mockChatMessages'}}
  onBack={() => {}}
  onSendMessage={(content, attachment, replyTo) => {}}
  currentUser={currentUser}
/>`,
  },

  {
    id: 'chat-card-item',
    name: 'Chat Card Item',
    category: 'Chat',
    badge: 'Chat Card',
    description: 'Sidebar list card for a chat conversation or contact. Shows name, member count, last message snippet, and unread indicator.',
    filePath: 'src/features/Message/components/sidebar/chat-card-item.tsx',
    states: [
      { label: 'Default', description: 'Standard group chat card' },
      { label: 'Unread', description: 'Card with unread indicator' },
      { label: 'Selected', description: 'Active / selected state' },
      { label: 'Collapsed', description: 'Icon-only collapsed mode' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <ChatCardItem
          email={si === 1 ? { ...mockChatEmails[2], read: false } : si === 2 ? mockChatEmails[0] : mockChatEmails[1]}
          isSelected={si === 2}
          isCollapsed={si === 3}
          onSelect={noop}
        />
      </div>
    ),
    usageCode: (si) => `<ChatCardItem
  email={mockChatEmail}
  isSelected={${si === 2}}
  isCollapsed={${si === 3}}
  onSelect={(email) => console.log('selected', email.id)}
/>`,
  },

  {
    id: 'chat-header',
    name: 'Chat Header',
    category: 'Chat',
    badge: 'Chat Header',
    description: 'Top bar of a chat conversation. Shows avatar, name, member/online count, typing indicator, back button (mobile), and action menu.',
    filePath: 'src/features/Message/components/chat/chat-header.tsx',
    states: [
      { label: 'Default', description: 'Standard header' },
      { label: 'Typing', description: 'Shows typing indicator' },
      { label: 'Group Chat', description: 'Group with member count' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <ChatHeader
          chatName={si === 2 ? 'Design Squad' : 'Alex Johnson'}
          subtitle={si === 2 ? '5 members, 3 online' : 'Last seen 2 mins ago'}
          typingText={si === 1 ? 'Alex is typing...' : undefined}
          onBack={noop}
          onShowProfile={noop}
        />
      </div>
    ),
    usageCode: (si) => `<ChatHeader
  chatName="${si === 2 ? 'Design Squad' : 'Alex Johnson'}"
  subtitle="${si === 2 ? '5 members, 3 online' : 'Last seen 2 mins ago'}"
  ${si === 1 ? 'typingText="Alex is typing..."' : ''}
  onBack={() => {}}
  onShowProfile={() => {}}
/>`,
  },

  {
    id: 'message-bubble',
    name: 'Message Bubble',
    category: 'Chat',
    badge: 'Bubble',
    description: 'Individual message bubble. Supports text, image, video, document, voice, location, reply-to, forward, and action toolbar on hover.',
    filePath: 'src/features/Message/components/chat/message-bubble.tsx',
    states: [
      { label: 'Text Message', description: 'Plain text bubble' },
      { label: 'Own Message', description: 'Sent by current user' },
      { label: 'With Document', description: 'PDF/document attachment' },
      { label: 'With Reply', description: 'Reply-to reference' },
    ],
    renderPreview: (si) => {
      const msgs = [mockChatMessages[0], mockChatMessages[1], mockChatMessageWithDoc, mockChatMessageReply]
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <MessageBubble
            msg={msgs[si] || msgs[0]}
            isHighlighted={false}
            activeToolbarMessageId={null}
            setActiveToolbarMessageId={noop as any}
            onScrollToReply={noop}
            onPreviewDoc={noop}
            onPreviewImage={noop}
            onPreviewMap={noop}
            onRetryPdf={noop}
            formatTime={(d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            formatFileSize={(b) => b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`}
            getFileType={(n) => n.split('.').pop()?.toLowerCase()}
          />
        </div>
      )
    },
    usageCode: (si) => `<MessageBubble
  msg={mockChatMessage}
  isHighlighted={false}
  activeToolbarMessageId={null}
  setActiveToolbarMessageId={() => {}}
  onScrollToReply={() => {}}
  onPreviewDoc={(attachment) => {}}
  onPreviewImage={(attachment) => {}}
  onPreviewMap={(location) => {}}
  onRetryPdf={(id) => {}}
  formatTime={(date) => date.toLocaleTimeString()}
  formatFileSize={(bytes) => \`\${Math.round(bytes/1024)} KB\`}
  getFileType={(name) => name.split('.').pop()}
/>`,
  },

  {
    id: 'file-upload-progress',
    name: 'File Upload Progress',
    category: 'Chat',
    badge: 'Upload Bar',
    description: 'Animated file upload progress bar shown inside the chat and composer while a file is being uploaded.',
    filePath: 'src/features/Message/components/chat/file-upload-progress.tsx',
    states: [
      { label: 'Uploading 45%', description: 'Mid-upload state' },
      { label: 'Uploading 90%', description: 'Nearly complete' },
      { label: 'Completed', description: 'Upload finished' },
    ],
    renderPreview: (si) => {
      const progress = si === 0 ? 45 : si === 1 ? 90 : 100
      const status: 'uploading' | 'completed' | 'error' = si === 2 ? 'completed' : 'uploading'
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <FileUploadProgress
            fileName='Q3-Report-2026.pdf'
            fileSize={1240000}
            progress={progress}
            status={status}
            onCancel={() => toast.info('Cancel clicked (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => `<FileUploadProgress
  fileName="Q3-Report-2026.pdf"
  fileSize={1240000}
  progress={${si === 0 ? 45 : si === 1 ? 90 : 100}}
  status="${si === 2 ? 'completed' : 'uploading'}"
  onCancel={() => {}}
/>`,
  },

  // ───────────────────────── AI ASSISTANT SECTION ───────────────────────────

  {
    id: 'complete-ai-page',
    name: 'Complete AI Page (Layout)',
    category: 'AI',
    badge: 'AI Assistant',
    description: 'Full dual-pane layout for AI Assistant: Left sidebar with subtabs (AI Chat, Recent, Prompts) + Right area hosting the multi-model AI Assistant window with tool switcher and conversation stream.',
    filePath: 'src/features/Message/components/panels/ai-chat-panel.tsx',
    states: [
      { label: 'Interactive AI Assistant Page', description: 'Full dual-pane AI assistant workspace' },
    ],
    renderPreview: (_si, opts) => <CompleteAiPagePreview isMobileView={opts?.isMobileView} />,
    usageCode: (_si) => `<div className="flex h-full w-full">
  <div className="w-80 border-r">
    <SidebarHeader />
    <CategoryToolbar categoryFilter="ai" />
    <SubTabsBar categoryFilter="ai" activeTab="ai-chat" />
    <SidebarSearchBar categoryFilter="ai" />
    <AiCardItem isSelected={true} onSelect={() => {}} />
  </div>

  <div className="flex-1">
    <AiChatPanel onBack={() => {}} />
  </div>
</div>`,
  },

  {
    id: 'ai-chat-panel',
    name: 'AI Chat Window (Assistant)',
    category: 'AI',
    badge: 'AI Window',
    description: 'Full AI Assistant chat window featuring multi-model selection (Gemini 2.5, Claude 3.5, GPT-4o, DeepSeek R1), tool switches (Chat, Web Search, Code), suggestion pills, rich markdown code syntax highlighting, citations/sources, voice input, and document analysis.',
    filePath: 'src/features/Message/components/panels/ai-chat-panel.tsx',
    states: [
      { label: 'Active Conversation (Code & Sources)', description: 'Shows response with syntax highlighting, bullet points, and citations' },
      { label: 'Empty State (Suggestions & Tools)', description: 'Initial prompt recommendation cards' },
    ],
    renderPreview: (si) => <AiChatWindowPreview initialState={si === 1 ? 'empty' : 'conversation'} />,
    usageCode: (si) => `<AiChatPanel
  onBack={() => handleClosePanel()}
/>`,
  },

  {
    id: 'ai-card-item',
    name: 'AI Card Item',
    category: 'AI',
    badge: 'AI Card',
    description: 'Sidebar card for the AI Assistant entry point. Shows Bot icon, AI badge, and last prompt preview.',
    filePath: 'src/features/Message/components/sidebar/ai-card-item.tsx',
    states: [
      { label: 'Default', description: 'Normal unselected state' },
      { label: 'Selected', description: 'Active / selected state' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <AiCardItem isSelected={si === 1} onSelect={noop} />
      </div>
    ),
    usageCode: (si) => `<AiCardItem
  isSelected={${si === 1}}
  onSelect={() => setSelectedView('ai')}
/>`,
  },

  // ─────────────────────── SHARED / TOOLBARS SECTION ────────────────────────

  {
    id: 'sidebar-header',
    name: 'Sidebar Header',
    category: 'Shared',
    badge: 'Sidebar Header',
    description: 'Desktop-only sidebar top bar with "Messages" title, email settings icon, and notification bell with unread badge.',
    filePath: 'src/features/Message/components/sidebar/sidebar-header.tsx',
    states: [
      { label: 'Default', description: 'No notifications' },
      { label: 'With Notifications', description: '3 unread notifications' },
      { label: 'Settings Active', description: 'Settings icon highlighted' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <SidebarHeader
          unreadCount={si === 1 ? 3 : 0}
          isEmailSettingsSelected={si === 2}
          isNotificationSelected={false}
          onSelectEmailSettings={() => toast.info('Settings (preview only)')}
          onSelectNotification={() => toast.info('Notifications (preview only)')}
        />
      </div>
    ),
    usageCode: (si) => `<SidebarHeader
  unreadCount={${si === 1 ? 3 : 0}}
  isEmailSettingsSelected={${si === 2}}
  isNotificationSelected={false}
  onSelectEmailSettings={() => setView('settings')}
  onSelectNotification={() => setView('notifications')}
/>`,
  },

  {
    id: 'category-toolbar',
    name: 'Category Toolbar',
    category: 'Shared',
    badge: 'Toolbar',
    description: 'Horizontal icon toolbar with 6 category buttons: Tasks, Mail, Chat, AI Chat, AI Assistant, Files/Vouchers.',
    filePath: 'src/features/Message/components/sidebar/category-toolbar.tsx',
    states: [
      { label: 'Tasks Active', description: 'Tasks / Kanban icon selected (purple)' },
      { label: 'Mail Active', description: 'Mail category selected' },
      { label: 'Chat Active', description: 'Chat category selected' },
      { label: 'AI Active', description: 'AI Chat selected' },
    ],
    renderPreview: (si) => {
      const filters = ['tasks', 'mail', 'chat', 'ai'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <CategoryToolbar
            categoryFilter={filters[si]}
            onSelectTasks={() => toast.info('Tasks (preview only)')}
            onSelectMail={() => toast.info('Mail (preview only)')}
            onSelectChat={() => toast.info('Chat (preview only)')}
            onSelectAi={() => toast.info('AI Chat (preview only)')}
            onSelectAiAssistant={() => toast.info('AI Assistant (preview only)')}
            onSelectVouchers={() => toast.info('Files (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const filters = ['tasks', 'mail', 'chat', 'ai']
      return `<CategoryToolbar
  categoryFilter="${filters[si]}"
  onSelectTasks={() => {}}
  onSelectMail={() => {}}
  onSelectChat={() => {}}
  onSelectAi={() => {}}
  onSelectAiAssistant={() => {}}
  onSelectVouchers={() => {}}
/>`
    },
  },

  {
    id: 'sub-tabs-bar',
    name: 'Sub Tabs Bar',
    category: 'Shared',
    badge: 'Subtabs',
    description: 'Dynamic tab bar below the category toolbar. Shows context-specific tabs: Inbox/Sent/Folder for mail, Chats/Contact/Groups for chat, etc.',
    filePath: 'src/features/Message/components/sidebar/sub-tabs-bar.tsx',
    states: [
      { label: 'Mail Tabs', description: 'Inbox, Sent, Folder, Contact, Groups' },
      { label: 'Chat Tabs', description: 'Chats, Contact, Groups, Folder' },
      { label: 'AI Tabs', description: 'AI Chat, Recent, Prompts' },
      { label: 'File Tabs', description: 'File, Recent' },
    ],
    renderPreview: (si) => {
      const filters = ['mail', 'chat', 'ai', 'vouchers'] as const
      const tabs = ['inbox', 'chats', 'ai-chat', 'file'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <SubTabsBar
            categoryFilter={filters[si]}
            activeTab={tabs[si]}
            total={si === 0 ? 48 : 0}
            page={1}
            limit={20}
            hasMore={si === 0}
            onTabChange={(tab) => toast.info(`Tab: ${tab} (preview only)`)}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const filters = ['mail', 'chat', 'ai', 'vouchers']
      return `<SubTabsBar
  categoryFilter="${filters[si]}"
  activeTab="inbox"
  total={48}
  page={1}
  limit={20}
  hasMore={true}
  onTabChange={(tab) => setActiveTab(tab)}
  onModeChange={(mode) => setMode(mode)}
/>`
    },
  },

  {
    id: 'sidebar-search-bar',
    name: 'Sidebar Search Bar',
    category: 'Shared',
    badge: 'Search Bar',
    description: 'Search input with clear button. Shows a "New Email" compose button for mail mode or "Upload" button for file mode.',
    filePath: 'src/features/Message/components/sidebar/sidebar-search-bar.tsx',
    states: [
      { label: 'Mail Mode', description: 'With compose button' },
      { label: 'File Mode', description: 'With upload button' },
      { label: 'Chat Mode', description: 'Search only' },
    ],
    renderPreview: (si) => {
      const cats = ['mail', 'vouchers', 'chat'] as const
      const modes = ['mail', 'mail', 'chat'] as const
      return (
        <div className='w-full flex flex-col items-start justify-start'>
          <SidebarSearchBar
            searchQuery=''
            setSearchQuery={noop}
            categoryFilter={cats[si]}
            sectionMode={modes[si]}
            onComposeChange={() => toast.info('Compose (preview only)')}
            onUploadFileClick={() => toast.info('Upload (preview only)')}
          />
        </div>
      )
    },
    usageCode: (si) => {
      const cats = ['mail', 'vouchers', 'chat']
      return `<SidebarSearchBar
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  categoryFilter="${cats[si]}"
  sectionMode="mail"
  onComposeChange={(composing) => setIsComposing(composing)}
  onUploadFileClick={() => openFileUpload()}
/>`
    },
  },

  {
    id: 'sidebar-pagination',
    name: 'Sidebar Pagination',
    category: 'Shared',
    badge: 'Pagination',
    description: 'Compact pagination controls showing "1–20 of 48" with prev/next buttons. Used in the mail sidebar.',
    filePath: 'src/features/Message/components/sidebar/sidebar-pagination.tsx',
    states: [
      { label: 'Page 1', description: 'First page, prev disabled' },
      { label: 'Page 2', description: 'Middle page, both enabled' },
      { label: 'Last Page', description: 'Next disabled' },
    ],
    renderPreview: (si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <SidebarPagination
          page={si + 1}
          limit={20}
          total={48}
          hasMore={si < 2}
          onPrevPage={() => toast.info('Prev page (preview only)')}
          onNextPage={() => toast.info('Next page (preview only)')}
        />
      </div>
    ),
    usageCode: (si) => `<SidebarPagination
  page={${si + 1}}
  limit={20}
  total={48}
  hasMore={${si < 2}}
  onPrevPage={() => setPage(p => p - 1)}
  onNextPage={() => setPage(p => p + 1)}
/>`,
  },

  {
    id: 'header-actions',
    name: 'Header Actions Dropdown',
    category: 'Shared',
    badge: 'Header Menu',
    description: 'Header action button group featuring "Act on this" button (Bell icon left of Flag), Quick Flag button, and a 3-dot "More" dropdown menu with exact items: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, and Delete >.',
    filePath: 'src/features/Message/components/chat/header-actions.tsx',
    states: [
      { label: 'Default Header Actions', description: 'Act on this + Quick Flag action + 3-Dot More options dropdown menu' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center justify-between p-3 border border-border rounded-xl bg-card w-full'>
          <span className='text-sm font-semibold text-muted-foreground mr-auto'>Header Actions →</span>
          <HeaderActions
            onDelete={() => toast.info('Delete clicked (preview only)')}
            onReply={() => toast.info('Reply clicked')}
            onForward={() => toast.info('Forward clicked')}
          />
        </div>
      </div>
    ),
    usageCode: (_si) => `<HeaderActions
  onActionThis={() => handleActionThis()}
  onReply={() => handleReply()}
  onForward={() => handleForward()}
  onPin={() => handlePin()}
  onStar={() => handleStar()}
  onFavorite={() => handleFavorite()}
  onArchive={() => handleArchive()}
  onDelete={() => handleDelete()}
/>`,
  },

  {
    id: 'email-header',
    name: 'Email View Header',
    category: 'Shared',
    badge: 'Email Header',
    description: 'Complete top bar for the Email View component. Displays sender avatar, "From: Name", email address, HeaderActions (with exact 9 dropdown options: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, Delete >), and close button without the Back button.',
    filePath: 'src/features/Message/components/emails/email-view.tsx',
    states: [
      { label: 'Default Header', description: 'Clean email header with sender info, exact 3-dot menu items, and close trigger' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center justify-between gap-3 border-b border-border pb-3 w-full'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-border shrink-0 bg-pink-200 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200'>
              JL
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-bold text-foreground truncate'>
                From: Jordan Lee
              </span>
              <span className='text-xs text-muted-foreground truncate'>
                jordan@demo.com
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
            <HeaderActions
              onDelete={() => toast.info('Delete email (preview only)')}
              onReply={() => toast.info('Reply email (preview only)')}
            />
            <button
              type='button'
              onClick={() => toast.info('Close email (preview only)')}
              className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              title='Close'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>
      </div>
    ),
    usageCode: (_si) => `<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
  <div className="flex items-center gap-3 min-w-0">
    <Avatar className="w-9 h-9">
      <AvatarFallback>JL</AvatarFallback>
    </Avatar>
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-bold truncate">From: Jordan Lee</span>
      <span className="text-xs text-muted-foreground truncate">jordan@demo.com</span>
    </div>
  </div>

  <div className="flex items-center gap-2 shrink-0">
    <HeaderActions onDelete={handleDelete} onReply={handleReply} />
    <Button variant="ghost" size="icon" onClick={handleClose}>
      <X className="h-5 w-5" />
    </Button>
  </div>
</div>`,
  },
  {
    id: 'chat-icon-bar',
    name: 'Chat Icon Bar',
    category: 'Shared',
    badge: 'Icon Bar',
    description: 'Floating action toolbar pill for chat & AI responses. Displays Audio icon (Volume2 on the left), ThumbsUp, ThumbsDown, Copy, Share, and 3-Dot More menu trigger.',
    filePath: 'src/features/Message/components/chat/chat-icon-bar.tsx',
    states: [
      { label: 'Default Toolbar Pill', description: 'Rounded floating pill with audio trigger & message actions' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center gap-1 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 shadow-md text-muted-foreground select-none backdrop-blur-xs'>
          <button
            type='button'
            onClick={() => toast.info('Playing audio...')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Listen Audio'
          >
            <Volume2 className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.success('Liked response')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Good response'
          >
            <ThumbsUp className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.info('Disliked response')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Bad response'
          >
            <ThumbsDown className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.success('Copied text to clipboard')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Copy text'
          >
            <Copy className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => toast.info('Share link copied')}
            className='p-1.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
            title='Share response'
          >
            <Share2 className='h-4 w-4' />
          </button>
          <ThreeDotMenu />
        </div>
      </div>
    ),
    usageCode: (_si) => `<div className="flex items-center gap-1 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-md">
  <button title="Audio"><Volume2 className="h-4 w-4" /></button>
  <button title="Like"><ThumbsUp className="h-4 w-4" /></button>
  <button title="Dislike"><ThumbsDown className="h-4 w-4" /></button>
  <button title="Copy"><Copy className="h-4 w-4" /></button>
  <button title="Share"><Share2 className="h-4 w-4" /></button>
  <ThreeDotMenu />
</div>`,
  },

  {
    id: 'three-dot-menu',
    name: '3-Dot Menu',
    category: 'Shared',
    badge: '3-Dot Menu',
    description: 'Standalone 3-Dot More options dropdown menu component. Displays ONLY the 3-Dot button trigger which opens the full 9 action options: Reply, Forward, Pin Message, Star, Favorite, Flag, Archive, Action This >, and Delete >.',
    filePath: 'src/features/Message/components/chat/three-dot-menu.tsx',
    states: [
      { label: 'Default Menu', description: 'Clickable standalone 3-Dot trigger opening full 9-item menu' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <div className='flex items-center gap-3 p-2.5 border border-border rounded-xl bg-background shadow-xs'>
          <span className='text-xs text-muted-foreground font-medium'>Click 3-Dot Menu →</span>
          <ThreeDotMenu />
        </div>
      </div>
    ),
    usageCode: (_si) => `<ThreeDotMenu
  onReply={handleReply}
  onForward={handleForward}
  onPin={handlePin}
  onStar={handleStar}
  onFavorite={handleFavorite}
  onArchive={handleArchive}
  onActionThis={handleActionThis}
  onDelete={handleDelete}
/>`,
  },

  {
    id: 'side-list-card',
    name: 'Side List Card',
    category: 'Shared',
    badge: 'Side Card',
    description: 'Purple/indigo tinted item card with left accent bar, clean top timestamp ("18 aug 26 14.41 / about 2 hours ago"), demo sender name ("Jordan Lee"), and on hover or tap displays the Chat Icon Bar at the bottom with 3-dot menu.',
    filePath: 'src/features/Message/components/sidebar/side-list-card.tsx',
    states: [
      { label: 'Default Card', description: 'Clean card with top timestamp & hover/tap Chat Icon Bar on bottom' },
      { label: 'Selected State', description: 'Active selected state with prominent left border' },
    ],
    renderPreview: (si) => <SideListCardPreview stateIndex={si} />,
    usageCode: (si) => `<div className="group relative flex flex-col gap-1.5 rounded-xl p-4 bg-purple-500/10 border border-purple-200/60">
  <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-600 rounded-l-xl" />

  {/* Clean Top Timestamp */}
  <div className="flex items-start justify-between">
    <span className="font-bold text-sm">Jordan Lee</span>
    <div className="text-right text-xs text-muted-foreground">
      <div>18 aug 26 14.41</div>
      <div>about 2 hours ago</div>
    </div>
  </div>

  <p className="text-xs text-muted-foreground">test to check auto sync aug 18 2.40</p>

  {/* Hover Chat Icon Bar at Bottom */}
  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <ChatIconBar />
  </div>
</div>`,
  },

  {
    id: 'attachment-card-uploader',
    name: 'Attachment Card & Uploader',
    category: 'Shared',
    badge: 'Attachment',
    description: 'File attachment card displaying title ("Attachments (1)"), file item with badge, name ("Q3-Update.pdf"), size ("2.4 MB"), download & view buttons, and an interactive "Attach Files" trigger with live upload progress bar animation.',
    filePath: 'src/features/Message/components/shared/attachment-card-uploader.tsx',
    states: [
      { label: 'Default View', description: 'Attachment list with Q3-Update.pdf card & Attach Files button' },
    ],
    renderPreview: (_si) => (
      <div className='w-full flex flex-col items-start justify-start'>
        <AttachmentCardUploader />
      </div>
    ),
    usageCode: (_si) => `<AttachmentCardUploader
  initialAttachments={[
    {
      id: 'att-1',
      name: 'Q3-Update.pdf',
      size: '2.4 MB',
      type: 'PDF',
    },
  ]}
/>`,
  },

  {
    id: 'progress-linear',
    name: 'Progress - Linear Bar & Status Colors',
    category: 'Shared',
    badge: 'Progress Bar',
    description: 'Animated linear progress bar with value display, status color variants (success emerald, processing indigo, warning amber), and interactive controls.',
    filePath: 'src/components/ui/progress.tsx',
    states: [
      { label: '45% Progress', description: 'Standard linear progress bar at 45%' },
      { label: '75% Progress', description: 'Progress bar at 75% completed state' },
      { label: 'Animated Simulation', description: 'Live progress simulation loop' },
    ],
    renderPreview: (si) => <ProgressLinearPreview stateIndex={si} />,
    usageCode: (si) => `import { Progress } from "@/components/ui/progress"

export function ProgressDemo() {
  return <Progress value={45} className="w-full" />
}`,
  },

  {
    id: 'progress-step-indicator',
    name: 'Progress - Segmented Step Indicator',
    category: 'Shared',
    badge: 'Step Indicator',
    description: 'Multi-stage step progress tracker showing active, completed, and pending workflow steps with connecting line indicator.',
    filePath: 'src/features/MessageComponentGallery/previews/ProgressPreviews.tsx',
    states: [
      { label: 'Step 2 Active', description: 'Step 2 currently active with Step 1 completed' },
      { label: 'Step 3 Active', description: 'Step 3 currently active with Steps 1 & 2 completed' },
      { label: 'All Completed', description: 'All steps completed' },
    ],
    renderPreview: (si) => <ProgressStepIndicatorPreview stateIndex={si} />,
    usageCode: (si) => `// Segmented Step Indicator Flow
import { ProgressStepIndicatorPreview } from '@/features/MessageComponentGallery/previews/ProgressPreviews'

export default function StepperDemo() {
  return <ProgressStepIndicatorPreview stateIndex={${si}} />
}`,
  },

  {
    id: 'progress-circular',
    name: 'Progress - Circular Radial Ring',
    category: 'Shared',
    badge: 'Radial Ring',
    description: 'Radial circular progress ring with center percentage readout and sync status message.',
    filePath: 'src/features/MessageComponentGallery/previews/ProgressPreviews.tsx',
    states: [
      { label: '68% Syncing', description: 'Radial ring at 68% in progress' },
      { label: '100% Synced', description: 'Completed ring at 100% with success check' },
      { label: '25% Low Progress', description: 'Warning state ring at 25%' },
    ],
    renderPreview: (si) => <ProgressCircularPreview stateIndex={si} />,
    usageCode: (si) => `// Radial Circular Progress Ring
import { ProgressCircularPreview } from '@/features/MessageComponentGallery/previews/ProgressPreviews'

export default function RadialDemo() {
  return <ProgressCircularPreview stateIndex={${si}} />
}`,
  },

  // ───────────────────────── WIZARDS SECTION ─────────────────────────────────
  {
    id: 'questionnaire-wizard',
    name: 'Questionnaire & Onboarding Wizard',
    category: 'Wizards',
    badge: 'Wizard Flow',
    description: 'Multi-step questionnaire flow matching shadcn Questionnaire specs. Features personal details, calendar session date & time picker, feature choices, progress bar, and summary view.',
    filePath: 'src/features/MessageComponentGallery/previews/QuestionnaireAndWizardPreviews.tsx',
    states: [
      { label: 'Step 1: Personal Details', description: 'Initial step with full name input and role selection cards' },
      { label: 'Step 2: Schedule & Date Picker', description: 'Session scheduling step with date picker popover and time slots' },
      { label: 'Summary & Completed', description: 'Completed questionnaire state with full recorded summary' },
    ],
    renderPreview: (si) => <QuestionnaireWizardPreview stateIndex={si} />,
    usageCode: (si) => `// Questionnaire Multi-Step Wizard
import { QuestionnaireWizardPreview } from '@/features/MessageComponentGallery/previews/QuestionnaireAndWizardPreviews'

export default function QuestionnairePage() {
  return <QuestionnaireWizardPreview stateIndex={${si}} />
}`,
  },

  // ───────────────────────── DATE PICKER SECTION ─────────────────────────────
  {
    id: 'date-picker-simple',
    name: 'Date Picker - Simple',
    category: 'Date Picker',
    badge: 'Simple Picker',
    description: 'Standard popover date picker with calendar trigger button, formatted date string ("August 19, 2026"), and clear date action.',
    filePath: 'src/components/ui/date-picker.tsx',
    states: [
      { label: 'Default State', description: 'Trigger button with "Pick a date" placeholder' },
      { label: 'Selected Date', description: 'Trigger displaying formatted date ("August 19, 2026")' },
    ],
    renderPreview: (si) => <DatePickerSimplePreview stateIndex={si} />,
    usageCode: (si) => `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
      <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
      {date ? format(date, "PPP") : <span>Pick a date</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>`,
  },

  {
    id: 'date-picker-range',
    name: 'Date Picker - Range',
    category: 'Date Picker',
    badge: 'Date Range',
    description: 'Date range selection trigger button allowing start and end date pick with dual month view on desktop and single month view on mobile screens.',
    filePath: 'src/components/ui/date-picker.tsx',
    states: [
      { label: 'Default Range', description: 'Pre-selected 7-day range' },
      { label: 'Custom Range', description: 'Aug 10, 2026 - Aug 24, 2026 range' },
    ],
    renderPreview: (si) => <DatePickerRangePreview stateIndex={si} />,
    usageCode: (si) => `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
      <CalendarDays className="mr-2 h-4 w-4 text-teal-600" />
      {dateRange?.from ? (
        dateRange.to ? (
          <>{format(dateRange.from, "LLL dd, yyyy")} - {format(dateRange.to, "LLL dd, yyyy")}</>
        ) : format(dateRange.from, "LLL dd, yyyy")
      ) : <span>Pick a date range</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
  </PopoverContent>
</Popover>`,
  },

  {
    id: 'date-picker-presets',
    name: 'Date Picker - Quick Presets',
    category: 'Date Picker',
    badge: 'Presets',
    description: 'Date picker popover featuring sidebar shortcuts ("Today", "Tomorrow", "In 3 days", "In 1 week", "In 1 month") for quick date selection.',
    filePath: 'src/components/ui/date-picker.tsx',
    states: [
      { label: 'With Presets', description: 'Date picker popover with quick selection shortcuts' },
    ],
    renderPreview: () => <DatePickerPresetsPreview />,
    usageCode: () => `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
      <Clock className="mr-2 h-4 w-4 text-teal-600" />
      {date ? format(date, "PPP") : <span>Pick a date</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="flex w-auto p-0" align="start">
    <div className="flex flex-col border-r border-border p-2 gap-1 bg-muted/20">
      <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Today</Button>
      <Button variant="ghost" size="sm" onClick={() => setDate(addDays(new Date(), 1))}>Tomorrow</Button>
      <Button variant="ghost" size="sm" onClick={() => setDate(addDays(new Date(), 7))}>In 1 week</Button>
    </div>
    <Calendar mode="single" selected={date} onSelect={setDate} className="p-3" />
  </PopoverContent>
</Popover>`,
  },

  {
    id: 'date-picker-form',
    name: 'Date Picker - Form Field',
    category: 'Date Picker',
    badge: 'Form Picker',
    description: 'Date picker input integrated into a form structure with label, description, error validation state, and submit action.',
    filePath: 'src/components/ui/date-picker.tsx',
    states: [
      { label: 'Default State', description: 'Clean form input field' },
      { label: 'Validation Error', description: 'Field showing required error validation message' },
    ],
    renderPreview: (si) => <DatePickerFormPreview stateIndex={si} />,
    usageCode: (si) => `<div className="space-y-1.5">
  <Label>Date of Birth *</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
        {date ? format(date, "PPP") : <span>Pick your date of birth</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" fromYear={1960} toYear={2026} />
    </PopoverContent>
  </Popover>
  <p className="text-[11px] text-muted-foreground">Your date of birth is used to verify account eligibility.</p>
</div>`,
  },

  // ───────────────────────── CALENDAR SECTION ────────────────────────────────
  {
    id: 'calendar-single',
    name: 'Calendar - Single Selection',
    category: 'Calendar',
    badge: 'Single Day',
    description: 'Standalone interactive calendar grid with month navigation controls, today highlight, single date selection, and selected date info card.',
    filePath: 'src/components/ui/calendar.tsx',
    states: [
      { label: 'Single Selection', description: 'Interactive calendar grid with date highlight' },
    ],
    renderPreview: (si) => <CalendarSinglePreview stateIndex={si} />,
    usageCode: () => `<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border border-border bg-background p-3"
/>`,
  },

  {
    id: 'calendar-range',
    name: 'Calendar - Range Selection',
    category: 'Calendar',
    badge: 'Range Span',
    description: 'Multi-day range selection calendar grid with highlighted start date, end date, and intermediate range span.',
    filePath: 'src/components/ui/calendar.tsx',
    states: [
      { label: 'Range Selection', description: 'Calendar grid with multi-day range highlight' },
    ],
    renderPreview: (si) => <CalendarRangePreview stateIndex={si} />,
    usageCode: () => `<Calendar
  mode="range"
  selected={range}
  onSelect={setRange}
  className="rounded-md border border-border bg-background p-3"
/>`,
  },

  {
    id: 'calendar-events',
    name: 'Calendar - Event & Schedule View',
    category: 'Calendar',
    badge: 'Agenda View',
    description: 'Responsive event calendar view featuring dated indicators, agenda list panel, team tags, and Google Calendar sync status.',
    filePath: 'src/components/ui/calendar.tsx',
    states: [
      { label: 'Event Schedule', description: 'Interactive calendar with agenda schedule list' },
    ],
    renderPreview: () => <CalendarEventsPreview />,
    usageCode: () => `<div className="flex flex-col lg:flex-row w-full max-w-2xl border rounded-2xl overflow-hidden">
  <div className="p-4 border-r bg-background">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </div>
  <div className="flex-1 p-5 flex flex-col justify-between">
    <h4>{format(date, 'EEEE, MMMM d')}</h4>
    {/* Agenda Events */}
  </div>
</div>`,
  },

  // ───────────────────────── RICH EDITOR SECTION ────────────────────────────
  {
    id: 'minimal-tiptap-editor',
    name: 'Minimal Tiptap Editor',
    category: 'Rich Editor',
    badge: 'Editor',
    description: 'Feature-rich WYSIWYG rich text editor with toolbar for formatting, headings, lists, code blocks, and full post reader preview.',
    filePath: 'src/components/ui/minimal-tiptap/minimal-tiptap.tsx',
    states: [
      { label: 'Rich Text Editor', description: 'Interactive Minimal Tiptap WYSIWYG editor' },
    ],
    renderPreview: () => <RichEditorPreview />,
    usageCode: () => `import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap'\n\nexport default function EditorPage() {\n  const [value, setValue] = useState('')\n  return <MinimalTiptapEditor value={value} onChange={setValue} />\n}`,
  },

  // ───────────────────────── THEME SECTION ──────────────────────────────────
  {
    id: 'lucide-icons-gallery',
    name: 'Lucide Icons Gallery',
    category: 'Theme',
    badge: 'Icons',
    description: 'Complete interactive catalog of all Lucide icons used across the app with search, category filters, size adjustments, and click-to-copy JSX imports.',
    filePath: 'src/features/MessageComponentGallery/previews/LucideIconsPreview.tsx',
    states: [
      { label: 'Lucide Icons Set', description: 'Official icon set from lucide.dev' },
    ],
    renderPreview: (stateIndex) => <LucideIconsPreview stateIndex={stateIndex} />,
    usageCode: () => `import { Search, Plus, Trash2, Mail } from 'lucide-react'\n\nexport default function IconsDemo() {\n  return <Search className="h-4 w-4 text-primary" />\n}`,
  },
  {
    id: 'app-themes-settings',
    name: 'App Theme & Colors',
    category: 'Theme',
    badge: 'Theme',
    description: 'Theme customizer from email settings featuring Catppuccin, Tokyo Night, Dracula, Nord, Gruvbox, Supabase, and dynamic CSS primary tokens.',
    filePath: 'src/features/email-settings/components/themes-tab.tsx',
    states: [
      { label: 'Accent Themes', description: 'Interactive color theme selector' },
    ],
    renderPreview: (stateIndex) => <AppThemesPreview stateIndex={stateIndex} />,
    usageCode: () => `import { ThemesTab } from '@/features/email-settings/components/themes-tab'\n\nexport default function ThemePage() {\n  return <ThemesTab />\n}`,
  },
]

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'All',
  'Wizards',
  'Vouchers',
  'Kanban Board',
  'Data Cards',
  'Analytics',
  'Stats',
  'Charts',
  'Maps',
  'Task',
  'Mail',
  'Notifications',
  'Files',
  'Chat',
  'AI',
  'Shared',
  'Date Picker',
  'Calendar',
  'Rich Editor',
  'Theme',
]
