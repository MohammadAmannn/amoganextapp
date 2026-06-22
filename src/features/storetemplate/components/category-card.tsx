import { Category } from "../lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

/**
 * CategoryCard component displays a category in a vertical list style
 * similar to Flipkart's category listing with image on left and name on right
 */
function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="overflow-hidden border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-lg flex flex-row items-center p-2 md:p-3 gap-3 md:gap-4">
        {/* Category Image - Left side with responsive sizing */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
          />
        </div>
        
        {/* Category Details - Right side */}
        <CardContent className="p-0 flex-1 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base truncate">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {category.productCount || 0} {category.productCount === 1 ? 'product' : 'products'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0 ml-2" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default CategoryCard;