import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Trip Packer — Pack smarter, stress less";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Plan trips, organize luggage, and track packed, unpacked, and to-buy items.");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background">
      <section className="container px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Trip Packer
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Plan your trips, organize luggage, and breeze through packing with clear statuses and a delightful workflow.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/trips">Get started</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/learn-more">Learn more</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;
