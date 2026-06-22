import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { useCart } from "../hooks/use-cart";

export default function CartSheet() {
  const { items, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.length;
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-xl border-border/80 text-foreground hover:bg-muted">
          <ShoppingBag className="h-4.5 w-4.5" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border border-background">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background text-foreground border-l border-border flex flex-col p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-bold">Shopping Cart ({totalItems})</SheetTitle>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <div className="p-4 bg-muted/40 rounded-full text-muted-foreground border border-border/50">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1 px-4">
              <h3 className="text-base font-bold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add some products to your cart to see them here.
              </p>
            </div>
            <Button asChild className="rounded-xl px-6" onClick={() => setIsOpen(false)}>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted border border-border/50 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <Button onClick={() => removeFromCart(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Total */}
            <div className="pt-4 border-t border-border mt-auto space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="space-y-2 pt-2">
                <Button asChild className="w-full h-11 rounded-xl font-bold shadow-md" onClick={() => setIsOpen(false)}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-semibold" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
