import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Twitter, Linkedin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImage from "@/assets/logo.png";

export function Footer() {
  const { isAuthenticated } = useAuth();

  const quickLinks = isAuthenticated
    ? [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Flowers", path: "/flowers" },
        { label: "Pots", path: "/pots" },
        { label: "Guidelines", path: "/guidelines" },
        { label: "Contact Us", path: "/contact" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Contact Us", path: "/contact" },
      ];

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !agreed) {
      toast.error("Please enter your email and agree to subscribe.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("newsletter_subscribers" as any).insert({ email: newsletterEmail } as any);
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }
    toast.success("Successfully subscribed! 🎉");
    setNewsletterEmail("");
    setAgreed(false);
  };

  return (
    <footer>
      {/* Newsletter - Hidden for now*/}
      {/*}<section className="section-dark py-16">
        <div className="container text-center max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[hsl(0_0%_100%)] mb-3">
            Everything You Need to Know About Plants and More. No Spam, We Promise.
          </h2>
          <p className="text-sm text-[hsl(0_0%_100%_/_0.6)] mb-6">
            Subscribe now and get 15% off your first purchase
          </p>
          <form className="max-w-md mx-auto space-y-3" onSubmit={handleNewsletter}>
            <div>
              <label className="text-xs text-[hsl(0_0%_100%_/_0.6)] block text-left mb-1">Enter your email here *</label>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-transparent border border-[hsl(0_0%_100%_/_0.3)] rounded-sm px-3 py-2 text-sm text-[hsl(0_0%_100%)] placeholder:text-[hsl(0_0%_100%_/_0.4)]"
                placeholder="e.g. plantlover@email.com"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-[hsl(0_0%_100%_/_0.6)]">
                <input type="checkbox" className="accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                Yes, subscribe me to your newsletter. *
              </label>
              <button type="submit" disabled={submitting} className="btn-plum rounded-sm text-xs px-6 py-2 disabled:opacity-50">
                {submitting ? "..." : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      </section>*/}

      {/* Main footer */}
      <div className="section-dark border-t border-[hsl(0_0%_100%_/_0.1)]">
        <div className="container py-12">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoImage} alt="Infinity Floral" className="h-16 object-contain" />
              {/*<div className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold tracking-wider uppercase text-[hsl(0_0%_100%)]">
                  Infinity
                </span>
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[hsl(0_0%_100%_/_0.6)]">
                  Floral
                </span>
              </div>*/}
            </Link>
          </div>

          <div className="border-t border-[hsl(0_0%_100%_/_0.1)] pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            {/* Contact Details */}
            <div>
              <h4 className="font-display text-sm font-semibold text-[hsl(0_0%_100%)] mb-4">Contact Details</h4>
              <ul className="space-y-2 text-[hsl(0_0%_100%_/_0.6)]">
                <li>(+1) 234 567 890</li>
                <li>info@email.com</li>
                <li>913 Willow St S Nelson, BC V1L 7C5Canada</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm font-semibold text-[hsl(0_0%_100%)] mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="text-[hsl(0_0%_100%_/_0.6)] hover:text-[hsl(0_0%_100%)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display text-sm font-semibold text-[hsl(0_0%_100%)] mb-4">Support</h4>
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
                      className="text-[hsl(0_0%_100%_/_0.6)] hover:text-[hsl(0_0%_100%)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-display text-sm font-semibold text-[hsl(0_0%_100%)] mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Twitter, label: "X" },
                  { Icon: Youtube, label: "YouTube" },
                  { Icon: Linkedin, label: "LinkedIn" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="h-9 w-9 rounded-full bg-[hsl(0_0%_100%_/_0.1)] flex items-center justify-center text-[hsl(0_0%_100%_/_0.7)] hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={`Follow us on ${label}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[hsl(0_0%_100%_/_0.1)] text-center text-xs text-[hsl(0_0%_100%_/_0.4)]">
            © Copyright 2026 - Infinity Floral Grower. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
