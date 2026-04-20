import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      // Try auto-login after successful registration
      try {
        await login(email, password);
        navigate("/");
      } catch {
        // Email confirmation may be required
        toast({ title: "Registration successful!", description: "Please check your email to verify your account, then log in." });
        navigate("/login");
      }
    } catch (err: any) {
      toast({ title: "Registration failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center">
            Sign Up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name<span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="pl-12"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                E-Mail Address<span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="pl-12"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                Phone Number<span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  type="tel"
                  placeholder="1234 567 8910"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                Password<span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="pl-12 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                Confirm Password<span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Enter Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="pl-12 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-plum border-0 h-11 text-sm font-semibold tracking-wider uppercase"
              disabled={loading}
            >
              {loading ? "Signing up…" : "SIGN UP"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already A User?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>{" "}
            Now
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
