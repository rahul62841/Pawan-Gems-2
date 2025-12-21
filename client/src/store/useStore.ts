import create from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isOpen: false,
      setIsOpen: (open: boolean) => set({ isOpen: open }),
      addToCart: (product: Product) =>
        set((state) => {
          const existing = state.cartItems.find(
            (i) => i.product.id === product.id
          );
          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cartItems: [...state.cartItems, { product, quantity: 1 }] };
        }),
      removeFromCart: (productId: number) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.product.id !== productId),
        })),
      updateQuantity: (productId: number, quantity: number) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cartItems: state.cartItems.filter(
                (i) => i.product.id !== productId
              ),
            };
          }
          return {
            cartItems: state.cartItems.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        }),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "pawan_gems_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
