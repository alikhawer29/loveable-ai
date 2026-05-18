import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const loremParagraph = "At Han Cloud Co. Ltd, we respect your privacy. Our website showcases orchid flowers, clay, and ceramic pots, and allows users to contact us via phone.We may collect basic information such as your name and phone number only when you contact us. This information is used solely to respond to your inquiries and provide assistance. We do not offer online ordering or takeaway services, and we do not collect any payment information. We do not sell, trade, or share your personal information with third parties. We take reasonable measures to keep your information secure. By using our website, you agree to this privacy policy. For any questions, please contact us directly.";

const sections = [
  { title: "1. Introduction", content: loremParagraph },
  // { title: "2. Information We Collect", content: loremParagraph },
  // { title: "3. How We Use Your Information", content: loremParagraph },
  // { title: "5. Data Security", content: loremParagraph },
  // { title: "7. Cookies & Tracking", content: loremParagraph },
];

const Policy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-14 max-w-4xl">
        <h1 className="font-display text-[46px] text-foreground mb-10">Privacy Policy</h1>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              {/* <h2 className="font-display text-lg font-semibold text-foreground mb-3">{s.title}</h2> */}
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Policy;
