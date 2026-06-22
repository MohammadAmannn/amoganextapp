"use client";

import { useCart } from "../hooks/use-cart";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "../lib/types";

interface ProductCartProps {
  product: Product;
  className?: string;
}

/**
 * Component for the "Add To Cart" button.
 *
 * @param product - The product to add to the cart.
 * @param className - Additional classes for styling the button.
 */
export default function AddToCartButton({ product, className }: ProductCartProps) {
  const { addToCart } = useCart();

  /**
   * Handles the click event to add the product to the cart.
   */
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Button onClick={handleAddToCart} className={`w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-none transition-all flex items-center justify-center gap-2 ${className || ""}`}>
      <ShoppingCart className="h-4.5 w-4.5" />
      <span>Add to Cart</span>
    </Button>
  );
}
