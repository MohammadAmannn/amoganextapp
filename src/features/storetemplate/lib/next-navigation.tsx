import { useNavigation } from '../hooks/use-navigation'

export function useRouter() {
  const { setView, goBack } = useNavigation()
  return {
    push: (url: string) => setView(url),
    back: () => goBack(),
    replace: (url: string) => setView(url),
    prefetch: () => {},
  }
}

export function useSearchParams() {
  const { params } = useNavigation()
  return {
    get: (key: string) => params[key] || null,
  }
}

export function usePathname() {
  const { view, params } = useNavigation()
  if (view === 'home') return '/'
  if (view === 'products') return '/products'
  if (view === 'categories') return '/categories'
  if (view === 'search') return '/search'
  if (view === 'product-detail') return `/products/${params.id}`
  if (view === 'category-detail') return `/categories/${params.slug}`
  return '/'
}

export function notFound() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-background rounded-xl border border-dashed border-border">
      <h2 className="text-xl font-bold text-destructive">404 - Not Found</h2>
      <p className="text-sm text-muted-foreground mt-1">The requested product or category could not be found.</p>
    </div>
  )
}
