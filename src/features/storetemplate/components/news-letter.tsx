import { Button } from "./ui/button";

/**
 * A component for displaying a newsletter subscription form.
 *
 * @return {JSX.Element}
 */
function NewsLetter() {
  return (
    <section className="w-full py-16 md:py-20 border-t border-border/60 bg-muted/40 dark:bg-muted/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center space-y-4 text-center max-w-2xl mx-auto">
          {/* Newsletter title and description */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Stay updated with our latest products, community updates, and exclusive offers.
            </p>
          </div>
          {/* Newsletter form */}
          <div className="w-full max-w-md pt-2">
            <form className="flex flex-col sm:flex-row gap-2 w-full">
              {/* Email input field */}
              <input
                className="flex h-11 w-full rounded-xl border border-border/80 bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground flex-1"
                placeholder="Enter your email address"
                type="email"
                required
              />
              {/* Subscribe button */}
              <Button type="submit" className="rounded-xl h-11 px-6 font-bold shadow-sm w-full sm:w-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsLetter;