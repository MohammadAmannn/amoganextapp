import { useStoreProducts } from "../hooks/use-store-data";
import ProductCard from "./product-card";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";

/**
 * FeaturedProducts component - Flipkart style with responsive layout
 */
function FeaturedProducts() {
  const { data: allProducts = [], isLoading, error } = useStoreProducts();
  const featuredProducts = allProducts.slice(0, 4);

  if (isLoading) {
    return (
      <section className="w-full py-4 md:py-8 bg-muted/30">
        <div className="container mx-auto px-3 md:px-6 flex h-[200px] flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-4 md:py-8 bg-muted/30">
        <div className="container mx-auto px-3 md:px-6 flex h-[200px] flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs font-semibold text-destructive">Failed to load featured products</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-4 md:py-8 bg-muted/30">
      <div className="container mx-auto px-3 md:px-6">
        {/* Section header with View All link */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Featured Products
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
              Handpicked items just for you
            </p>
          </div>
          <Link 
            href="/products" 
            className="text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </div>

        {/* Vertical list */}
        <div className="space-y-3 md:space-y-5">
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 border rounded-xl bg-background text-muted-foreground text-sm">
              No products available.
            </div>
          ) : (
            featuredProducts.map((product, index) => (
              <div key={product.id} className="relative">
                {index === 0 && (
                  <span className="absolute -top-2 left-3 md:left-4 z-10 bg-primary text-primary-foreground text-[10px] md:text-xs font-semibold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md">
                    Top Pick
                  </span>
                )}
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;