import { PageLayout } from "@/components/layout/PageLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import aboutHero from "@/assets/about-hero.jpg";

const ClayPots = () => {
  return (
    <PageLayout
      title="Clay Pots"
      subtitle="We are a dedicated orchid grower supplying high-quality, consistent orchids to wholesalers, florists, and distributors."
      heroImage={aboutHero}
    >
      <ProductGrid
        title="Clay Pots"
        description="At Infinity Floral, we're passionate about providing a wide selection of exquisite flowers. As a premier grower, we're dedicated to freshness, quality, and sustainable practices."
        categoryFilter="Pots"
        subCategoryFilter="5b40a1f7-d68a-499c-9dba-94dbc6cd7206"
      />
    </PageLayout>
  );
};

export default ClayPots;
