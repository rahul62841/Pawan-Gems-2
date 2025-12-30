import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { Link } from "wouter";
import { Search as SearchIcon } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const { data: allProducts } = useProducts();

  const results = query.trim()
    ? allProducts?.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      ) || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, category..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {query.trim() && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.length > 0 ? (
                results.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full text-left p-3 rounded-md hover:bg-secondary transition-colors border border-border"
                    >
                      <div className="flex gap-3 items-start">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(product.price / 100)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No products found matching "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
