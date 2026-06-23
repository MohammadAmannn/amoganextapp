import ProductCard from "./product-card";
import { useStoreProducts } from "../hooks/use-store-data";
import { Loader2 } from "lucide-react";

/**
 * The Products component displays all products in a vertical list
 * Fully responsive with proper spacing
 */
function Products() {
  const { data: allProducts = [], isLoading, error } = useStoreProducts();

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching WooCommerce products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 text-center p-4">
        <p className="text-sm font-semibold text-destructive">Failed to load WooCommerce products</p>
        <p className="text-xs text-muted-foreground">Please check your network and consumer key setup.</p>
      </div>
    );
  }

  return (
    <section className="w-full py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-6">
        {/* Header with product count */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground">
            All Products
          </h1>
          <span className="text-xs md:text-sm text-muted-foreground">
            {allProducts.length} items
          </span>
        </div>

        {/* Vertical list - one product per row */}
        <div className="space-y-3 md:space-y-5">
          {allProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-muted/10 text-muted-foreground">
              No products found in WooCommerce.
            </div>
          ) : (
            allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;