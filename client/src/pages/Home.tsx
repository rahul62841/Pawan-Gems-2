import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { Link } from "wouter";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.filter(p => p.isFeatured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background with Gradients */}
        <div className="absolute inset-0 bg-secondary/30 z-0">
           <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/10 to-transparent" />
           <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="container relative z-10 px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <span className="text-accent uppercase tracking-[0.2em] font-medium text-sm">
              Established 1985
            </span>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] text-primary">
              Timeless Elegance, <br />
              <span className="italic font-light">Modern Precision.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed font-light">
              Discover a collection where old-world craftsmanship meets contemporary design. 
              Each piece tells a story of luxury and refinement.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/shop">
                <Button size="lg" className="rounded-none px-8 py-6 text-base bg-primary hover:bg-primary/90">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="rounded-none px-8 py-6 text-base border-primary/20 hover:bg-secondary">
                  Our Heritage
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            {/* Hero Image */}
            <div className="relative aspect-[3/4] max-w-md mx-auto">
              <div className="absolute -inset-4 border border-accent/30 rounded-full opacity-50 rotate-3 scale-105" />
              {/* Unsplash Jewelry Image */}
              {/* woman wearing luxury necklace */}
              <img 
                src="https://pixabay.com/get/g3ae64e5169d979e1e435fec990fea9ef7341ade37d28943bdac0b8e2969d92db5a855d01f88637ab4902332e7166bbf905e6de407f5323f653a9d4e5652d462a_1280.jpg" 
                alt="Luxury Jewelry Model" 
                className="w-full h-full object-cover rounded-t-[10rem] rounded-b-[2rem] shadow-2xl shadow-primary/20"
              />
              
              <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl max-w-[200px]">
                <div className="flex text-accent mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="font-display italic text-lg leading-tight">
                  "The attention to detail is simply unmatched."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 bg-white">
        <div className="container px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl font-bold text-primary mb-4">Curated Selections</h2>
              <p className="text-muted-foreground">Hand-picked favorites from our master jewelers, representing the pinnacle of our craftsmanship.</p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" className="group text-primary hover:bg-transparent hover:text-primary/80 px-0">
                View All Collection <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-3 text-center py-20 bg-secondary/20 rounded-lg">
                  <p className="text-muted-foreground">No featured products yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories / Banner */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        <div className="container relative z-10 px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-6xl font-bold mb-8">
            The Golden Standard
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-primary-foreground/80 mb-10 font-light">
            We source only the finest gemstones and precious metals, adhering to ethical standards 
            that protect both people and planet.
          </p>
          <Link href="/about">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-none px-10">
              Read Our Story
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
