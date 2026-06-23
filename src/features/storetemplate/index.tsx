import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { CartProvider } from './hooks/use-cart'
import { NavigationProvider, useNavigation } from './hooks/use-navigation'
import Home from './views/home-view'
import ProductsPage from './views/products-view'
import CategoriesPage from './views/categories-view'
import SearchPage from './views/search-view'
import SingleProductPage from './views/product-detail-view'
import CategoryPage from './views/category-detail-view'
import CheckoutPage from './views/checkout-view'
import AddProductPage from './views/add-product-view'
import Navbar from './components/navbar'
import Footer from './components/footer'

function StoreApp() {
  const { view, params } = useNavigation()

  switch (view) {
    case 'home':
      return <Home />
    case 'products':
      return <ProductsPage />
    case 'categories':
      return <CategoriesPage />
    case 'search':
      return <SearchPage />
    case 'product-detail':
      return <SingleProductPage params={{ id: params.id || '' }} />
    case 'category-detail':
      return <CategoryPage params={{ slug: params.slug || '' }} />
    case 'add-product':
      return <AddProductPage />
    case 'about':
      return (
        <>
          <Navbar />
          <div className="container mx-auto py-16 px-4 text-center h-[calc(100vh-280px)] flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">About Our Store</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              We provide high-quality items at amazing prices. Thank you for shopping with us!
            </p>
          </div>
          <Footer />
        </>
      )
    case 'contact':
      return (
        <>
          <Navbar />
          <div className="container mx-auto py-16 px-4 text-center h-[calc(100vh-280px)] flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Have questions? Reach out to us at support@example.com
            </p>
          </div>
          <Footer />
        </>
      )
    case 'checkout':
      return <CheckoutPage />
    default:
      return <Home />
  }
}

export default function StoreTemplate() {
  return (
    <CartProvider>
      <NavigationProvider>
        <div className="flex flex-col h-[calc(100vh-56px)] w-full">
          <AppHeader title='Store Template' />
          <Main fixed fluid className="p-0 flex-1 overflow-y-auto">
            <StoreApp />
          </Main>
        </div>
      </NavigationProvider>
    </CartProvider>
  )
}