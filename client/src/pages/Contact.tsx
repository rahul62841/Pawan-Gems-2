import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We will respond to your inquiry within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info */}
          <div className="space-y-12">
            <div>
              <h1 className="font-display text-5xl font-bold text-primary mb-6">Contact Us</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're looking for a bespoke engagement ring or have questions about 
                our collection, our concierge team is here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Flagship Boutique</h3>
                <p className="text-muted-foreground">
                  123 Luxury Avenue<br />
                  New York, NY 10012
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Hours</h3>
                <p className="text-muted-foreground">
                  Mon-Sat: 10am - 7pm<br />
                  Sun: By Appointment
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Contact</h3>
                <p className="text-muted-foreground">
                  concierge@pawangems.com<br />
                  +1 (212) 555-0199
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-secondary/20 p-8 lg:p-12 rounded-lg border border-border">
            <h2 className="font-display text-2xl font-bold mb-6">Send an Inquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required className="bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required className="min-h-[150px] bg-white" placeholder="Tell us about what you're looking for..." />
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Message
              </Button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
