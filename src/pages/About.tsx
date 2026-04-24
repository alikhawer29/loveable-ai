import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Droplets, ListChecks, Package, Leaf, Sprout } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import ourVisionIcon from "@/assets/our-vision.png";
import ourMissionIcon from "@/assets/our-mission.png";
import aboutWho from "@/assets/about-whoweare.jpg";
import aboutWhat from "@/assets/about-whatwedo.png";
import sproutLiving from "@/assets/sprout-living.jpg";
import sproutShelf from "@/assets/sprout-shelf.jpg";
import sproutRepotting from "@/assets/sprout-repotting.jpg";
import sproutCollection from "@/assets/sprout-collection.jpg";
import orchidPurple from "@/assets/orchid-purple.jpg";
import orchidPink from "@/assets/orchid-pink.jpg";
import orchidYellow from "@/assets/orchid-yellow.jpg";
import orchidWhite from "@/assets/orchid-white.jpg";
import careArrangement from "@/assets/care-arrangement.jpg";

const values = [
  { icon: Droplets, title: "Controlled Greenhouse Growing Conditions" },
  { icon: ListChecks, title: "Total Quality Checks At Every Stage" },
  { icon: Package, title: "Professional Handling & Packaging" },
  { icon: Leaf, title: "Grade-A Greens For Long Shelf Life" },
];

const instagramImages = [orchidPurple, orchidPink, sproutLiving, orchidYellow, sproutRepotting, orchidWhite];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="aspect-[16/5] md:aspect-[16/4] w-full overflow-hidden max-h-[280px]">
          <img src={aboutHero} alt="About Us" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[hsl(0_0%_0%_/_0.5)]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-[46px] font-bold text-[hsl(0_0%_100%)] mb-2 leading-tight">About Us</h1>
            <p className="text-sm text-[hsl(0_0%_100%_/_0.7)] max-w-lg mx-auto">
              We are a dedicated orchid grower supplying high-quality, consistent orchids to wholesalers, florists, and distributors.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are (client copy) */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
            <div className="overflow-hidden rounded-lg">
              <img
                src={aboutWho}
                alt="Infinity Floral Grower team and growing operations"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="max-w-prose space-y-4 md:space-y-5">
              <h2 className="font-display text-[46px] leading-tight text-foreground">A FAMILY BUSINESS</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Infinity Floral Grower operates under its parent company, United Orchids, established in 1999, and does
                business as United Florida Orchids.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built on decades of experience in orchid cultivation, the business was founded with a clear vision—to
                produce high-quality orchids through dedication, consistency, and hands-on expertise.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As a family-owned and operated company, our values are rooted in long-term relationships, integrity, and
                pride in every plant we grow.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Over the years, Infinity Floral Grower has expanded while maintaining the same commitment to excellence,
                supplying premium orchids to florists, designers, and retailers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Quality Consistency — light + gold (Figma) */}
      <section className="bg-[#AE9644]/25 py-14 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl text-black md:text-[46px] mb-3">
            Care, Quality and Consistency
          </h2>
          <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Infinity Floral Grower is a premium orchid grower based in the United States, specializing in premium-quality orchids crafted for the wholesale market. We focus on consistency, care.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#AE9644]/25 shadow-sm">
                  <v.icon className="h-7 w-7 text-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-foreground/90 sm:text-sm leading-snug max-w-[200px] mx-auto">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium quality (client copy — structured for scan & readability) */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
            <div className="space-y-5 order-2 md:order-1">
              <h2 className="font-display text-[46px] leading-tight text-foreground">PREMIUM QUALITY</h2>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Competitive pricing · Family owned &amp; operated · Greenhouse growers · A growing business
              </p>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Based in Florida, Infinity Floral Grower benefits from an ideal growing environment that supports
                  strong, vibrant orchids year-round. Our greenhouse operations are designed for consistency and
                  efficiency, allowing us to maintain high standards across all products.
                </p>
                <p>
                  From our beginnings to today, we continue to grow our capacity and refine our practices, with a
                  long-term focus on delivering reliable, high-quality orchids to the market.
                </p>
                <p>
                  Infinity Floral Grower has earned the trust of our partners for over 20 years by consistently
                  providing high-quality orchids and foliage products, and remains focused on the future with continued
                  innovation and new product development.
                </p>
              </div>
            </div>
            <div className="order-1 overflow-hidden rounded-lg md:order-2">
              <img
                src={aboutWhat}
                alt="Greenhouse and growing operations"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission — Figma icon assets */}
      {/* <section className="py-12 md:py-16">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="rounded-xl border border-[#AE9644]/25 bg-[#AE9644]/25 p-8 text-left shadow-sm">
              <div className="mb-5">
                <img
                  src={ourVisionIcon}
                  alt=""
                  height={85}
                  className="h-[85px] w-auto max-w-full object-left object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="font-display text-xl text-black md:text-2xl">Our Vision</h3>
              <p className="mt-3 text-sm text-[hsl(0_0%_25%)] leading-relaxed">
                To become a trusted digital hub for wholesale gardening products, combining product discovery with
                expert knowledge to support business growth in the horticulture industry.
              </p>
            </div>
            <div className="rounded-xl border border-[#AE9644]/25 bg-[#AE9644]/25 p-8 text-left shadow-sm">
              <div className="mb-5">
                <img
                  src={ourMissionIcon}
                  alt=""
                  height={85}
                  className="h-[85px] w-auto max-w-full object-left object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="font-display text-xl text-black md:text-2xl">Our Mission</h3>
              <ul className="mt-3 space-y-2 text-sm text-[hsl(0_0%_25%)] leading-relaxed">
                <li>To simplify bulk product exploration</li>
                <li>To enhance decision-making through organized product presentation</li>
                <li>To provide valuable gardening knowledge alongside product listings</li>
                <li>To build long-term relationships with business clients</li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}

      {/* Let's Grow Together */}
      <section className="py-12 text-center">
        <div className="container max-w-xl">
          <h2 className="font-display text-[46px] text-foreground mb-3">
            Thank you<Sprout className="inline h-8 w-8 align-middle text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Thank you for choosing Infinity Floral Grower.
          </p>
          <Link to="/collections" className="btn-plum rounded-sm text-xs uppercase tracking-wider">
            View All Products
          </Link>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="section-dark py-12">
        <div className="container">
          <h2 className="font-display text-xl md:text-2xl font-bold text-[hsl(0_0%_100%)] text-center mb-6">
            Sprout on the #Infinity Floral Grower
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {instagramImages.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-md">
                <img src={img} alt={`Instagram post ${i + 1}`} className="h-full w-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
