import { Product } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price / 100);

  return (
    <Link href={`/product/${product.id}`} className={cn("group cursor-pointer block", className)}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary mb-4">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-widest font-bold z-20">
              Featured
            </div>
          )}
        </div>
        
        <div className="space-y-1 text-center">
          <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            {product.category}
          </p>
          <p className="font-semibold text-primary mt-2">
            {priceFormatted}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
