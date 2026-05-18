import { type ReactNode } from "react";
import adminBg from "@/assets/admin-login-bg.jpg";
import logoImg from "@/assets/logo.png";

interface AdminAuthLayoutProps {
  children: ReactNode;
}

export function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left – form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logoImg} alt="Han Cloud Co. Ltd" className="h-14 my-3 object-contain" />
          </div>
          {children}
        </div>
      </div>

      {/* Right – background image (hidden on small screens) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={adminBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
