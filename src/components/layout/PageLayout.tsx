import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import heroImage from "@/assets/about-hero.jpg";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export function HeroBanner({ title, subtitle, image }: HeroBannerProps) {
  return (
    <section className="relative">
      <div className="aspect-[16/5] md:aspect-[16/4] w-full overflow-hidden max-h-[280px]">
        <img
          src={image || heroImage}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(0_0%_0%_/_0.5)]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="font-display text-[46px] font-bold text-[hsl(0_0%_100%)] mb-2 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[hsl(0_0%_100%_/_0.7)] max-w-lg mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function PageLayout({
  children,
  title,
  subtitle,
  heroImage: img,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  heroImage?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <HeroBanner title={title} subtitle={subtitle} image={img} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
