'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from './types'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.hasVariants && (
          <Badge className="absolute top-2 right-2 z-10 bg-gray-600">Variants</Badge>
        )}
        <Image
          src={product.image}
          alt={product.name}
          width={160}
          height={160}
          className="object-cover h-full w-full group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
