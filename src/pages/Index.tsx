import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, Award, Truck, HeartHandshake } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

import heroImage from "@/assets/hero-greenhouse.jpg";
import welcomeImage from "@/assets/welcome-florist.jpg";
import sproutLiving from "@/assets/sprout-living.jpg";
import sproutShelf from "@/assets/sprout-shelf.jpg";
import sproutRepotting from "@/assets/sprout-repotting.jpg";
import sproutCollection from "@/assets/sprout-collection.jpg";
import seedToSprout from "@/assets/seed-to-sprout.jpg";
import careArrangement from "@/assets/care-arrangement.jpg";
import orchidPurple from "@/assets/orchid-purple.jpg";
import orchidPink from "@/assets/orchid-pink.jpg";
import orchidYellow from "@/assets/orchid-yellow.jpg";
import orchidWhite from "@/assets/orchid-white.jpg";

const PLACEHOLDER = "/placeholder.svg";

const values = [
  { icon: Leaf, title: "Carefully Cultivated Growing Conditions" },
  { icon: Award, title: "Strict quality checks at every stage" },
  { icon: Truck, title: "Nationwide Fast, Easy And Shipping" },
  { icon: HeartHandshake, title: "Dedicated Customer Service Care" },
];

const instagramImages = [orchidPurple, orchidPink, sproutLiving, orchidYellow, sproutRepotting, orchidWhite];

function useAuthLink() {
  const { isAuthenticated } = useAuth();
  return (authPath: string) => (isAuthenticated ? authPath : "/login");
}

interface HomeProduct {
  name: string;
  image: string;
  slug: string;
}

interface HomeArticle {
  id: string;
  title: string;
  image: string;
  excerpt: string;
}

const Index = () => {
  const { isAuthenticated } = useAuth();
  const authLink = useAuthLink();
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [careArticles, setCareArticles] = useState<HomeArticle[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: prods } = await supabase
          .from("products")
          .select("id, product_name, created_at")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4);

        const ids = (prods || []).map((p) => p.id);
        let imageMap: Record<string, string> = {};
        if (ids.length > 0) {
          const { data: imgs } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", ids);
          (imgs || []).forEach((img) => {
            if (!imageMap[img.product_id]) imageMap[img.product_id] = img.image_url;
          });
        }

        setProducts(
          (prods || []).map((p) => ({
            name: p.product_name,
            image: imageMap[p.id] || PLACEHOLDER,
            slug: p.product_name.toLowerCase().replace(/\s+/g, "-"),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchArticles = async () => {
      try {
        const { data } = await supabase
          .from("guidelines_articles")
          .select("id, title, image_url, content")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(3);

        setCareArticles(
          (data || []).map((a) => ({
            id: a.id,
            title: a.title,
            image: a.image_url || PLACEHOLDER,
            excerpt: a.content?.slice(0, 100) || "Discover helpful tips and advice...",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchProducts();
    fetchArticles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ========== HERO ========== */}
      <section className="relative">
        <div className="aspect-[16/7] md:aspect-[16/6] w-full overflow-hidden">
          <img src={heroImage} alt="Premium orchids in greenhouse" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0_0%_0%_/_0.65)] via-[hsl(0_0%_0%_/_0.3)] to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(0_0%_100%)] leading-tight mb-4">
              Premium Orchids Grown for Wholesale Excellence
            </h1>
            <p className="text-sm md:text-base text-[hsl(0_0%_100%_/_0.8)] max-w-lg mx-auto mb-6">
              We meticulously cultivate premium-quality orchids for growers, retailers, and event designers.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={authLink("/flowers")} className="btn-outline-light rounded-sm">
                View Our Orchids
              </Link>
              <Link to={authLink("/guidelines")} className="btn-plum rounded-sm">
                Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WELCOME ========== */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="overflow-hidden rounded-lg">
              <img src={welcomeImage} alt="Florist arranging orchids" className="w-full h-auto object-cover" loading="lazy" />
            </div>
            <div className="space-y-5">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Welcome to <em className="italic">Infinity</em>
                <br />
                Floral Grower
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Infinity Floral Grower is the nation's premier grower of orchids, developing and cultivating the most
                desirable orchid varieties for every occasion.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Our 60-acre facility in south Florida is home to more than 2 million orchids, and we ship over 8 million
                stems annually to customers around the globe. Let flowers speak for you — order a complimentary product
                quote in just minutes!
              </p>
              <Link to="/about" className="btn-plum rounded-sm text-sm mt-2 inline-block">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CARE QUALITY CONSISTENCY ========== */}
      <section className="section-dark py-14 opacity-100 bg-[#d8acd8]">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[hsl(0_0%_100%)] mb-2 text-secondary-foreground opacity-100">
            Care, Quality, and Consistency
          </h2>
          <p className="text-sm text-[hsl(0_0%_100%_/_0.6)] mb-10 max-w-xl mx-auto text-secondary-foreground">
            Infinity Floral Grower is a professional orchid grower based in the United States, specializing in premium-quality orchids for the wholesale market. We focus on consistency, care.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full border border-[hsl(0_0%_100%_/_0.2)] flex items-center justify-center bg-primary">
                  <v.icon className="h-6 w-6 text-[hsl(0_0%_100%_/_0.8)]" />
                </div>
                <p className="text-xs md:text-sm text-[hsl(0_0%_100%_/_0.8)] leading-snug max-w-[140px] text-secondary-foreground">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== MOST POPULAR PRODUCTS ========== */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Most Popular Products</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                Infinity Floral grows a wide selection of premium orchids to bring you the most incredible quality on
                the wholesale market. We focus on quality and consistency.
              </p>
            </div>
            <Link to={authLink("/flowers")} className="hidden md:inline-flex btn-plum rounded-sm text-xs">
              View All Products →
            </Link>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mx-auto mb-2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.slug}
                  className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-elevated transition-shadow"
                >
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 md:p-4 text-center space-y-1.5">
                    <h3 className="font-display text-sm md:text-base font-semibold text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <Link
                      to={authLink(`/flowers/${product.slug}`)}
                      className="btn-dark rounded-sm text-xs w-full py-2 mt-1 inline-block text-center"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="md:hidden mt-6 text-center">
            <Link to={authLink("/flowers")} className="btn-plum rounded-sm text-xs">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ========== DISCOVER SPROUT ========== */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Discover Sprout</h2>
            <div className="hidden md:block flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-lg">
              <img src={sproutLiving} alt="Plants in living room" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={sproutShelf} alt="Plants on shelf" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={sproutRepotting} alt="Repotting plants" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={sproutCollection} alt="Plant collection" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={careArrangement} alt="Plant arrangement" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ========== FROM SEED TO SPROUT ========== */}
      <section className="relative">
        <div className="aspect-[16/5] md:aspect-[16/4] w-full overflow-hidden">
          <img src={seedToSprout} alt="Young plant sprout" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[hsl(0_0%_0%_/_0.6)]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(0_0%_100%)] mb-3">
              From Seed to Sprout
            </h2>
            <p className="text-sm text-[hsl(0_0%_100%_/_0.7)] mb-6 max-w-md mx-auto leading-relaxed">
              Discover our growing process — from carefully selected seeds to the thriving plants that arrive at your
              door. Each orchid represents months of dedicated care and expertise.
            </p>
            <Link to="/about" className="btn-outline-light rounded-sm text-sm">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ========== PLANT CARE GUIDE ========== */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Your Guide to Plant Care</h2>
            <Link to={authLink("/guidelines")} className="hidden md:inline-flex btn-plum rounded-sm text-xs">
              View All →
            </Link>
          </div>
          {loadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] rounded-lg mb-4" />
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : careArticles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No care guides published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careArticles.map((article) => (
                <Link key={article.id} to={authLink(`/blog/${article.id}`)} className="group">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-display text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== INSTAGRAM GALLERY ========== */}
      <section className="py-12 bg-secondary">
        <div className="container">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-6">
            Sprout on the #InfinityFloralGrower
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {instagramImages.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-md">
                <img
                  src={img}
                  alt={`Instagram post ${i + 1}`}
                  className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
