import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export type ViewType =
  | 'home'
  | 'products'
  | 'categories'
  | 'search'
  | 'about'
  | 'contact'
  | 'product-detail'
  | 'category-detail'
  | 'checkout'
  | 'add-product'

export interface NavigationContextType {
  view: ViewType
  params: Record<string, string>
  setView: (path: string) => void
  setViewWithParams: (view: ViewType, params: Record<string, string>) => void
  goBack: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<{ view: ViewType; params: Record<string, string> }[]>([
    { view: 'home', params: {} },
  ])

  const current = history[history.length - 1] || { view: 'home', params: {} }

  const setViewWithParams = useCallback((view: ViewType, params: Record<string, string>) => {
    setHistory((prev) => [...prev, { view, params }])
  }, [])

  const setView = useCallback((path: string) => {
    if (path === '/' || path === '') {
      setViewWithParams('home', {})
      return
    }

    if (path.startsWith('/search')) {
      // Parse search queries like "/search?q=phone" or just "/search"
      let q = ''
      if (path.includes('?')) {
        try {
          const searchPart = path.split('?')[1]
          const params = new URLSearchParams(searchPart)
          q = params.get('q') || ''
        } catch (e) {
          console.error('Failed to parse search query:', e)
        }
      }
      setViewWithParams('search', { q })
      return
    }

    if (path.startsWith('/products/')) {
      const id = path.replace('/products/', '')
      setViewWithParams('product-detail', { id })
      return
    }

    if (path === '/products') {
      setViewWithParams('products', {})
      return
    }

    if (path.startsWith('/categories/')) {
      const slug = path.replace('/categories/', '')
      setViewWithParams('category-detail', { slug })
      return
    }

    if (path === '/categories') {
      setViewWithParams('categories', {})
      return
    }

    if (path === '/about') {
      setViewWithParams('about', {})
      return
    }

    if (path === '/contact') {
      setViewWithParams('contact', {})
      return
    }

    if (path === '/checkout') {
      setViewWithParams('checkout', {})
      return
    }

    if (path === '/add-product') {
      setViewWithParams('add-product', {})
      return
    }
  }, [setViewWithParams])

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        view: current.view,
        params: current.params,
        setView,
        setViewWithParams,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
