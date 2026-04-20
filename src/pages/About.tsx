import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Leaf, Award, Truck, HeartHandshake, Eye, Target, Sprout } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import aboutWho from "@/assets/about-whoweare.jpg";
import aboutWhat from "@/assets/about-whatwedo.jpg";
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
  { icon: Leaf, title: "Controlled Greenhouse Growing Conditions" },
  { icon: Award, title: "Strict Quality Checks At Every Stage" },
  { icon: Truck, title: "Professional Handling And Packaging" },
  { icon: HeartHandshake, title: "Orchids Grown For Long Shelf Life" },
];

const whatWeDo = [
  "Showcase a wide range of flowers and gardening pots in wholesale units",
  "Organize products into clear categories and subcategories",
  "Provide detailed product specifications and availability information",
  "Offer customizable product catalogs for better purchasing decisions",
  "Deliver educational gardening content through our Gardening Guidelines section",
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
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(0_0%_100%)] mb-2">About Us</h1>
            <p className="text-sm text-[hsl(0_0%_100%_/_0.7)] max-w-lg mx-auto">
              We are a dedicated orchid grower supplying high-quality, consistent orchids to wholesalers, florists, and distributors.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="overflow-hidden rounded-lg">
              <img src={aboutWho} alt="Who we are" className="w-full h-auto object-cover" loading="lazy" />
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Who We Are</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Infinity Floral Grower is a U.S.-based orchid grower delivering premium-quality orchids for the wholesale market, grown with care and consistency.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Infinity Floral Grower is a wholesale orchid grower based in the United States, specializing in premium-quality orchids crafted for the wholesale market. We focus on consistency, care, and long-lasting blooms grown in a controlled environment.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our goal is to bridge the gap between suppliers and bulk purchasers through a streamlined, informative, and easy-to-navigate platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Quality Consistency */}
      <section className="section-dark py-14">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[hsl(0_0%_100%)] mb-2">
            Care, Quality, and Consistency
          </h2>
          <p className="text-sm text-[hsl(0_0%_100%_/_0.6)] mb-10 max-w-xl mx-auto">
            Infinity Floral Grower is a premium orchid grower based in the United States, specializing in premium-quality orchids crafted for the wholesale market. We focus on consistency, care.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full border border-[hsl(0_0%_100%_/_0.2)] flex items-center justify-center">
                  <v.icon className="h-6 w-6 text-[hsl(0_0%_100%_/_0.8)]" />
                </div>
                <p className="text-xs md:text-sm text-[hsl(0_0%_100%_/_0.8)] leading-snug max-w-[160px]">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">What We Do</h2>
              <ul className="space-y-2">
                {whatWeDo.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed">
                At the current time, we don't handle offline. Our platform serves as a source of the necessary information to assist customers confident before contacting our team.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg">
              <img src={aboutWhat} alt="What we do" className="w-full h-auto object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border border-border rounded-lg p-6 text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Our Vision</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To become a trusted digital hub for wholesale gardening products, combining product discovery with expert knowledge to support business growth in the horticulture industry.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Our Mission</h3>
              <ul className="text-xs text-muted-foreground leading-relaxed text-left space-y-1">
                <li>To simplify bulk product exploration</li>
                <li>To enhance decision-making through organized product listings</li>
                <li>To provide valuable gardening knowledge alongside product listings</li>
                <li>To build long-term relationships with business clients</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Let's Grow Together */}
      <section className="py-12 text-center">
        <div className="container max-w-xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Let's Grow Together <Sprout className="inline h-6 w-6 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            We believe in building lasting partnerships rooted in trust, quality, and shared growth. Whether you're expanding your retail inventory or managing large-scale landscaping projects, Garden Cart is here to support your journey.
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
