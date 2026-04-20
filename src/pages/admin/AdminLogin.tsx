import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const success = await adminLogin(email, password);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        toast({ title: "Invalid admin credentials", description: "You do not have admin access.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout>
      <div className="text-center space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground">Login to Your Account!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            E-mail Address<span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center border-r border-input text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 bg-muted/40"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
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
              className="pl-12 pr-10 bg-muted/40"
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

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="admin-remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label htmlFor="admin-remember" className="text-sm text-foreground cursor-pointer">
              Remember Me
            </label>
          </div>
          <Link to="/admin/forgot-password" className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-primary">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full btn-plum border-0 h-12 text-sm font-semibold tracking-wider uppercase gap-2"
          disabled={loading}
        >
          {loading ? "Logging in…" : (
            <>Login <ArrowUpRight className="h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AdminAuthLayout>
  );
};

export default AdminLogin;
