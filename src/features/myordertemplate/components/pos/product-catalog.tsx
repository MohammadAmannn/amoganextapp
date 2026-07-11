'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Layout, List, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './product-card'
import type { Product } from './types'

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void
  products: Product[]
  categories: string[]
  isLoading: boolean
  isLoadingCategories: boolean
  error: string | null
  onRefresh: () => void
}

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '1-Ajax Rode Bloemen kofir',
    price: 99,
    originalPrice: 100,
    image: '/products/hoodie-1.png',
    category: 'Clothing',
    hasVariants: true,
  },
  {
    id: '2',
    name: 'Light Cured Composite...',
    price: 32,
    image: '/products/bag-1.png',
    category: 'Accessories',
  },
  {
    id: '3',
    name: 'Pencil Stabilo',
    price: 30,
    image: '/products/pencil-1.png',
    category: 'Office',
  },
  {
    id: '4',
    name: 'Poster',
    price: 50,
    image: '/products/poster-1.png',
    category: 'Art',
  },
  {
    id: '5',
    name: 'STATIONARY',
    price: 15,
    image: '/products/shirt-1.png',
    category: 'Office',
  },
  {
    id: '6',
    name: 'Sarung Tagang/Handsos',
    price: 25,
    image: '/products/pennant-1.png',
    category: 'Accessories',
  },
  {
    id: '7',
    name: 'Smile Design Planning',
    price: 45,
    image: '/products/sweatshirt-1.png',
    category: 'Clothing',
  },
  {
    id: '8',
    name: 'Sweater',
    price: 55,
    image: '/products/sweater-1.png',
    category: 'Clothing',
  },
]

const FILTER_OPTIONS = ['In Stock', 'Featured', 'On Sale', 'Category', 'Tag', 'Brand']

import { X } from 'lucide-react'

export function ProductCatalog({
  onAddToCart,
  products,
  categories,
  isLoading,
  isLoadingCategories,
  error,
  onRefresh,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>(['In Stock'])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const [showCategorySubmenu, setShowCategorySubmenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Stock filter (mocked or custom logic)
      const matchesStock = !activeFilters.includes('In Stock') || true

      // On Sale filter
      const matchesOnSale = !activeFilters.includes('On Sale') || product.originalPrice !== undefined

      // Category submenu filter
      const matchesCategory = !showCategorySubmenu || selectedCategory === null || product.category === selectedCategory
      
      return matchesSearch && matchesStock && matchesOnSale && matchesCategory
    })
  }, [products, searchQuery, activeFilters, showCategorySubmenu, selectedCategory])

  const toggleFilter = (filter: string) => {
    if (filter === 'Category') {
      setShowCategorySubmenu((prev) => {
        const nextState = !prev
        if (!nextState) {
          setSelectedCategory(null) // Reset category filter when submenu closes
        }
        return nextState
      })
    } else if (filter === 'In Stock') {
      setActiveFilters(['In Stock'])
      setShowCategorySubmenu(false)
      setSelectedCategory(null)
    } else {
      setActiveFilters((prev) => {
        const withoutInStock = prev.filter((f) => f !== 'In Stock')
        const updated = withoutInStock.includes(filter)
          ? withoutInStock.filter((f) => f !== filter)
          : [...withoutInStock, filter]
        return updated.length === 0 ? ['In Stock'] : updated
      })
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-3">
      {/* Search & Filters Header (Sticky/Fixed) */}
      <div className="space-y-3 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeFilters.includes(filter) || (filter === 'Category' && showCategorySubmenu)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Category Submenu */}
        {showCategorySubmenu && (
          <div className="p-3 bg-gray-50 border border-dashed border-border rounded-lg flex flex-wrap gap-1.5 transition-all">
            {isLoadingCategories ? (
              <span className="text-xs text-muted-foreground">Loading categories...</span>
            ) : categories.length === 0 ? (
              <span className="text-xs text-muted-foreground">No categories found.</span>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === null
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Products Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
        {/* Loading & Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <span className="animate-spin text-2xl">🔄</span>
            <p className="text-sm">Fetching products from WooCommerce...</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            Failed to fetch live products ({error}). Showing sample fallback products.
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>Showing {filteredProducts.length} of {products.length}</span>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}
