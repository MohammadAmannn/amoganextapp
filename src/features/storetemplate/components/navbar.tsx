"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Menu, Search, ShoppingBag } from "lucide-react";
import React, { useState, useEffect } from "react";
import CartSheet from "./cart-sheet";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    if (pathname?.includes('/store/search')) {
      setSearchQuery(searchParams.get("q") || "");
    } else {
      setSearchQuery("");
    }
  }, [pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const routes = [
    { href: "/store", label: "Home" },
    { href: "/store/products", label: "Products" },
    { href: "/store/categories", label: "Categories" },
    { href: "/store/about", label: "About" },
    { href: "/store/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/80 text-foreground transition-all flex flex-col gap-1.5 py-1.5">
      <div className="container mx-auto px-3 md:px-6 flex h-14 items-center justify-between relative">
        <div className="flex items-center gap-2 shrink-0">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted text-foreground h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background border-r border-border text-foreground p-6">
                <SheetTitle className="text-lg font-bold tracking-tight mb-6">Menu</SheetTitle>
                <nav className="flex flex-col gap-4">
                  {routes.map((route) => (
                    <button
                      key={route.href}
                      onClick={() => router.push(route.href)}
                      className="text-left text-base font-medium transition-colors text-muted-foreground hover:text-foreground py-2 border-b border-border/40 cursor-pointer bg-transparent border-0"
                    >
                      {route.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <button
            onClick={() => router.push("/store")}
            className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0 p-0"
          >
            <div className="p-1.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-tight">Store</span>
          </button>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-8 text-sm absolute left-1/2 -translate-x-1/2">
          {routes.map((route) => (
            <button
              key={route.href}
              onClick={() => router.push(route.href)}
              className="font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 text-sm py-1 px-0.5"
            >
              {route.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <CartSheet />
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-6 pb-1.5 w-full">
        <form onSubmit={handleSearch} className="relative w-full max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 h-10 bg-muted/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
