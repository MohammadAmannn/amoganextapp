import Footer from "../components/footer";
import Navbar from "../components/navbar";
import ProductCard from "../components/product-card";
import { useStoreProducts, getCategoriesFromProducts } from "../hooks/use-store-data";
import { Loader2 } from "lucide-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

function CategoryDetailView({ params }: CategoryPageProps) {
  const { slug } = params;
  const { data: allProducts = [], isLoading, error } = useStoreProducts();
  
  const categories = getCategoriesFromProducts(allProducts);
  const category = categories.find((c) => c.slug === slug);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading category products...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Navbar />
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-2 text-center p-4">
          <p className="text-sm font-semibold text-destructive">Category Not Found</p>
          <p className="text-xs text-muted-foreground">The requested category could not be resolved or loaded.</p>
        </div>
        <Footer />
      </>
    );
  }

  const products = allProducts.filter((product) => product.category === category.name);

  return (
    <>
      <Navbar />
      <section className="w-full py-12 bg-background text-foreground min-h-full">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-foreground">{category.name}</h1>

          {products.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/10 max-w-md mx-auto px-6">
              <h2 className="text-xl font-bold text-foreground">
                No products found in this category
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">We'll stock up soon! Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default CategoryDetailView;
