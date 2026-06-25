"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCart } from "../hooks/use-cart";
import { Product } from "../lib/types";
import { ShoppingCart, Star, StarHalf } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard component - Fully responsive Flipkart-style product card
 * Mobile: Vertical layout with image on top
 * Desktop: Horizontal layout with image on left
 */
function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Helper function to render star ratings
  const renderStars = (rating: number = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-3 w-3 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />);
    }
    return stars;
  };

  return (
    <Card className="overflow-hidden border border-border/80 bg-card hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col md:flex-row w-full p-0 gap-0">
      {/* Product Image - Full width on mobile, fixed width on desktop */}
      <Link 
        href={`/store/products/${product.id}`} 
        className="relative overflow-hidden bg-muted flex-shrink-0 w-full md:w-48 lg:w-56 xl:w-64 aspect-square md:aspect-auto md:h-48 lg:h-56 xl:h-64"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-2 md:p-4 transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </Link>

      {/* Product Details - Below image on mobile, right side on desktop */}
      <div className="flex flex-col flex-1 p-3 md:p-5 min-w-0">
        <CardContent className="p-0 flex-1">
          <div className="space-y-1.5 md:space-y-2.5">
            {/* Product Name */}
            <Link href={`/store/products/${product.id}`} className="block">
              <h3 className="font-medium text-sm md:text-base text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>

            {/* Ratings - Flipkart style */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <div className="flex items-center gap-0.5">
                {renderStars()}
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">(1,234)</span>
            </div>

            {/* Price - Flipkart style with original price and discount */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <p className="font-bold text-base md:text-lg text-foreground">₹{product.price.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-muted-foreground line-through">₹{(product.price * 1.4).toFixed(2)}</p>
              <span className="text-xs md:text-sm font-semibold text-green-600">28% off</span>
            </div>

            {/* Product Category with badge and stock status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                {product.category}
              </span>
              <span className="text-[10px] md:text-xs text-green-600 font-medium">In Stock</span>
            </div>

            {/* Product description - Hidden on mobile, visible on desktop */}
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
              {product.description || "High quality product with premium features and excellent build quality."}
            </p>
          </div>
        </CardContent>

        {/* Action Buttons - Stacked on mobile, side by side on desktop */}
        <CardFooter className="p-0 pt-3 md:pt-4 flex flex-col sm:flex-row gap-1.5 md:gap-2">
          <Button
            onClick={() => addToCart(product)}
            className="w-full sm:flex-1 rounded-md font-semibold bg-[#fb641b] hover:bg-[#f85a00] text-white transition-colors duration-300 text-xs md:text-sm py-2 md:py-2.5"
          >
            <ShoppingCart className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            Add to Cart
          </Button>
          <Button
            onClick={() => addToCart(product)}
            className="w-full sm:flex-1 rounded-md font-semibold bg-[#ff9f00] hover:bg-[#f59100] text-white transition-colors duration-300 text-xs md:text-sm py-2 md:py-2.5"
          >
            Buy Now
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default ProductCard;