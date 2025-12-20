import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-primary-foreground/10 pb-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="font-display text-3xl font-bold tracking-tight">PAWAN GEMS</h2>
            <p className="text-primary-foreground/70 max-w-sm leading-relaxed">
              Exquisite jewelry crafted for the modern connoisseur. 
              Timeless elegance meets contemporary precision.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="font-display text-lg font-medium mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Collections', 'New Arrivals', 'Bespoke', 'Gifts'].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-primary-foreground/70 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-display text-lg font-medium mb-6">Customer Care</h4>
            <ul className="space-y-4">
              {['Contact Us', 'Shipping & Returns', 'Size Guide', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="/contact" className="text-primary-foreground/70 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} Pawan Gems. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
