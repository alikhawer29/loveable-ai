import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Twitter, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImage from "@/assets/logo.png";
import newsletterBg from "@/assets/hero-greenhouse.jpg";

const quickLinksLeft = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Wholesale", path: "/about" },
  { label: "Blogs", path: "/blogs" },
  { label: "Products", path: "/products" },
];

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail?.trim() || !agreed) {
      toast.error("Please enter your email and agree to subscribe.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("newsletter_subscribers" as any).insert({ email: newsletterEmail.trim() } as any);
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }
    toast.success("Successfully subscribed!");
    setNewsletterEmail("");
    setAgreed(false);
  };

  return (
    <footer className="bg-background">
      {/* Newsletter — above main footer (Figma) */}
      <section className="relative overflow-hidden">
        <img
          src={newsletterBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(25_15%_8%_/_0.88)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-20">
          {/* Wider than form so 46px heading fits on one line + second line = 2 lines total (not 3) */}
          <h2 className="font-forum text-2xl font-normal leading-tight text-balance text-white md:text-3xl lg:text-[46px]">
            <span className="block">Everything You Need to Know About Plants and More.</span>
            <span className="mt-2 block md:mt-2.5">No Spam, We Promise.</span>
          </h2>
          {/* <p className="mt-3 text-sm text-white/70 md:mt-4">Subscribe now and get 15% off your first purchase</p> */}
          <form onSubmit={handleNewsletter} className="mx-auto mt-8 max-w-2xl text-left">
            <label htmlFor="footer-newsletter-email" className="mb-1.5 block text-left text-xs text-white/80">
              Enter your email here *
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full rounded border border-white/40 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40"
              placeholder="e.g. plantlover@email.com"
              required
            />
            <div className="mt-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="flex cursor-pointer items-start gap-2.5 text-left text-xs text-white/80 sm:max-w-[55%]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border border-white/80 bg-transparent text-[#b19a55] focus:ring-white/40"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>Yes, subscribe me to your newsletter. *</span>
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full shrink-0 rounded-sm px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:ml-4 sm:w-auto"
                style={{ backgroundColor: "#b19a55" }}
              >
                {submitting ? "…" : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="border-t border-border bg-white">
        <div className="container py-12 md:pt-10 md:pb-6">
          {/* Logo — height 100px, width auto */}
          <div className="mb-10 flex justify-center">
            <Link to="/" className="inline-block" aria-label="Infinity Floral Grower home">
              <img
                src={logoImage}
                alt="Infinity Floral Grower"
                className="h-[100px] w-auto max-w-full object-contain"
              />
            </Link>
          </div>

          <div className="border-t border-border" />

          <div className="grid grid-cols-1 gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 text-sm">
            {/* Contact Details */}
            <div>
              <h4 className="font-display mb-4 text-sm font-semibold text-primary">Contact Details</h4>
              <ul className="space-y-2 text-foreground/80">
                <li>854-692-7227</li>
                <li>
                  <a href="mailto:infinityfloralgrower@gmail.com" className="hover:text-primary transition-colors">
                    infinityfloralgrower@gmail.com
                  </a>
                </li>
                <li className="leading-relaxed">2809 W Kelly Park Road Apopka, FL 32713</li>
              </ul>
            </div>

            {/* Quick Links — two sub-columns */}
            <div>
              <h4 className="font-display mb-4 text-sm font-semibold text-primary">Quick Links</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <ul className="space-y-2">
                  {quickLinksLeft.map((link) => (
                    <li key={link.path + link.label}>
                      <Link to={link.path} className="text-foreground/80 transition-colors hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* <ul className="space-y-2">
                  {quickLinksRight.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-foreground/80 transition-colors hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul> */}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display mb-4 text-sm font-semibold text-primary">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: "FAQ's", path: "/faqs" },
                  { label: "Contact", path: "/contact" },
                  { label: "Privacy Policy", path: "/privacy-policy" },
                  { label: "Terms & Conditions", path: "/terms" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us — brand-colored circles */}
            {/* <div>
              <h4 className="font-display mb-4 text-sm font-semibold text-primary">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-90"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9BF0] text-white transition-opacity hover:opacity-90"
                  aria-label="Follow us on X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF0000] text-white transition-opacity hover:opacity-90"
                  aria-label="Follow us on YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A66C2] text-white transition-opacity hover:opacity-90"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div> */}
          </div>

          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-foreground/60">
            © Copyright 2026 - Infinity Floral Grower. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
