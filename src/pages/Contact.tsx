import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from("queries").insert({
      full_name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Contact Us</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Have questions about our flowers, pots, bulk availability, or gardening guidance? Our team is happy to assist you.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Please fill out the form, and we will get back to you via email as soon as possible.
            </p>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Prefer To Contact Us Directly?</h2>
            <ul className="space-y-1.5 text-sm text-foreground">
              <li><span className="font-semibold">Email:</span> support@gardencart.com</li>
              <li><span className="font-semibold">Phone:</span> +1 (000) 000-0000</li>
              <li><span className="font-semibold">Business Hours:</span> Monday – Friday | 9:00 AM – 6:00 PM</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Full Name<span className="text-destructive">*</span></Label>
              <Input placeholder="Enter Your Full Name" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((p) => ({ ...p, name: "" })); }} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Email<span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="Enter Your Email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: "" })); }} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Subject<span className="text-destructive">*</span></Label>
              <Input placeholder="Enter Subject" value={form.subject} onChange={(e) => { setForm({ ...form, subject: e.target.value }); setErrors((p) => ({ ...p, subject: "" })); }} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Message<span className="text-destructive">*</span></Label>
              <Textarea placeholder="Write Message" rows={5} value={form.message} onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors((p) => ({ ...p, message: "" })); }} />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" className="btn-plum border-0 w-full uppercase tracking-wider text-xs" disabled={loading}>
              {loading ? "Sending..." : "SUBMIT"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
