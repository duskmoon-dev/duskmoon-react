global.CSSStyleSheet = class CSSStyleSheet {
  replaceSync() {}
} as any;
async function main() {
  const { css } = await import("@duskmoon-dev/core/components/button");
  console.log(css);
}
main();
