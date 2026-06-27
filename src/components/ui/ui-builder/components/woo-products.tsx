"use client"

import React from "react"
import Image from "next/image"
import { Loader2, Star, StarHalf, ShoppingBag, AlertCircle } from "lucide-react"
import { useStoreProducts } from "@/features/storetemplate/hooks/use-store-data"
import { cn } from "@/lib/utils"

interface WooCommerceProductsProps {
  className?: string
  limit?: number
  columns?: "1" | "2" | "3" | "4"
}

export function WooCommerceProducts({
  className,
  limit = 8,
  columns = "3",
}: WooCommerceProductsProps) {
  const { data: allProducts = [], isLoading, error, refetch } = useStoreProducts()

  // Helper function to render star ratings
  const renderStars = (rating: number = 4.5) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
        />
      )
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
        />
      )
    }
    return stars
  }

  // Display limited subset of products
  const products = allProducts.slice(0, limit)

  const columnsMap = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 gap-4 border border-dashed rounded-xl bg-muted/5 min-h-[300px]", className)}>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Fetching WooCommerce products...</p>
          <p className="text-xs text-muted-foreground mt-1">Connecting to WooCommerce API via proxy</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 gap-4 border border-destructive/20 rounded-xl bg-destructive/5 text-center min-h-[300px]", className)}>
        <div className="p-3 bg-destructive/10 rounded-full text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-destructive">Failed to Load Products</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {error instanceof Error ? error.message : "Ensure WooCommerce API credentials are set correctly in your environment."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs font-medium px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Featured Products
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            WooCommerce Integration
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
          {allProducts.length} items available
        </span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/10 text-muted-foreground text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">No products found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try creating products in your WooCommerce dashboard.
          </p>
        </div>
      ) : (
        <div className={cn("grid gap-6", columnsMap[columns])}>
          {products.map((product) => {
            const originalPrice = product.price * 1.3
            const discountPercentage = 23 // Fixed placeholder discount for visuals

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card/45 backdrop-blur-md hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted/40 p-4 flex items-center justify-center">
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 backdrop-blur-md px-2 py-0.5 rounded-md">
                      {product.category || "General"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 backdrop-blur-md px-2 py-0.5 rounded-md w-max">
                      In Stock
                    </span>
                  </div>

                  {product.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="text-muted-foreground/30 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 stroke-[1]" />
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col flex-1 p-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {renderStars()}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        (48 reviews)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {product.description || "Premium quality product with exceptional durability and modern layout design."}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {discountPercentage}% Off
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        // Demo click action
                        alert(`Added ${product.name} to cart (UI Preview)`)
                      }}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
