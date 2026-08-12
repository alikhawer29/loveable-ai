import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductsPasswordGate } from "@/components/products/ProductsPasswordGate";
import aboutHero from "@/assets/about-hero.jpg";

const Products = () => {
  return (
    <PageLayout
      title="Products"
      subtitle="Explore our curated collection of premium orchids and pots — everything you need in one place."
      heroImage={aboutHero}
    >
      <ProductsPasswordGate>
        <ProductGrid
          title="Our Products"
          description="At Infinity Floral Grower, we're passionate about providing a wide selection of exquisite flowers and quality pots. As a premier grower, we're dedicated to freshness, quality, and sustainable practices."
        />
      </ProductsPasswordGate>
    </PageLayout>
  );
};

export default Products;
