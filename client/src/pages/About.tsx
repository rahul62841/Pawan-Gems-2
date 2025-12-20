import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-accent uppercase tracking-widest text-sm font-semibold">Our Heritage</span>
          <h1 className="font-display text-5xl lg:text-7xl font-bold text-primary">
            The Art of Refinement
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Founded on the principles of integrity, beauty, and precision, Pawan Gems has been 
            crafting heirlooms for the discerning few for over three decades.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
             {/* craftsman working on jewelry */}
             <img 
              src="https://pixabay.com/get/g7d0d100ab2ca25f6274a11bdbbc68b499b25368810049d7825ec17d5cb6bcc1f883655146e9fddccdd47f17e98dc00818e47b10b17218c537d254ec6257ed712_1280.jpg" 
              alt="Craftsman at work" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold text-primary">Master Craftsmanship</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every piece that leaves our atelier is a testament to the skill and dedication of our 
              master jewelers. We combine traditional techniques passed down through generations 
              with modern precision technology to create jewelry of unparalleled quality.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that true luxury lies in the details—the perfectly cut facet, the 
              seamless setting, and the weight of gold that feels just right against the skin.
            </p>
            <div className="pt-4">
              <Link href="/contact">
                <Button variant="outline" size="lg" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
