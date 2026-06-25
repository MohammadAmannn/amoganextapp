"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, Plus, Sparkles, Tag, DollarSign, Package, Image as ImageIcon, Eye, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useStoreWooCategories, useCreateWooCategory, useCreateWooProduct } from "../hooks/use-store-data";
import { toast } from "sonner";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

// Interactive premium product presets for instant mockups
const PRESET_IMAGES = [
  {
    name: "Minimalist Watch",
    category: "Accessories",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Classic Sneakers",
    category: "Footwear",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Premium Headphones",
    category: "Electronics",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Leather Backpack",
    category: "Accessories",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Ceramic Mug",
    category: "Home & Living",
    url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Smart Watch V2",
    category: "Electronics",
    url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Retro Sunglasses",
    category: "Accessories",
    url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Aesthetic Desk Lamp",
    category: "Home & Living",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
  },
];

export default function AddProductView() {
  const router = useRouter();

  // Load existing WooCommerce categories
  const { data: wooCategories = [], isLoading: loadingCats } = useStoreWooCategories();

  // Mutations
  const createCategoryMutation = useCreateWooCategory();
  const createProductMutation = useCreateWooProduct();

  // Form states
  const [name, setName] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // Stock states
  const [manageStock, setManageStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("10");

  // Status state
  const [status, setStatus] = useState("publish");

  // Inline "New Category" panel state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Handle adding a brand new category on WooCommerce
  const handleCreateCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setCreatingCat(true);
    try {
      const newCat = await createCategoryMutation.mutateAsync({
        name: newCatName.trim(),
      });
      
      toast.success(`Category "${newCat.name}" created successfully!`);
      setCategoryId(String(newCat.id));
      setNewCatName("");
      setShowNewCatInput(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create WooCommerce category");
    } finally {
      setCreatingCat(false);
    }
  };

  // Submit product creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!regularPrice.trim() || isNaN(Number(regularPrice))) {
      toast.error("Valid regular price is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select or create a category");
      return;
    }

    // Build payload
    const payload: any = {
      name: name.trim(),
      type: "simple",
      regular_price: regularPrice.trim(),
      description: fullDesc.trim(),
      short_description: shortDesc.trim(),
      categories: [
        {
          id: Number(categoryId),
        },
      ],
      manage_stock: manageStock,
      status: status,
    };

    if (salePrice.trim() && !isNaN(Number(salePrice))) {
      payload.sale_price = salePrice.trim();
    }

    if (manageStock) {
      payload.stock_quantity = Number(stockQuantity) || 0;
    }

    if (imageUrl.trim()) {
      payload.images = [
        {
          src: imageUrl.trim(),
        },
      ];
    }

    const toastId = toast.loading("Adding product to WooCommerce...");

    try {
      const createdProd = await createProductMutation.mutateAsync(payload);
      toast.success(`Successfully published "${createdProd.name}"!`, {
        id: toastId,
      });
      // Redirect back to main store products
      router.push("/store/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to create WooCommerce product", {
        id: toastId,
      });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30 py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/store/products")}
                className="h-9 w-9 rounded-xl border-border/80 bg-background hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go Back</span>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  Add New Product <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Publish a new product directly to your WooCommerce shop
                </p>
              </div>
            </div>
          </div>

          {/* Responsive Two Column Layout */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left: General Product Fields (Take 2 Columns on large screen) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product Info Card */}
              <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Product Details
                  </CardTitle>
                  <CardDescription>
                    Provide the title, summary, and detail copy for this product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="grid gap-2">
                    <Label htmlFor="prod-name" className="text-sm font-semibold">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prod-name"
                      placeholder="e.g. Premium Cotton T-Shirt"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-border/80 focus-visible:ring-primary h-10 text-sm"
                      required
                    />
                  </div>

                  {/* Short Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="short-desc" className="text-sm font-semibold">
                      Brief Summary
                    </Label>
                    <Textarea
                      id="short-desc"
                      placeholder="A short hook describing the key selling point (shows up on cards/listings)"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      className="rounded-xl border-border/80 focus-visible:ring-primary min-h-[70px] text-sm"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="full-desc" className="text-sm font-semibold">
                      Detailed Description
                    </Label>
                    <Textarea
                      id="full-desc"
                      placeholder="Write your detailed product description here..."
                      value={fullDesc}
                      onChange={(e) => setFullDesc(e.target.value)}
                      className="rounded-xl border-border/80 focus-visible:ring-primary min-h-[140px] text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock Card */}
              <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Pricing & Inventory
                  </CardTitle>
                  <CardDescription>
                    Configure WooCommerce pricing values and physical stock.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prices Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reg-price" className="text-sm font-semibold">
                        Regular Price ($) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="reg-price"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 29.99"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sale-price" className="text-sm font-semibold">
                        Sale Price ($) <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <Input
                        id="sale-price"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 19.99"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="rounded-xl border-border/80 focus-visible:ring-primary h-10 text-sm"
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Stock Management Row */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manage-stock" className="text-sm font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" /> Track Inventory
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Manage item counts on WooCommerce directly.
                        </p>
                      </div>
                      <Switch
                        id="manage-stock"
                        checked={manageStock}
                        onCheckedChange={setManageStock}
                      />
                    </div>

                    {manageStock && (
                      <div className="grid gap-2 max-w-[200px] pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="stock-qty" className="text-xs font-semibold">
                          Stock Quantity
                        </Label>
                        <Input
                          id="stock-qty"
                          type="number"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          className="rounded-xl border-border/80 focus-visible:ring-primary h-9 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Media preset chooser */}
              <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" /> Product Preset Images
                  </CardTitle>
                  <CardDescription>
                    Pick a curated high-quality presets or paste a custom URL to populate the image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="img-url" className="text-sm font-semibold">
                      Product Image URL
                    </Label>
                    <Input
                      id="img-url"
                      placeholder="Paste image URL here, or click a mockup preset below..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="rounded-xl border-border/80 focus-visible:ring-primary h-10 text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                      Instant Mockup Presets (Click to select)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PRESET_IMAGES.map((preset) => {
                        const isSelected = imageUrl === preset.url;
                        return (
                          <div
                            key={preset.name}
                            onClick={() => {
                              setImageUrl(preset.url);
                              toast.info(`Preset image selected: ${preset.name}`);
                            }}
                            className={`group relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                                : "border-transparent hover:border-muted-foreground/30 hover:scale-[1.01]"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-1.5">
                              <span className="text-[10px] font-bold text-white truncate">
                                {preset.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Taxonomy, Status and Submission (Take 1 Column) */}
            <div className="space-y-6">
              
              {/* Product Status & Publish Control */}
              <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> Publish
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status-select" className="text-sm font-semibold">
                      Visibility Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status-select" className="rounded-xl border-border/80 h-10 text-sm">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="publish" className="text-sm">Published</SelectItem>
                        <SelectItem value="draft" className="text-sm">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full h-10 rounded-xl font-bold flex items-center justify-center gap-2"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      "Publish Product"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-10 rounded-xl text-muted-foreground hover:text-foreground text-sm"
                    onClick={() => router.push("/store/products")}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </Card>

              {/* WooCommerce Categories Selector */}
              <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Shop Category
                  </CardTitle>
                  <CardDescription>
                    Organize your product under WooCommerce taxonomies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Select Category */}
                  <div className="grid gap-2">
                    <Label htmlFor="category-select" className="text-sm font-semibold">
                      Select Category <span className="text-destructive">*</span>
                    </Label>
                    
                    {loadingCats ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading WooCommerce categories...
                      </div>
                    ) : (
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger id="category-select" className="rounded-xl border-border/80 h-10 text-sm">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border max-h-[220px]">
                          {wooCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-sm">
                              {cat.name} ({cat.productCount || 0})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Toggle new category input */}
                  <div className="pt-2">
                    {!showNewCatInput ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCatInput(true)}
                        className="text-xs h-8 border-dashed border-border/80 rounded-lg flex items-center gap-1.5"
                      >
                        <Plus className="h-3 w-3" /> New Category
                      </Button>
                    ) : (
                      <div className="space-y-3 pt-2 p-3 bg-muted/40 rounded-xl border border-border/40 animate-in fade-in duration-200">
                        <Label htmlFor="new-cat-name" className="text-xs font-bold">
                          Category Name
                        </Label>
                        <Input
                          id="new-cat-name"
                          placeholder="e.g. Outerwear"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="h-8 text-xs rounded-lg border-border/80 bg-background"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNewCatInput(false)}
                            className="h-7 px-2 text-[10px] rounded-lg"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateCategory}
                            disabled={creatingCat}
                            className="h-7 px-2 text-[10px] rounded-lg"
                          >
                            {creatingCat ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Create"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
