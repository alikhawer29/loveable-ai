import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RelatedItem {
  id: string;
  name: string;
  image: string;
  isNew?: boolean;
  detailPath: string;
}

interface ProductDetailLayoutProps {
  name: string;
  description: string;
  additionalDescription?: string;
  stock: number;
  color: string;
  images: string[];
  relatedTitle: string;
  relatedItems: RelatedItem[];
  backPath: string;
}

export function ProductDetailLayout({
  name,
  description,
  additionalDescription,
  stock,
  color,
  images,
  relatedTitle,
  relatedItems,
  backPath,
}: ProductDetailLayoutProps) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-6 md:py-10">
        {/* Back */}
        <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-sm text-foreground mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Product detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Image gallery */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            {additionalDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">{additionalDescription}</p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(142_71%_45%)]" />
                <span className="text-sm text-foreground">In Stock: <strong>{stock} Units</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(142_71%_45%)]" />
                <span className="text-sm text-foreground">Color: <strong>{color}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                (+1) 234 567 890
              </div>
              <Link to="/contact" className="btn-plum rounded-sm text-xs uppercase tracking-wider px-6">
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Related items */}
        <section className="mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">{relatedTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedItems.map((item) => (
              <div key={item.id} className="group">
                <div className="aspect-square overflow-hidden rounded-lg mb-3 relative bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  {item.isNew && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-sm">New Arrival</Badge>
                  )}
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">{item.name}</h3>
                <Link to={item.detailPath} className="block text-center text-xs border border-border rounded-sm py-2 hover:bg-muted transition-colors">View Details</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
