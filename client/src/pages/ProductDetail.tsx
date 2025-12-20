import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/use-products";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, Check, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = parseInt(params?.id || "0");
  const { data: product, isLoading, error } = useProduct(id);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your bag.`,
      });
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-2xl font-display font-bold">Product not found</h2>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price / 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-secondary rounded-lg overflow-hidden shadow-2xl">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary mt-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-light mt-4 text-foreground/80">
                {priceFormatted}
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="prose prose-stone text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-none"
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 h-14 text-lg rounded-none border-primary/20 hover:bg-secondary"
              >
                Book Appointment
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Lifetime Warranty</h4>
                  <p className="text-xs text-muted-foreground mt-1">Protection for your investment.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Secure Shipping</h4>
                  <p className="text-xs text-muted-foreground mt-1">Insured delivery worldwide.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Authenticity Guaranteed</h4>
                  <p className="text-xs text-muted-foreground mt-1">Certified by GIA gemologists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
