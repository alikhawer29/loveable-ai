import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CatalogPasswordGate } from "@/components/products/CatalogPasswordGate";
import aboutHero from "@/assets/about-hero.jpg";

const Catalog = () => {
  return (
    <PageLayout
      title="Catalog"
      subtitle="Vendor catalog for wholesale partners. Request the password from us to view product photos, UPCs, packaging sizes, and other details."
      heroImage={aboutHero}
    >
      <CatalogPasswordGate>
        <ProductGrid
          title="Vendor Catalog"
          description="Browse our current product lineup. Photos shown here are from our existing product library until dedicated catalog images and videos are supplied."
          detailBasePath="/catalog"
        />
      </CatalogPasswordGate>
    </PageLayout>
  );
};

export default Catalog;
