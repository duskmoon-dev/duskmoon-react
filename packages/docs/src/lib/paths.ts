const rawBase = import.meta.env?.BASE_URL ?? "/";
const base = rawBase === "/" ? "" : rawBase.replace(/\/$/, "");

export function docsPath(pathname: string) {
  if (pathname === "/") {
    return `${base}/`;
  }

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
