import React from "react";

export type DmTheme = "sunshine" | "moonlight" | "ocean" | "forest";

/**
 * Boot script to be inlined in <head> to prevent FOUC.
 * This should be converted to a string and injected.
 */
export const themeScript = `
(function() {
  try {
    var storageKey = 'duskmoon-theme';
    var theme = localStorage.getItem(storageKey);
    if (!theme) theme = 'sunshine';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`.trim();

export const ThemeInitScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
};
