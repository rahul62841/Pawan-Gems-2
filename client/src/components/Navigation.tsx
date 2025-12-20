import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Collections" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
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
            <Link key={link.href} href={link.href} className={cn(
              "text-sm font-medium tracking-wide hover:text-primary transition-colors uppercase",
              location === link.href ? "text-primary font-bold" : "text-foreground/80"
            )}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logo - Center */}
        <div className="flex-1 lg:flex-none flex justify-center">
          <Link href="/" className="font-display text-2xl lg:text-3xl font-bold tracking-tighter text-primary">
            PAWAN GEMS
          </Link>
        </div>

        {/* Desktop Links - Right */}
        <div className="hidden lg:flex items-center gap-8">
          {links.slice(2).map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "text-sm font-medium tracking-wide hover:text-primary transition-colors uppercase",
              location === link.href ? "text-primary font-bold" : "text-foreground/80"
            )}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:ml-8">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <Search className="w-5 h-5 text-foreground/80" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5 text-foreground/80" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </button>
        </div>
      </div>
    </nav>
  );
}
