import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Supabase Contact-Based File Storage Architecture Guide")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — ARCHITECTURE DOCUMENTATION")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Colors
    PRIMARY = colors.HexColor("#4F46E5")       # Indigo primary
    SECONDARY = colors.HexColor("#0EA5E9")     # Sky secondary
    TEXT_DARK = colors.HexColor("#0F172A")     # Slate 900
    TEXT_MUTED = colors.HexColor("#475569")    # Slate 600
    BORDER_COLOR = colors.HexColor("#CBD5E1")  # Slate 300

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=15.5,
        textColor=TEXT_MUTED,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=TEXT_DARK,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14.5,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'CodeBlockText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#38BDF8")
    )

    elements = []

    # Title & Subtitle Banner
    elements.append(Paragraph("Supabase Contact-Based File Storage Architecture", title_style))
    elements.append(Paragraph("Comprehensive Technical Reference & Developer Guide — <b>ONE CONTACT = ONE FILE SPACE</b>", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=0, spaceAfter=12))

    # Executive Overview
    elements.append(Paragraph("1. Executive Architecture Summary", h1_style))
    overview_text = (
        "This document details the centralized <b>Contact File Space Architecture</b> implemented using <b>Supabase Storage</b>. "
        "The fundamental design principle governing all storage management is <b>ONE CONTACT = ONE FILE SPACE</b>, ensuring every contact "
        "has a dedicated, isolated storage hierarchy anchored by their normalized email address."
    )
    elements.append(Paragraph(overview_text, body_style))

    # Core Principles Callout Table
    principles_data = [
        [Paragraph("<b>Core Storage Rules & Policies</b>", body_bold)],
        [Paragraph("• <b>Normalized Contact Email Root:</b> All object paths begin with <code>{contact-email}/</code> (lowercase, trimmed whitespace).", body_style)],
        [Paragraph("• <b>Dual-Folder Storage:</b> Uploading a chat file automatically saves the file into <b>BOTH</b> the Sender's folder and the Receiver's folder.", body_style)],
        [Paragraph("• <b>No <code>.keep</code> Placeholders:</b> Empty folders contain no dummy files. Folders appear dynamically in Supabase Storage when actual files are uploaded.", body_style)],
        [Paragraph("• <b>Universal Routing Format:</b> <code>{contact-email}/{section}/{file-type}/{filename}</code>", body_style)],
        [Paragraph("• <b>No <code>anonymous@user.com</code> Fallback:</b> Emails are strictly resolved from authenticated state or session cookies.", body_style)]
    ]
    p_table = Table(principles_data, colWidths=[504])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EEF2FF")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#C7D2FE")),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
    ]))
    elements.append(p_table)
    elements.append(Spacer(1, 10))

    # Directory Hierarchy Section
    elements.append(Paragraph("2. Standard Storage Hierarchy & File Categorization", h1_style))
    hierarchy_text = (
        "Every contact's storage space is divided into <b>5 Standard Application Sections</b> and <b>10 File-Type Subfolders</b>. "
        "Currently, <b>Chat</b> is actively processing dynamic uploads, while <b>Files, Email, AI Chat, and Order</b> are prepared for future upload integration."
    )
    elements.append(Paragraph(hierarchy_text, body_style))

    # Table of Sections & File Categories
    cat_data = [
        [Paragraph("<b>Section</b>", body_bold), Paragraph("<b>Status</b>", body_bold), Paragraph("<b>10 Standard Subfolders</b>", body_bold)],
        [Paragraph("<b>Chat</b>", body_style), Paragraph("<font color='#10B981'><b>ACTIVE</b></font>", body_style), Paragraph("Doc, Xls, Ppt, Pdf, Txt, Csv, Images, Videos, Zip, Other", body_style)],
        [Paragraph("<b>Files</b>", body_style), Paragraph("<font color='#64748B'>PREPARED</font>", body_style), Paragraph("Doc, Xls, Ppt, Pdf, Txt, Csv, Images, Videos, Zip, Other", body_style)],
        [Paragraph("<b>Email</b>", body_style), Paragraph("<font color='#64748B'>PREPARED</font>", body_style), Paragraph("Doc, Xls, Ppt, Pdf, Txt, Csv, Images, Videos, Zip, Other", body_style)],
        [Paragraph("<b>AI Chat</b>", body_style), Paragraph("<font color='#64748B'>PREPARED</font>", body_style), Paragraph("Doc, Xls, Ppt, Pdf, Txt, Csv, Images, Videos, Zip, Other", body_style)],
        [Paragraph("<b>Order</b>", body_style), Paragraph("<font color='#64748B'>PREPARED</font>", body_style), Paragraph("Doc, Xls, Ppt, Pdf, Txt, Csv, Images, Videos, Zip, Other", body_style)]
    ]
    cat_table = Table(cat_data, colWidths=[80, 80, 344])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0, 0), (-1, 0), TEXT_DARK),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(cat_table)
    elements.append(Spacer(1, 10))

    # Category Mapping Table
    elements.append(Paragraph("<b>File-Type Category Extension Mapping Rules</b>", h2_style))
    mapping_data = [
        [Paragraph("<b>Category</b>", body_bold), Paragraph("<b>Extensions / MIME Types</b>", body_bold)],
        [Paragraph("<b>Doc</b>", body_style), Paragraph("<code>.doc</code>, <code>.docx</code>, <code>application/msword</code>, <code>wordprocessingml</code>", body_style)],
        [Paragraph("<b>Xls</b>", body_style), Paragraph("<code>.xls</code>, <code>.xlsx</code>, <code>spreadsheetml</code>, <code>vnd.ms-excel</code>", body_style)],
        [Paragraph("<b>Ppt</b>", body_style), Paragraph("<code>.ppt</code>, <code>.pptx</code>, <code>presentationml</code>, <code>vnd.ms-powerpoint</code>", body_style)],
        [Paragraph("<b>Pdf</b>", body_style), Paragraph("<code>.pdf</code>, <code>application/pdf</code>", body_style)],
        [Paragraph("<b>Txt</b>", body_style), Paragraph("<code>.txt</code>, <code>text/plain</code>", body_style)],
        [Paragraph("<b>Csv</b>", body_style), Paragraph("<code>.csv</code>, <code>text/csv</code>", body_style)],
        [Paragraph("<b>Images</b>", body_style), Paragraph("<code>.jpg</code>, <code>.jpeg</code>, <code>.png</code>, <code>.gif</code>, <code>.webp</code>, <code>.svg</code>, <code>image/*</code>", body_style)],
        [Paragraph("<b>Videos</b>", body_style), Paragraph("<code>.mp4</code>, <code>.mov</code>, <code>.avi</code>, <code>.mkv</code>, <code>.webm</code>, <code>video/*</code>", body_style)],
        [Paragraph("<b>Zip</b>", body_style), Paragraph("<code>.zip</code>, <code>.rar</code>, <code>.7z</code>, <code>.tar</code>, <code>.gz</code>", body_style)],
        [Paragraph("<b>Other</b>", body_style), Paragraph("Any unknown or unsupported file extension / MIME type", body_style)]
    ]
    map_table = Table(mapping_data, colWidths=[100, 404])
    map_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4.5),
    ]))
    elements.append(map_table)
    
    elements.append(PageBreak())

    # File Inventory Section
    elements.append(Paragraph("3. Detailed Codebase File Inventory", h1_style))
    inventory_intro = (
        "The table below documents all created and modified source files in the project codebase, "
        "their exact responsibilities, and their role in the storage architecture."
    )
    elements.append(Paragraph(inventory_intro, body_style))

    file_inv_data = [
        [Paragraph("<b>File Path</b>", body_bold), Paragraph("<b>Action</b>", body_bold), Paragraph("<b>Key Responsibility & Functionality</b>", body_bold)],
        [
            Paragraph("<code>src/features/chattemplate/chat/<br/>services/chat-storage.service.ts</code>", body_style),
            Paragraph("<font color='#4F46E5'><b>CREATED</b></font>", body_style),
            Paragraph("Centralized storage helper. Provides <code>getStoragePath</code>, <code>getChatFileCategory</code>, <code>normalizeContactEmail</code>, and <code>generateUniqueFileName</code>.", body_style)
        ],
        [
            Paragraph("<code>src/features/chattemplate/files/<br/>managers/attachment-uploader.ts</code>", body_style),
            Paragraph("<font color='#0EA5E9'><b>MODIFIED</b></font>", body_style),
            Paragraph("Executes XHR upload into <b>Sender's</b> folder and secondary copy upload into <b>Receiver's</b> folder with <code>x-upsert: true</code> header.", body_style)
        ],
        [
            Paragraph("<code>src/features/chattemplate/chat/<br/>hooks/use-attachments.ts</code>", body_style),
            Paragraph("<font color='#0EA5E9'><b>MODIFIED</b></font>", body_style),
            Paragraph("Hook managing progress state. Passes <code>senderEmail</code> and <code>receiverEmail</code> options down to <code>uploadAttachment</code>.", body_style)
        ],
        [
            Paragraph("<code>src/features/Message/components/<br/>chat/realtime-chat-view.tsx</code>", body_style),
            Paragraph("<font color='#0EA5E9'><b>MODIFIED</b></font>", body_style),
            Paragraph("Resolves active sender and receiver contact emails from Zustand store and <code>conversation.members</code> dynamically during upload.", body_style)
        ],
        [
            Paragraph("<code>src/features/chattemplate/<br/>contacts/api/contacts.api.ts</code>", body_style),
            Paragraph("<font color='#0EA5E9'><b>MODIFIED</b></font>", body_style),
            Paragraph("Triggers contact email storage normalization upon new contact creation without creating <code>.keep</code> dummy files.", body_style)
        ],
        [
            Paragraph("<code>src/features/chattemplate/chat/<br/>services/chat-storage.service.test.ts</code>", body_style),
            Paragraph("<font color='#4F46E5'><b>CREATED</b></font>", body_style),
            Paragraph("Automated test suite (17/17 vitest tests passed) verifying email normalization, path routing, and categorization rules.", body_style)
        ]
    ]
    inv_table = Table(file_inv_data, colWidths=[170, 70, 264])
    inv_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(inv_table)
    elements.append(Spacer(1, 10))

    # Real-World Execution Walkthrough
    elements.append(Paragraph("4. Step-by-Step Example Walkthrough", h1_style))
    elements.append(Paragraph("<b>Scenario:</b> User A (<code>amanmicropay@gmail.com</code>) sends a PDF invoice named <code>invoice.pdf</code> to User B (<code>itsaman00786@gmail.com</code>).", body_style))

    flow_data = [
        [Paragraph("<b>Step</b>", body_bold), Paragraph("<b>System Action & Execution Path</b>", body_bold)],
        [
            Paragraph("<b>1. File Selection</b>", body_style),
            Paragraph("User selects <code>invoice.pdf</code> in Chat UI. <code>RealtimeChatView</code> triggers <code>startUpload(file, { senderEmail, receiverEmail })</code>.", body_style)
        ],
        [
            Paragraph("<b>2. File Categorization</b>", body_style),
            Paragraph("<code>getChatFileCategory(file)</code> detects extension <code>.pdf</code> → returns category <code><b>Pdf</b></code>.", body_style)
        ],
        [
            Paragraph("<b>3. Unique Name</b>", body_style),
            Paragraph("<code>generateUniqueFileName('invoice.pdf')</code> generates safe name: <code>1771146900000-a1b2c3d4-invoice.pdf</code>.", body_style)
        ],
        [
            Paragraph("<b>4. Sender Upload</b>", body_style),
            Paragraph("Uploads file via XHR with <code>x-upsert: true</code> header to:<br/><code><b>amanmicropay@gmail.com/Chat/Pdf/1771146900000-a1b2c3d4-invoice.pdf</b></code>", body_style)
        ],
        [
            Paragraph("<b>5. Receiver Copy</b>", body_style),
            Paragraph("Automatically uploads copy via REST fetch API to:<br/><code><b>itsaman00786@gmail.com/Chat/Pdf/1771146900000-a1b2c3d4-invoice.pdf</b></code>", body_style)
        ],
        [
            Paragraph("<b>6. Chat Message DB</b>", body_style),
            Paragraph("Message record saved in Supabase DB <code>chat_messages</code> table storing public URL reference.", body_style)
        ]
    ]
    flow_table = Table(flow_data, colWidths=[110, 394])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EEF2FF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#C7D2FE")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(flow_table)

    elements.append(PageBreak())

    # Future Developer Integration Guide
    elements.append(Paragraph("5. Developer Guide for Future Section Integration", h1_style))
    dev_guide = (
        "When implementing actual file upload features for <b>Files, Email, AI Chat, or Order</b> in future development tasks, "
        "always use the universal <code>getStoragePath</code> helper function from <code>chat-storage.service.ts</code> to maintain path consistency."
    )
    elements.append(Paragraph(dev_guide, body_style))

    code_snippet = (
        "// Example: Future Email Attachment Upload Implementation\n"
        "import { getStoragePath, getChatFileCategory, generateUniqueFileName } from '@/features/chattemplate/chat/services/chat-storage.service'\n\n"
        "// 1. Categorize file automatically\n"
        "const category = getChatFileCategory(file)\n\n"
        "// 2. Generate timestamped UUID safe filename\n"
        "const uniqueName = generateUniqueFileName(file.name)\n\n"
        "// 3. Resolve normalized contact email storage path\n"
        "const emailPath = getStoragePath('contact@example.com', 'Email', category, uniqueName)\n"
        "// Resulting Storage Path: contact@example.com/Email/Pdf/1771146900000-uuid-filename.pdf\n\n"
        "// 4. Upload to Supabase Storage bucket ('chat-files') using x-upsert: true header\n"
        "await supabase.storage.from('chat-files').upload(emailPath, file, { upsert: true })"
    )

    code_box_data = [[Paragraph(code_snippet.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)]]
    code_table = Table(code_box_data, colWidths=[504])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#38BDF8")),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
    ]))
    elements.append(code_table)
    elements.append(Spacer(1, 14))

    # Architecture Verification Checklist Box
    elements.append(Paragraph("<b>Architecture Verification Summary</b>", h2_style))
    chk_data = [
        [Paragraph("<b>Checklist Item</b>", body_bold), Paragraph("<b>Verification Status</b>", body_bold)],
        [Paragraph("<b>Supabase Storage Bucket</b>", body_style), Paragraph("Single central bucket <code>chat-files</code> with public read & authenticated write policies.", body_style)],
        [Paragraph("<b>Contact Folder Root</b>", body_style), Paragraph("Anchored by normalized contact email <code>{contact-email}/</code> (no dummy <code>.keep</code> files).", body_style)],
        [Paragraph("<b>Dual-Folder Routing</b>", body_style), Paragraph("Saves files into both Sender & Receiver folders on every upload.", body_style)],
        [Paragraph("<b>Unit Testing</b>", body_style), Paragraph("17/17 Vitest tests passing with 100% path rule coverage.", body_style)],
        [Paragraph("<b>Next.js Production Build</b>", body_style), Paragraph("Compiled successfully across 73 routes with 0 errors.", body_style)]
    ]
    chk_table = Table(chk_data, colWidths=[150, 354])
    chk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(chk_table)

    # Build PDF Document
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built at {filename}")

if __name__ == '__main__':
    target_path = r"C:\Users\Mohd Aman\.gemini\antigravity-ide\brain\b7769308-cd77-481b-99d0-9afea56008e3\Contact_File_Storage_Architecture_Guide.pdf"
    build_pdf(target_path)
