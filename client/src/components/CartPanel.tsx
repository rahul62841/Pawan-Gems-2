import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

// The use-cart hook declares CartItem internally but doesn't export it.
// Define a local CartItem type here to match the shape used by this component.
interface CartItem {
  product: {
    id: number;
    imageUrl: string;
    name: string;
    category?: string;
    price: number; // price in cents
  };
  quantity: number;
}
import { useToast } from "@/hooks/use-toast";

interface CartPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  total: number;
}

export function CartPanel({
  isOpen,
  onOpenChange,
  cartItems,
  onUpdateQuantity,
  onRemove,
  total,
}: CartPanelProps) {
  const { clearCart } = useCart();
  const { toast } = useToast();

  async function handleRequestPurchase() {
    try {
      const items = cartItems.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
      }));
      for (const it of items) {
        await fetch("/api/order-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: it.productId,
            quantity: it.quantity,
            message: "Customer purchase request",
          }),
        });
      }
      toast({
        title: "Request sent",
        description: "Your purchase request was sent to admin.",
      });
      clearCart();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not send request" });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 border-b pb-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.product.category}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(item.product.price / 100)}{" "}
                    each
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(
                          item.product.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 h-8"
                    />
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive/80" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="flex flex-col gap-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(total / 100)}
              </span>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => handleRequestPurchase()}
            >
              Request Purchase
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
