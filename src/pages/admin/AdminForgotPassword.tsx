import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Lock, Eye, EyeOff, ArrowUpRight, X } from "lucide-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "verify" | "reset" | "done";

const AdminForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(50);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== "verify" || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleResendCode = useCallback(() => {
    setCountdown(50);
    toast({ title: "Verification code resent" });
  }, [toast]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: "Please enter your email", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setCountdown(50);
    setStep("verify");
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) { toast({ title: "Please enter a valid code", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    if (password !== confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowSuccess(true);
  };

  const subtitle: Record<Step, string> = {
    email: "Enter your email address to receive a\nverification code",
    verify: "An email has been sent to you with a verification code.\nPlease enter it here.",
    reset: "Set New Password for your Account",
    done: "",
  };

  return (
    <AdminAuthLayout>
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Forgot Password</h1>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{subtitle[step]}</p>
      </div>

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-mail Address<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground"><Mail className="h-4 w-4" /></div>
              <Input type="email" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-12 bg-muted/40" />
            </div>
          </div>
          <Button type="submit" className="w-full btn-plum border-0 h-12 text-sm font-semibold tracking-wider uppercase gap-2" disabled={loading}>
            {loading ? "Sending…" : <> Continue <ArrowUpRight className="h-4 w-4" /></>}
          </Button>
          <p className="text-center text-sm"><Link to="/admin/login" className="font-medium text-foreground underline underline-offset-2">Back to Login</Link></p>
        </form>
      )}

      {/* Step 2: Verify */}
      {step === "verify" && (
        <form onSubmit={handleVerifySubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Verification Code<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground"><ShieldCheck className="h-4 w-4" /></div>
              <Input type="text" placeholder="Enter Verification Code" value={code} onChange={(e) => setCode(e.target.value)} required className="pl-12 bg-muted/40" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleResendCode} disabled={countdown > 0} className="text-sm font-medium text-foreground underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Resend Code
            </button>
          </div>
          <Button type="submit" className="w-full btn-plum border-0 h-12 text-sm font-semibold tracking-wider uppercase gap-2" disabled={loading}>
            {loading ? "Verifying…" : <>Continue <ArrowUpRight className="h-4 w-4" /></>}
          </Button>
          <p className="text-center text-sm"><Link to="/admin/login" className="font-medium text-foreground underline underline-offset-2">Back to Login</Link></p>
        </form>
      )}

      {/* Step 3: Reset */}
      {step === "reset" && (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground"><Lock className="h-4 w-4" /></div>
              <Input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-12 pr-10 bg-muted/40" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password<span className="text-destructive">*</span></label>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground"><Lock className="h-4 w-4" /></div>
              <Input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pl-12 pr-10 bg-muted/40" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full btn-plum border-0 h-12 text-sm font-semibold tracking-wider uppercase gap-2" disabled={loading}>
            {loading ? "Updating…" : <>Update <ArrowUpRight className="h-4 w-4" /></>}
          </Button>
          <p className="text-center text-sm"><Link to="/admin/login" className="font-medium text-foreground underline underline-offset-2">Back to Login</Link></p>
        </form>
      )}

      {/* Success popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm text-center p-8">
          <button onClick={() => { setShowSuccess(false); navigate("/admin/login"); }} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="hsl(142 71% 45%)" />
              <path d="M20 33l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">Successful</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your Password Has Been Reset.<br />Please Login To Continue.
          </p>
          <Button
            onClick={() => { setShowSuccess(false); navigate("/admin/login"); }}
            className="w-full btn-plum border-0 h-11 text-sm font-semibold tracking-wider uppercase mt-4"
          >
            Ok
          </Button>
        </DialogContent>
      </Dialog>
    </AdminAuthLayout>
  );
};

export default AdminForgotPassword;
