"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getAllCategories, getAllProducts } from "../lib/data";
import { Product } from "../lib/types";
import ProductCard from "../components/product-card";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { SearchIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "../components/ui/input";
import FilterSidebar from "../components/filter-sidebar";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useNavigation } from "../hooks/use-navigation";

function SearchView() {
  const { params } = useNavigation();
  const searchParams = useSearchParams();
  const initialQuery = params.q || searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);


  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = getAllCategories();
  const allProducts = getAllProducts();

  // Get min and max prices from all products
  const minPrice = Math.min(...allProducts.map((product) => product.price));
  const maxPrice = Math.max(...allProducts.map((product) => product.price));

  useEffect(() => {
    let results = [...allProducts];

    if (searchQuery) {
      results = results.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(searchQuery.toLocaleLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLocaleLowerCase())
      );
    }

    // Apply Category Filter
    if (selectedCategories.length > 0) {
      results = results.filter((product) => {
        return selectedCategories.includes(product.category);
      });
    }

    // Apply price range filter
    results = results.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(results);
  }, [searchQuery, priceRange, selectedCategories, allProducts]);

  // Sync search input with navigation search query parameter
  useEffect(() => {
    if (params.q !== undefined) {
      setSearchQuery(params.q);
    }
  }, [params.q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
    setSearchQuery("");
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  return (
    <>
      <Navbar />
      <div className="py-8 bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-8">
            {/* Mobile Filter Button */}
            <div className="flex md:hidden justify-between items-center mb-2">
              <h1 className="text-2xl font-bold tracking-tight">Search Products</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl border-border/80 text-foreground hover:bg-muted font-semibold">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-background border-r border-border text-foreground p-6">
                  <SheetTitle className="text-lg font-bold tracking-tight mb-4">Filters</SheetTitle>
                  <div className="py-2">
                    <FilterSidebar
                      categories={categories}
                      selectedCategories={selectedCategories}
                      priceRange={priceRange}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onCategoryChange={handleCategoryChange}
                      onPriceChange={handlePriceChange}
                      onClearFilters={clearAllFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-1/4 min-w-[240px] max-w-[280px]">
              <div className="border border-border/80 rounded-2xl p-5 bg-card/50 backdrop-blur-sm sticky top-24">
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  priceRange={priceRange}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={handleCategoryChange}
                  onPriceChange={handlePriceChange}
                  onClearFilters={clearAllFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Search input */}
              <div className="md:hidden mb-6">
                <form onSubmit={handleSearch} className="flex w-full gap-2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full bg-muted/50 border-border/80 rounded-xl focus-visible:ring-1 focus-visible:ring-primary h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" className="rounded-xl h-11 w-11 p-0 shrink-0 font-bold">
                    <SearchIcon className="h-5 w-5" />
                  </Button>
                </form>
              </div>

              {/* Desktop Search input */}
              <div className="hidden md:block mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight mb-6">Search Products</h1>
                <form onSubmit={handleSearch} className="flex w-full gap-2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full bg-muted/50 border-border/80 rounded-xl focus-visible:ring-1 focus-visible:ring-primary h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" className="rounded-xl h-11 px-6 font-bold">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-muted-foreground font-medium">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"} found
              </div>

              {/* Results */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/10">
                  <h2 className="text-xl font-semibold text-foreground">No products found</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl border-border/80 text-foreground font-semibold"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SearchView;
