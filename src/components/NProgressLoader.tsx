"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "@/app/nprogress-custom.css";

NProgress.configure({
  showSpinner: false,
  // trickleRate: 0.02,
  trickleSpeed: 300,
  minimum: 0.08,
});

export function NProgressLoader() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (previousPathname.current !== pathname) {
      // User is navigating to a different page
      NProgress.start();

      setTimeout(() => {
        NProgress.done();
      }, 500); 
    }

    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}
