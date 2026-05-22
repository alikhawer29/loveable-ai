import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll window to top on every route change (SPA navigation). */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
