import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Necklaces", "Rings", "Earrings", "Bracelets", "Watches"];

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = products?.filter(product => 
    activeCategory === "All" || product.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary">The Collection</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Browse our complete catalog of fine jewelry, designed to be cherished for generations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === category 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "bg-white text-foreground hover:bg-secondary hover:text-primary border border-border"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-32 bg-secondary/10 rounded-xl border border-dashed border-border">
                <p className="text-xl text-muted-foreground font-display italic">
                  No treasures found in this category yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
