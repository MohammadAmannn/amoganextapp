import ProductCard from "./product-card";
import { getAllProducts } from "../lib/data";

/**
 * The Products component displays all products in a vertical list
 * Fully responsive with proper spacing
 */
function Products() {
  const allProducts = getAllProducts();

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
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;