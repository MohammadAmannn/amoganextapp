import React, { useState } from 'react'
import { useCart } from '../hooks/use-cart'
import { useNavigation } from '../hooks/use-navigation'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ShoppingBag, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CheckoutView() {
  const { items, clearCart } = useCart()
  const { setView } = useNavigation()

  // Selection states
  const [shippingMethod, setShippingMethod] = useState<'fast' | 'free'>('fast')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'virtual'>('card')

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    nameOnCard: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const shipping = shippingMethod === 'fast' ? 4.99 : 0
  const discount = 0
  const total = subtotal + shipping - discount

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    
    // Simulate API request
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setOrderId('ORD-' + Math.floor(100000 + Math.random() * 900000))
      clearCart()
    }, 1500)
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-full bg-background text-foreground">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-lg flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30 mb-6 animate-pulse">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-1">Thank you for your purchase.</p>
          <p className="text-sm font-bold text-primary mb-6">Order ID: {orderId}</p>
          
          <div className="p-5 bg-card border border-border/80 rounded-2xl w-full text-left text-sm mb-6 shadow-sm space-y-2">
            <h4 className="font-bold mb-3 text-foreground border-b border-border/40 pb-2">Delivery Details</h4>
            {formData.email && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Email:</span> {formData.email}
              </p>
            )}
            {paymentMethod === 'card' && formData.cardNumber && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Paid via:</span> Card ending in {formData.cardNumber.slice(-4) || '••••'}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Shipping Method:</span> {shippingMethod === 'fast' ? 'Fast Delivery ($4.99)' : 'Free Delivery'}
            </p>
          </div>

          <Button onClick={() => setView('/')} size="lg" className="w-full rounded-xl font-bold h-12 shadow-md shadow-primary/20 hover:shadow-none transition-all">
            Continue Shopping
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('/')}
            className="flex items-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Store</span>
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8 text-foreground">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/10 max-w-md mx-auto px-6">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2 mb-6 text-sm">Add some products to your cart before checking out.</p>
            <Button onClick={() => setView('/')} className="rounded-xl font-semibold px-6">Go to Shop</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Cart Items & Shipping options */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Product list */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border border-border/60 bg-card rounded-2xl">
                    <div className="relative w-20 h-20 bg-muted/60 dark:bg-muted/10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description || `${item.name} is a premium product in ${item.category}.`}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-background text-foreground">
                          White
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-foreground text-sm sm:text-base">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Shipping */}
              <div className="pt-4 border-t border-border/40">
                <h2 className="text-lg font-bold text-foreground">Delivery Shipping</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Select a delivery option for your order.</p>
                
                <div className="mt-4 space-y-3">
                  {/* Fast Delivery Option */}
                  <div
                    onClick={() => setShippingMethod('fast')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                      shippingMethod === 'fast'
                        ? "border-foreground bg-card shadow-sm"
                        : "border-border/60 hover:border-border bg-card/40"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-foreground">$4.99 • Fast Delivery</span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                          Recommend
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Get it by Tomorrow, 12 Oct 23</p>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-4",
                      shippingMethod === 'fast' ? "border-foreground" : "border-border"
                    )}>
                      {shippingMethod === 'fast' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Free Delivery Option */}
                  <div
                    onClick={() => setShippingMethod('free')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                      shippingMethod === 'free'
                        ? "border-foreground bg-card shadow-sm"
                        : "border-border/60 hover:border-border bg-card/40"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm sm:text-base text-foreground">Free Delivery</span>
                      <p className="text-xs text-muted-foreground mt-1">Get it by Friday, 17 - 18 Oct 23</p>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-4",
                      shippingMethod === 'free' ? "border-foreground" : "border-border"
                    )}>
                      {shippingMethod === 'free' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Payment details & Billing */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Email address</label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="rounded-xl bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary h-11"
                  />
                </div>

                {/* Select Payment Method */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-foreground">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Option */}
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === 'card'
                          ? "border-foreground bg-background"
                          : "border-border/60 hover:border-border bg-background/40"
                      )}
                    >
                      <span className="text-xs font-bold text-foreground">Debit / Credit Card</span>
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                        paymentMethod === 'card' ? "border-foreground" : "border-border"
                      )}>
                        {paymentMethod === 'card' && (
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Virtual Account Option */}
                    <div
                      onClick={() => setPaymentMethod('virtual')}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === 'virtual'
                          ? "border-foreground bg-background"
                          : "border-border/60 hover:border-border bg-background/40"
                      )}
                    >
                      <span className="text-xs font-bold text-foreground">Virtual account</span>
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                        paymentMethod === 'virtual' ? "border-foreground" : "border-border"
                      )}>
                        {paymentMethod === 'virtual' && (
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-2 border-t border-border/40">
                    <label className="text-xs font-bold text-foreground">Card Details</label>
                    
                    <div className="space-y-3">
                      <Input
                        required
                        placeholder="Name on card"
                        value={formData.nameOnCard}
                        onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                        className="rounded-xl bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary h-11"
                      />

                      <div className="relative">
                        <Input
                          required
                          placeholder="Card number"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className="rounded-xl bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary h-11 pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-sky-850 dark:text-sky-400 text-xs italic tracking-wider select-none">
                          VISA
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          required
                          placeholder="MM / YY"
                          value={formData.cardExpiry}
                          onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                          className="rounded-xl bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary h-11"
                        />
                        <Input
                          required
                          placeholder="CVC"
                          value={formData.cardCvc}
                          onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                          className="rounded-xl bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'virtual' && (
                  <div className="p-4 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground">
                    Please proceed to checkout. A virtual account details will be generated for you after placing the order.
                  </div>
                )}

                {/* Summary Billing */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sub Total</span>
                    <span className="font-bold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-bold text-foreground">${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-1">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-extrabold text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 bg-black dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Pay ${total.toFixed(2)} →</span>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground leading-normal">
                    Payment are secure and encrypted
                  </p>
                </div>

              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
