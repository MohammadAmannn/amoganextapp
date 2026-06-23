/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, Category } from '../lib/types'

// Strip HTML tags from description
const cleanDescription = (html: string) => {
  if (!html) return 'No description available.'
  // Replace HTML tags and clean up whitespace
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const mapWooProduct = (wpProd: any): Product => {
  const categoryName = wpProd.categories && wpProd.categories.length > 0
    ? wpProd.categories[0].name
    : 'Uncategorized'

  const imageSrc = wpProd.images && wpProd.images.length > 0
    ? wpProd.images[0].src
    : '/placeholder/400x400.svg'

  return {
    id: String(wpProd.id),
    name: wpProd.name || '',
    description: cleanDescription(wpProd.short_description || wpProd.description),
    price: parseFloat(wpProd.price) || 0.0,
    image: imageSrc,
    category: categoryName
  }
}

export const mapWooCategory = (wpCat: any): Category => {
  const imageSrc = wpCat.image && wpCat.image.src
    ? wpCat.image.src
    : '/placeholder/300x300.svg'

  return {
    id: String(wpCat.id),
    name: wpCat.name || '',
    slug: wpCat.slug || '',
    image: imageSrc,
    productCount: wpCat.count || 0
  }
}

// Hook to fetch all products from WooCommerce (via our local proxy)
export function useStoreProducts() {
  return useQuery<Product[]>({
    queryKey: ['store-products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) {
        throw new Error('Failed to fetch products from WooCommerce API')
      }
      const data = await res.json()
      return Array.isArray(data) ? data.map(mapWooProduct) : []
    },
    staleTime: 60 * 1000, // 1 minute cache
  })
}

// Hook to fetch a single product from WooCommerce
export function useStoreProduct(id: string) {
  return useQuery<Product | null>({
    queryKey: ['store-product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products?include=${id}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch product ${id}`)
      }
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return mapWooProduct(data[0])
      }
      return null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

// Hook to fetch categories directly from WooCommerce (via our local proxy)
export function useStoreWooCategories() {
  return useQuery<Category[]>({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const res = await fetch('/api/products?endpoint=categories')
      if (!res.ok) {
        throw new Error('Failed to fetch categories from WooCommerce API')
      }
      const data = await res.json()
      return Array.isArray(data) ? data.map(mapWooCategory) : []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

// Mutation to create a category in WooCommerce
export function useCreateWooCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (categoryData: { name: string; image?: { src: string } }) => {
      const res = await fetch('/api/products?endpoint=categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create WooCommerce category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] })
    },
  })
}

// Mutation to create a product in WooCommerce
export function useCreateWooProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productData: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create WooCommerce product')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate both products and categories so the UI updates
      queryClient.invalidateQueries({ queryKey: ['store-products'] })
      queryClient.invalidateQueries({ queryKey: ['store-categories'] })
    },
  })
}

// Mutation to create an order in WooCommerce
export function useCreateWooOrder() {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const res = await fetch('/api/products?endpoint=orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to submit WooCommerce order')
      }
      return res.json()
    },
  })
}

// Helper to extract categories dynamically from products
export function getCategoriesFromProducts(products: Product[]): Category[] {
  const categoryMap = new Map<string, Category>()

  products.forEach((p) => {
    if (!p.category) return
    const name = p.category
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    if (categoryMap.has(name)) {
      const cat = categoryMap.get(name)!
      cat.productCount = (cat.productCount || 0) + 1
    } else {
      categoryMap.set(name, {
        id: slug,
        name,
        slug,
        image: p.image || '/placeholder/300x300.svg',
        productCount: 1
      })
    }
  })

  return Array.from(categoryMap.values())
}

