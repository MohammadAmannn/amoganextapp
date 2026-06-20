import { X } from 'lucide-react'

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string | null
  onClose: () => void
}

export function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'
      onClick={onClose}
    >
      <div className='relative max-w-4xl max-h-[90vh] p-4'>
        <button
          onClick={onClose}
          className='absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
        >
          <X className='w-6 h-6' />
        </button>
        <img
          src={imageUrl}
          alt='Enlarged view'
          className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl'
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}