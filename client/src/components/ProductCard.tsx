import { Product } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const priceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(product.price / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className={cn("group", className)}>
      <Link href={`/product/${product.id}`} className="cursor-pointer block">
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
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100 z-20"
              data-testid="button-add-to-cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 text-center">
            <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              {product.category}
            </p>
            <p className="font-semibold text-primary mt-2">{priceFormatted}</p>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
