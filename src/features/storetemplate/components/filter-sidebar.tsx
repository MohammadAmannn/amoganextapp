"use client";

import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Category } from "../lib/types";


interface FilterSidebarProps {
  categories: Category[];
  selectedCategories: string[];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  onCategoryChange: (category: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

/**
 * The FilterSidebar component displays a list of categories and a price range
 * filter. The component also has a "Clear All Filters" button and a "Price Range"
 * toggle.
 *
 * @param categories - An array of categories to display.
 * @param selectedCategories - An array of selected categories.
 * @param priceRange - The currently selected price range.
 * @param minPrice - The minimum price of the price range.
 * @param maxPrice - The maximum price of the price range.
 * @param onCategoryChange - A function to call when a category is checked or
 * unchecked.
 * @param onPriceChange - A function to call when the price range is changed.
 * @param onClearFilters - A function to call when the "Clear All Filters" button
 * is clicked.
 */
function FilterSidebar({
  categories,
  selectedCategories,
  priceRange,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-foreground">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="rounded-xl border-border/80 text-foreground hover:bg-muted font-semibold text-xs"
        >
          Clear All
        </Button>
      </div>

      <Separator className="bg-border/60" />

      <Accordion
        type="multiple"
        defaultValue={["categories", "price"]}
        className="w-full"
      >
        <AccordionItem value="categories" className="border-border/60">
          <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={() => onCategoryChange(category.name)}
                    className="border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer select-none"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-0">
          <AccordionTrigger className="font-semibold text-sm hover:no-underline py-3">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2 px-1">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                min={minPrice}
                max={maxPrice}
                step={1}
                value={priceRange}
                onValueChange={(value: number[]) =>
                  onPriceChange(value as [number, number])
                }
                className="my-4"
              />
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Min Price</span>
                  <div className="border border-border/80 bg-background rounded-xl px-3 py-1.5 w-24 text-center font-bold text-foreground">
                    ${priceRange[0]}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Max Price</span>
                  <div className="border border-border/80 bg-background rounded-xl px-3 py-1.5 w-24 text-center font-bold text-foreground">
                    ${priceRange[1]}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default FilterSidebar;