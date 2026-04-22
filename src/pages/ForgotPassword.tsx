import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Step = "email" | "verify" | "reset" | "done";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(50);
  const { toast } = useToast();

  useEffect(() => {
    if (step !== "verify" || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Mock API call
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setCountdown(50);
    setStep("verify");
  };

  const handleResendCode = useCallback(() => {
    setCountdown(50);
    toast({ title: "Verification code resent" });
  }, [toast]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      toast({ title: "Please enter a valid verification code", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-8">
          <h1 className="font-display text-[46px] text-foreground text-center">
            Forgot Password
          </h1>

          {/* Step 1: Email */}
          {step === "email" && (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Enter an email address to receive a verification code.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                      required
                      className="pl-12"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-plum border-0 h-11 text-sm font-semibold tracking-wider uppercase"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "CONTINUE"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Back To{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Verification */}
          {step === "verify" && (
            <>
              <p className="text-center text-sm text-muted-foreground">
                An email has been sent to you with a verification code.
                <br />
                Please enter it here.
              </p>
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Verification Code<span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter Verification Code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="pl-12"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Resending In {formatTime(countdown)}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend Code
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-plum border-0 h-11 text-sm font-semibold tracking-wider uppercase"
                  disabled={loading}
                >
                  {loading ? "Verifying…" : "CONTINUE"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Not A User?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>{" "}
                Now
              </p>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Set a new password for your account
              </p>
              <form onSubmit={handleResetSubmit} className="space-y-5">
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
                      required
                      minLength={6}
                      className="pl-12 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
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
                      required
                      minLength={6}
                      className="pl-12 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm(!showConfirm)}
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
                  {loading ? "Updating…" : "UPDATE"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Not A User?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>{" "}
                Now
              </p>
            </>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="hsl(142 71% 45%)"/><path d="M20 33l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-foreground font-medium">Password updated successfully</p>
              <Link to="/login">
                <Button className="w-full btn-plum border-0 h-11 text-sm font-semibold tracking-wider uppercase">
                  Login To Continue
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
