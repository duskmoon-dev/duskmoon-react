/**
 * Boot script to be inlined in <head> to prevent FOUC.
 * This should be converted to a string and injected.
 */
export const themeScript = `
(function() {
  try {
    var storageKey = 'duskmoon-theme';
    var theme = localStorage.getItem(storageKey) || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {}
})();
`.trim();
