import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedVoucher {
  id: string
  voucherNo: string
  date: string
  from: string
  userName: string
  status: 'Active' | 'Redeemed' | 'Expired'
  fileName: string
  pdfUrl?: string
  editedJson?: any
  createdAt: string
  // DB-specific fields
  originalFileUrl?: string
  editedFileUrl?: string
  dbId?: string
  _selectedAt?: number
}

interface VoucherStoreState {
  // Local vouchers (from DB fetch or local persist fallback)
  vouchers: SavedVoucher[]
  selectedVoucher: SavedVoucher | null
  dbLoaded: boolean

  setSelectedVoucher: (voucher: SavedVoucher | null) => void
  setVouchers: (vouchers: SavedVoucher[]) => void
  addVoucher: (voucher: Omit<SavedVoucher, 'id' | 'createdAt'>) => SavedVoucher
  updateVoucher: (id: string, updates: Partial<SavedVoucher>) => void
  deleteVoucher: (id: string) => void
  setDbLoaded: (v: boolean) => void
}

export const useVoucherStore = create<VoucherStoreState>()(
  persist(
    (set) => ({
      vouchers: [],
      selectedVoucher: null,
      dbLoaded: false,
      setSelectedVoucher: (voucher) => set({ selectedVoucher: voucher }),
      setDbLoaded: (v) => set({ dbLoaded: v }),

      setVouchers: (vouchers) =>
        set((state) => {
          const map = new Map<string, SavedVoucher>()
          const getFileKey = (v: SavedVoucher) => {
            const name = (v.fileName || '').toLowerCase().trim()
            const url = (v.originalFileUrl || v.editedFileUrl || v.pdfUrl || '').trim()
            if (name && url) return `${name}_${url}`
            if (name) return name
            return v.id
          }

          for (const v of vouchers) {
            const key = getFileKey(v)
            if (key) map.set(key, v)
          }
          for (const v of state.vouchers) {
            const key = getFileKey(v)
            if (key && !map.has(key)) map.set(key, v)
          }
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return timeB - timeA
          })
          return { vouchers: merged }
        }),

      addVoucher: (data) => {
        const fileUrlToUse = data.pdfUrl || data.editedFileUrl || data.originalFileUrl
        const newVoucher: SavedVoucher = {
          ...data,
          pdfUrl: fileUrlToUse,
          id: `voucher-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          vouchers: [newVoucher, ...state.vouchers],
          selectedVoucher: newVoucher,
        }))
        return newVoucher
      },

      updateVoucher: (id, updates) => {
        set((state) => ({
          vouchers: state.vouchers.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
          selectedVoucher:
            state.selectedVoucher?.id === id
              ? { ...state.selectedVoucher, ...updates }
              : state.selectedVoucher,
        }))
      },

      deleteVoucher: (id) => {
        set((state) => ({
          vouchers: state.vouchers.filter((v) => v.id !== id),
          selectedVoucher:
            state.selectedVoucher?.id === id ? null : state.selectedVoucher,
        }))
      },
    }),
    {
      name: 'vouchers-storage-v4',
      partialize: (state) => ({
        // Do NOT persist vouchers array globally in localStorage to prevent user data leakage across accounts
        selectedVoucher: null,
      }),
    }

  )
)
