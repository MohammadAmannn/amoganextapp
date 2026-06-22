import { getAllCategories } from "../lib/data";
import CategoryCard from "./category-card";

/**
 * The Categories component displays a list of categories in a vertical list style
 * similar to Flipkart's category listing
 */
function Categories() {
  const categories = getAllCategories();

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
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;