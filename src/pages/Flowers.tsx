import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import aboutHero from "@/assets/about-hero.jpg";

const Flowers = () => {
  return (
    <PageLayout
      title="Flowers"
      subtitle="We are a dedicated orchid grower supplying high-quality, consistent orchids to wholesalers, florists, and distributors."
      heroImage={aboutHero}
    >
      <ProductGrid
        title="Orchids Flower"
        description="At Han Cloud Co. Ltd, we're passionate about providing a wide selection of exquisite flowers. As a premier grower, we're dedicated to freshness, quality, and sustainable practices."
        categoryFilter="Flowers"
      />
    </PageLayout>
  );
};

export default Flowers;
