import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is Han Cloud Co. Ltd?", a: "Han Cloud Co. Ltd is a website that showcases beautiful orchid flowers along with clay and ceramic pots. It allows users to explore unique floral arrangements and decorative pot designs." },
  { q: "How can I contact Han Cloud Co. Ltd?", a: "You can contact Han Cloud Co. Ltd through the provided contact details, including email at infinityfloralgrower@gmail.com or by phone at 854.692.7227. Our support team is available Monday to Friday from 9:00 AM to 6:00 PM and will be happy to assist you with any inquiries or information you need." },
  // { q: "Who can register on Han Cloud Co. Ltd?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  // { q: "Can I see product availability and quantity details?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  // { q: "What is the Gardening Guidelines section?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  // { q: "How do I receive updates or announcements?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  // { q: "How can I contact support?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
];

const Faqs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-14 max-w-4xl">
        <h1 className="font-display text-[46px] text-foreground mb-10">Frequently Asked Questions (FAQ)</h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
              <AccordionTrigger className="text-sm font-medium text-foreground py-5 hover:no-underline data-[state=open]:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:px-4 data-[state=open]:-mx-4 data-[state=open]:rounded-md transition-all">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed data-[state=open]:bg-primary data-[state=open]:text-primary-foreground/80 data-[state=open]:px-4 data-[state=open]:-mx-4 data-[state=open]:pb-4 data-[state=open]:rounded-b-md">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default Faqs;
