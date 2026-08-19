import { useState, type FormEvent, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY_NAME } from "@/lib/brand";
import {
  grantCatalogAccess,
  hasCatalogAccess,
  verifyCatalogPassword,
} from "@/lib/catalog-access";

const REQUEST_EMAIL = "infinityfloralgrower@gmail.com";

interface CatalogPasswordGateProps {
  children: ReactNode;
  withChrome?: boolean;
}

export function CatalogPasswordGate({ children, withChrome = false }: CatalogPasswordGateProps) {
  const [unlocked, setUnlocked] = useState(() => hasCatalogAccess());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const requestHref = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(
    "Request for product catalog password"
  )}&body=${encodeURIComponent(
    `Hello ${COMPANY_NAME},\n\nI would like access to your vendor catalog. Please send me the password.\n\nThank you.`
  )}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyCatalogPassword(password)) {
      grantCatalogAccess();
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect password. Please try again or request access by email.");
  };

  if (unlocked) return <>{children}</>;

  const form = (
    <div className="mx-auto max-w-md px-4 py-16 text-center" role="dialog" aria-labelledby="catalog-password-title">
      <div className="mb-6 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-foreground" aria-hidden="true" />
        </span>
      </div>
      <h2 id="catalog-password-title" className="font-display text-2xl font-semibold text-foreground mb-3">
        Vendor Catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        This catalog is available to our vendors. Enter the password you received from us to view product photos,
        UPCs, packaging sizes, and other details. If you do not have a password, please request one.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="btn-plum border-0 w-full">
          Unlock Catalog
        </Button>
      </form>
      <div className="mt-6 space-y-1">
        <p className="text-xs text-muted-foreground">Don&apos;t have the password?</p>
        <a href={requestHref} className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-primary">
          Request access by email
        </a>
      </div>
    </div>
  );

  if (withChrome) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">{form}</main>
        <Footer />
      </div>
    );
  }

  return form;
}
