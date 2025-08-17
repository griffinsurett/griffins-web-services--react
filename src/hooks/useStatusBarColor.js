// src/hooks/useStatusBarColor.js
import { useEffect } from "react";

/**
 * Keeps the mobile browser/OS status bar color in sync with your theme.
 * - Chrome/Android uses <meta name="theme-color">
 * - iOS (standalone/PWA) uses <meta name="apple-mobile-web-app-status-bar-style">
 *   ("default" => dark text, "black-translucent" => light text)
 */
export function useStatusBarColor({
  light = "var(--color-primary-light)", 
  dark  = "var(--color-primary-dark)", 
} = {}) {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const isLight = root.getAttribute("data-theme") === "light";
      const color = isLight ? light : dark;

      // Ensure/Update <meta name="theme-color">
      let themeMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.setAttribute("name", "theme-color");
        document.head.appendChild(themeMeta);
      }
      themeMeta.setAttribute("content", color);

      // iOS standalone/PWA status bar style (text color)
      let iosMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!iosMeta) {
        iosMeta = document.createElement("meta");
        iosMeta.setAttribute("name", "apple-mobile-web-app-status-bar-style");
        document.head.appendChild(iosMeta);
      }
      iosMeta.setAttribute("content", isLight ? "default" : "black-translucent");
    };

    // Apply once on mount
    apply();

    // Watch for data-theme changes (your UseMode sets this)
    const mo = new MutationObserver(apply);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [light, dark]);
}
