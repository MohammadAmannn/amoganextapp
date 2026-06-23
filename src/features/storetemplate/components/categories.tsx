import { useStoreProducts, getCategoriesFromProducts } from "../hooks/use-store-data";
import CategoryCard from "./category-card";
import { Loader2 } from "lucide-react";

/**
 * The Categories component displays a list of categories in a vertical list style
 * similar to Flipkart's category listing
 */
function Categories() {
  const { data: allProducts = [], isLoading, error } = useStoreProducts();
  const categories = getCategoriesFromProducts(allProducts);

  if (isLoading) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs font-semibold text-destructive">Failed to load categories</p>
      </div>
    );
  }

  return (
    <section className="w-full py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-6">
        {/* Header with category count */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground">
            {categories.length} categories
          </span>
        </div>

        {/* Vertical list layout - one category per row */}
        <div className="space-y-2 md:space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8 border rounded-xl bg-muted/10 text-muted-foreground text-sm">
              No categories found.
            </div>
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Categories;