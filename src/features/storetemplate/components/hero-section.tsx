import Link from "next/link";
import { Button } from "./ui/button";

/**
 * The hero section of the homepage, which displays a title, a
 * descriptive paragraph, and a call-to-action button.
 */
const HeroSection = () => {
  return (
    <section className="relative w-full py-16 md:py-28 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border/50">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-0 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[12s]" />

      <div className="container mx-auto px-4 md:px-8 flex flex-col items-center gap-6 text-center max-w-4xl relative">
        {/* Modern Tag Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm mb-2">
          <span>✨ Premium E-Commerce Experience</span>
        </div>

        {/* Heading & Paragraph */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Discover Quality Products
          </h1>
          <p className="mx-auto max-w-[640px] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
            Shop our curated collection of premium products designed for modern living. Elevate your everyday experience with style and convenience.
          </p>
        </div>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto px-4 sm:px-0">
          <Button asChild size="lg" className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-none transition-all w-full sm:w-auto">
            <Link href="/products">Shop Collection</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl h-12 px-8 font-medium w-full sm:w-auto bg-background/50 backdrop-blur-sm">
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;