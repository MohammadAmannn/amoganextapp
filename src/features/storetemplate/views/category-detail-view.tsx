import Footer from "../components/footer";
import Navbar from "../components/navbar";
import ProductCard from "../components/product-card";
import { getCategoryBySlug, getProductsByCategory } from "../lib/data";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

function CategoryDetailView({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return notFound();
  }

  const products = getProductsByCategory(category.name);

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
