import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect, useMemo } from "react";
import { resolveGalleryImages } from "@/lib/product-color-variants";

interface RelatedItem {
  id: string;
  name: string;
  image: string;
  isNew?: boolean;
  detailPath: string;
}

export interface ProductColorOption {
  hex: string;
  label: string;
  images: string[];
}

interface ProductDetailLayoutProps {
  name: string;
  description: string;
  additionalDescription?: string;
  stock: number;
  images: string[];
  fallbackImages?: string[];
  colorVariations?: ProductColorOption[];
  showColorSwatches?: boolean;
  relatedTitle: string;
  relatedItems: RelatedItem[];
  backPath: string;
}

export function ProductDetailLayout({
  name,
  description,
  additionalDescription,
  stock,
  images,
  fallbackImages = [],
  colorVariations = [],
  showColorSwatches = false,
  relatedTitle,
  relatedItems,
  backPath,
}: ProductDetailLayoutProps) {
  const navigate = useNavigate();
  const fallback = fallbackImages.length > 0 ? fallbackImages : images;

  const defaultHex = useMemo(
    () => colorVariations[0]?.hex ?? "",
    [colorVariations]
  );

  const [selectedColorHex, setSelectedColorHex] = useState(defaultHex);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setSelectedColorHex(defaultHex);
    setSelectedImage(0);
  }, [defaultHex, name]);

  const activeVariant = colorVariations.find((v) => v.hex === selectedColorHex);
  const displayImages = useMemo(() => {
    if (showColorSwatches && activeVariant) {
      return resolveGalleryImages(activeVariant.images, fallback);
    }
    return resolveGalleryImages(images, fallback);
  }, [showColorSwatches, activeVariant, images, fallback]);

  const colorLabel = activeVariant?.label ?? "";

  const handleColorSelect = (hex: string) => {
    setSelectedColorHex(hex);
    setSelectedImage(0);
  };

  const isLightSwatch = (hex: string) => hex === "#ffffff" || hex === "#ede8d0";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-6 md:py-10">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-sm text-foreground mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-shrink-0">
                {displayImages.map((img, i) => (
                  <button
                    key={`${selectedColorHex}-${i}`}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"
                      }`}
                  >
                    <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                <img
                  src={displayImages[selectedImage]}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>


          </div>

          <div className="space-y-5">
            <h1 className="font-display text-[46px] text-foreground leading-tight">{name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            {additionalDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">{additionalDescription}</p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(142_71%_45%)]" />
                <span className="text-sm text-foreground">
                  In Stock: <strong>{stock} Units</strong>
                </span>
              </div>
              {showColorSwatches && colorVariations.length > 1 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-sm text-foreground">
                    Color: <strong>{colorLabel}</strong>
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorVariations.map((variant) => {
                      const active = selectedColorHex === variant.hex;
                      const light = isLightSwatch(variant.hex);
                      return (
                        <button
                          key={variant.hex}
                          type="button"
                          title={variant.label}
                          onClick={() => handleColorSelect(variant.hex)}
                          className={`h-9 w-9 rounded-full border-2 transition-all shrink-0 ${active
                              ? "ring-2 ring-offset-2 ring-foreground border-foreground"
                              : "border-border hover:border-foreground/50"
                            }`}
                          style={{
                            backgroundColor: variant.hex,
                            boxShadow: light ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : undefined,
                          }}
                          aria-label={`Color ${variant.label}`}
                          aria-pressed={active}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                854-692-7227
              </div>
              <Link
                to="/contact"
                className="btn-plum rounded-sm text-xs uppercase tracking-wider px-6"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
            {relatedTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedItems.map((item) => (
              <div key={item.id} className="group">
                <div className="aspect-square overflow-hidden rounded-lg mb-3 relative bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                  {item.name}
                </h3>
                <Link
                  to={item.detailPath}
                  className="block text-center text-xs border border-border rounded-sm py-2 hover:bg-muted transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
