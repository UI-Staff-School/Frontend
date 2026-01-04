"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: true,
  speed: 300,
  minimum: 0.1,
  trickleSpeed: 100,
});

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Complete progress when route changes
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Intercept clicks on links to start progress
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (!anchor) return;

    const href = anchor.getAttribute("href");
    const targetAttr = anchor.getAttribute("target");

    // Don't trigger for external links, hash links, or new tab links
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("#") ||
      targetAttr === "_blank" ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    ) {
      return;
    }

    // Don't trigger if it's the same page
    if (href === pathname) {
      return;
    }

    // Start the progress bar
    NProgress.start();
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClick]);

  return null;
}
