import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  isProductsUnlocked,
  unlockProducts,
  verifyProductsPassword,
  PRODUCTS_CONTACT_EMAIL,
} from "@/lib/products-access";
import { COMPANY_NAME } from "@/lib/brand";

interface ProductsPasswordGateProps {
  children: ReactNode;
  /** When true, wrap the lock screen with site navbar/footer (product detail). */
  withChrome?: boolean;
}

export function ProductsPasswordGate({ children, withChrome = false }: ProductsPasswordGateProps) {
  const [unlocked, setUnlocked] = useState(() => isProductsUnlocked());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  const mailtoHref = `mailto:${PRODUCTS_CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Request for product catalog password"
  )}&body=${encodeURIComponent(
    `Hello ${COMPANY_NAME},\n\nI would like access to your product catalog. Please send me the password.\n\nThank you.`
  )}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyProductsPassword(password)) {
      unlockProducts();
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect password. Please try again or request access by email.");
  };

  const panel = (
    <div className="min-h-[70vh] relative flex items-center justify-center px-4 py-16">
      <div
        className="absolute inset-0 bg-background"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, hsl(var(--primary) / 0.08), transparent 55%), linear-gradient(180deg, hsl(var(--muted) / 0.45), hsl(var(--background)))",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-password-title"
        className="relative z-10 w-full max-w-md border border-border/60 bg-background/95 p-8 shadow-sm backdrop-blur-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-5 w-5" aria-hidden />
          </div>
          <h1
            id="catalog-password-title"
            className="font-display text-2xl md:text-3xl text-primary mb-2"
          >
            Catalog Access
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Our product catalog is available to wholesale partners. Enter the password you received
            from us to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="catalog-password" className="sr-only">
              Catalog password
            </label>
            <Input
              id="catalog-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter catalog password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              className="rounded-sm h-11"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <button type="submit" className="btn-plum w-full rounded-sm text-sm">
            View Catalog
          </button>
        </form>

        <div className="mt-6 border-t border-border/50 pt-5 text-center space-y-3">
          <p className="text-xs text-muted-foreground">Don&apos;t have the password?</p>
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Email us for access
          </a>
          <div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (withChrome) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">{panel}</main>
        <Footer />
      </div>
    );
  }

  return panel;
}
