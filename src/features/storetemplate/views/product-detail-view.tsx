import { useStoreProduct } from "../hooks/use-store-data";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Image from "next/image";
import AddToCartButton from "../components/add-to-cart-button";
import { Separator } from "@radix-ui/react-separator";
import { Loader2 } from "lucide-react";

interface Params {
  id: string;
}

/**
 * The product page component
 * @param {Params} params The route params
 * @returns {JSX.Element} The component
 */
export default function ProductDetailView({
  params,
}: {
  params: Params;
}) {
  const { id } = params;
  const { data: product, isLoading, error } = useStoreProduct(id);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-2 text-center p-4">
          <p className="text-sm font-semibold text-destructive">Product Not Found</p>
          <p className="text-xs text-muted-foreground">The requested product could not be found or loaded.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* The navbar component */}
      <Navbar />

      {/* The main content */}
      <div className="bg-background text-foreground min-h-full py-12">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* The product image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border/80 shadow-sm">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* The product details */}
            <div className="flex flex-col space-y-5">
              <div>
                {/* The product category */}
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.category}</span>
                {/* The product name */}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-1">
                  {product.name}
                </h1>
              </div>

              {/* The product price */}
              <p className="text-2xl text-foreground font-bold">
                ${product.price.toFixed(2)}
              </p>

              <Separator className="bg-border/60" />

              {/* The product description */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>

              <Separator className="bg-border/60" />

              {/* The add to cart button */}
              <div className="pt-2">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The footer component */}
      <Footer />
    </>
  );
}
