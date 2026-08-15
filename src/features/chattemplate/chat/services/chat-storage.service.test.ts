import { describe, it, expect } from 'vitest'
import {
  getChatFileCategory,
  generateUniqueFileName,
  generateChatFilePath,
  getStoragePath,
  normalizeContactEmail,
  APP_STORAGE_SECTIONS,
  CHAT_FILE_CATEGORIES,
} from './chat-storage.service'

describe('chat-storage.service (Contact-Based File Space)', () => {
  describe('APP_STORAGE_SECTIONS', () => {
    it('contains all 5 standard application sections', () => {
      expect(APP_STORAGE_SECTIONS).toEqual([
        'Files',
        'Chat',
        'Email',
        'AI Chat',
        'Order',
      ])
    })
  })

  describe('CHAT_FILE_CATEGORIES', () => {
    it('contains all 10 required file-type categories including "Other"', () => {
      expect(CHAT_FILE_CATEGORIES).toEqual([
        'Doc',
        'Xls',
        'Ppt',
        'Pdf',
        'Txt',
        'Csv',
        'Images',
        'Videos',
        'Zip',
        'Other',
      ])
    })
  })

  describe('normalizeContactEmail', () => {
    it('trims whitespace and converts email to lowercase', () => {
      expect(normalizeContactEmail(' John@Company.COM ')).toBe('john@company.com')
      expect(normalizeContactEmail('USER@DOMAIN.ORG')).toBe('user@domain.org')
      expect(normalizeContactEmail('')).toBeNull()
      expect(normalizeContactEmail('anonymous@user.com')).toBeNull()
    })
  })

  describe('getStoragePath', () => {
    it('constructs universal object path as {contact-email}/{section}/{file-type}/{filename}', () => {
      expect(
        getStoragePath('john@company.com', 'Chat', 'Images', 'product-photo.jpg')
      ).toBe('john@company.com/Chat/Images/product-photo.jpg')

      expect(
        getStoragePath('john@company.com', 'Email', 'Pdf', 'invoice.pdf')
      ).toBe('john@company.com/Email/Pdf/invoice.pdf')

      expect(
        getStoragePath('john@company.com', 'AI Chat', 'Xls', 'analysis.xlsx')
      ).toBe('john@company.com/AI Chat/Xls/analysis.xlsx')

      expect(
        getStoragePath('john@company.com', 'Order', 'Pdf', 'purchase-order.pdf')
      ).toBe('john@company.com/Order/Pdf/purchase-order.pdf')

      expect(
        getStoragePath('john@company.com', 'Files', 'Doc', 'agreement.docx')
      ).toBe('john@company.com/Files/Doc/agreement.docx')
    })
  })

  describe('getChatFileCategory', () => {
    it('categorizes Doc files correctly', () => {
      expect(getChatFileCategory({ name: 'contract.doc', type: 'application/msword' })).toBe('Doc')
      expect(
        getChatFileCategory({
          name: 'resume.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      ).toBe('Doc')
    })

    it('categorizes Xls files correctly', () => {
      expect(getChatFileCategory({ name: 'budget.xls', type: 'application/vnd.ms-excel' })).toBe('Xls')
      expect(
        getChatFileCategory({
          name: 'sheet.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      ).toBe('Xls')
    })

    it('categorizes Ppt files correctly', () => {
      expect(getChatFileCategory({ name: 'slides.ppt', type: 'application/vnd.ms-powerpoint' })).toBe('Ppt')
      expect(
        getChatFileCategory({
          name: 'deck.pptx',
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        })
      ).toBe('Ppt')
    })

    it('categorizes Pdf files correctly', () => {
      expect(getChatFileCategory({ name: 'invoice.pdf', type: 'application/pdf' })).toBe('Pdf')
    })

    it('categorizes Txt files correctly', () => {
      expect(getChatFileCategory({ name: 'notes.txt', type: 'text/plain' })).toBe('Txt')
    })

    it('categorizes Csv files correctly', () => {
      expect(getChatFileCategory({ name: 'data.csv', type: 'text/csv' })).toBe('Csv')
    })

    it('categorizes Image files correctly', () => {
      expect(getChatFileCategory({ name: 'photo.jpg', type: 'image/jpeg' })).toBe('Images')
      expect(getChatFileCategory({ name: 'logo.png', type: 'image/png' })).toBe('Images')
      expect(getChatFileCategory({ name: 'graphic.webp', type: 'image/webp' })).toBe('Images')
    })

    it('categorizes Video files correctly', () => {
      expect(getChatFileCategory({ name: 'clip.mp4', type: 'video/mp4' })).toBe('Videos')
      expect(getChatFileCategory({ name: 'movie.mkv', type: 'video/x-matroska' })).toBe('Videos')
    })

    it('categorizes Zip files correctly', () => {
      expect(getChatFileCategory({ name: 'archive.zip', type: 'application/zip' })).toBe('Zip')
      expect(getChatFileCategory({ name: 'backup.7z', type: 'application/x-7z-compressed' })).toBe('Zip')
    })

    it('categorizes unknown / unsupported files as "Other"', () => {
      expect(getChatFileCategory({ name: 'binary.dat', type: 'application/octet-stream' })).toBe('Other')
      expect(getChatFileCategory({ name: 'file_no_extension', type: '' })).toBe('Other')
    })
  })

  describe('generateUniqueFileName', () => {
    it('creates a unique filename while preserving extension', () => {
      const name = generateUniqueFileName('report.pdf')
      expect(name).toMatch(/\d+-.+-report\.pdf$/)
    })

    it('sanitizes unsafe characters in original filename', () => {
      const name = generateUniqueFileName('my bad file#name!.png')
      expect(name).toMatch(/\d+-.+-my_bad_file_name_\.png$/)
      expect(name).not.toContain(' ')
      expect(name).not.toContain('#')
      expect(name).not.toContain('!')
    })
  })

  describe('generateChatFilePath', () => {
    it('constructs path formatted as {contact-email}/Chat/{file-type}/{unique-file-name}', () => {
      const path = generateChatFilePath(' John@Company.COM ', {
        name: 'invoice.pdf',
        type: 'application/pdf',
      })
      expect(path).toMatch(/^john@company\.com\/Chat\/Pdf\/\d+-.+-invoice\.pdf$/)
    })
  })
})
