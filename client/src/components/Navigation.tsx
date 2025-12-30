import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchDialog } from "./SearchDialog";
import { CartPanel } from "./CartPanel";
import { useCart } from "@/hooks/use-cart";
import useUserStore from "@/store/useUserStore";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    cartItems,
    isOpen: cartOpen,
    setIsOpen: setCartOpen,
    removeFromCart,
    updateQuantity,
    total,
    itemCount,
  } = useCart();
  const user = useUserStore((s) => s.user);

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Collections" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors">
              <Menu className="w-6 h-6 text-foreground" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className="text-2xl font-display cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Links - Left */}
          <div className="hidden lg:flex items-center gap-8">
            {links.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide hover:text-primary transition-colors uppercase",
                  location === link.href
                    ? "text-primary font-bold"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo - Center */}
          <div className="flex-1 lg:flex-none flex justify-center">
            <Link
              href="/"
              className="font-display text-2xl lg:text-3xl font-bold tracking-tighter text-primary"
            >
              PAWAN GEMS
            </Link>
          </div>

          {/* Desktop Links - Right */}
          <div className="hidden lg:flex items-center gap-8">
            {links.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide hover:text-primary transition-colors uppercase",
                  location === link.href
                    ? "text-primary font-bold"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 lg:ml-8">
            <Link
              href={user ? "/profile" : "/login"}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium"
            >
              {user ? user.name : "Login"}
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              data-testid="button-search"
            >
              <Search className="w-5 h-5 text-foreground/80" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 hover:bg-secondary rounded-full transition-colors relative"
              data-testid="button-cart"
            >
              <ShoppingBag className="w-5 h-5 text-foreground/80" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartPanel
        isOpen={cartOpen}
        onOpenChange={setCartOpen}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={total}
      />
    </>
  );
}
