/**
 * Ends GFM literal autolinks (bare `https://…` / `www.…` URLs) at CJK text.
 *
 * GFM only stops a literal URL at whitespace, `<` or trailing ASCII
 * punctuation, so `https://example.com，告诉我` links the Chinese text too.
 * This transform runs after `remark-gfm` and cuts each literal autolink before
 * the first CJK ideograph, kana, Hangul, CJK symbol/punctuation or full-width
 * form. Non-ASCII path text is therefore not kept (`https://a.com/路径` links
 * `https://a.com/`); percent-encoded paths, `<url>` autolinks and
 * `[text](url)` links are untouched.
 */

interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  position?: { start: { offset?: number } };
}

const CJK_BOUNDARY =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303F\u30FB\uFF00-\uFFEF]/u;
const BARE_URL = /(?:https?:\/\/|www\.)[\p{L}\p{N}_-]/iu;
const LEADING_BARE_URL = new RegExp(`^${BARE_URL.source}`, "iu");
const TRAILING_PUNCTUATION = /[?!.,:;*_~'"]$/;

function isLiteralAutolink(node: MdNode): boolean {
  const [child] = node.children ?? [];
  return (
    node.children?.length === 1 &&
    child.type === "text" &&
    child.value !== undefined &&
    node.position?.start.offset !== undefined &&
    child.position?.start.offset === node.position.start.offset &&
    LEADING_BARE_URL.test(child.value)
  );
}

/** Mirrors GFM's trailing-punctuation rule for the shortened URL. */
function trimTrailing(url: string): string {
  let end = url;
  for (;;) {
    if (TRAILING_PUNCTUATION.test(end)) {
      end = end.slice(0, -1);
    } else if (
      end.endsWith(")") &&
      end.split(")").length > end.split("(").length
    ) {
      end = end.slice(0, -1);
    } else {
      return end;
    }
  }
}

function linkNode(text: string): MdNode {
  return {
    type: "link",
    url: /^www\./i.test(text) ? `http://${text}` : text,
    children: [{ type: "text", value: text }],
  };
}

/** Splits text that starts with a bare URL into link and text nodes. */
function splitBareUrl(value: string): MdNode[] {
  const boundary = value.search(CJK_BOUNDARY);
  if (boundary === -1) return [linkNode(value)];
  const url = trimTrailing(value.slice(0, boundary));
  const nodes: MdNode[] = [
    LEADING_BARE_URL.test(url) ? linkNode(url) : { type: "text", value: url },
  ];
  const rest = value.slice(url.length);
  const next = rest.search(BARE_URL);
  if (next === -1) {
    nodes.push({ type: "text", value: rest });
  } else {
    if (next > 0) nodes.push({ type: "text", value: rest.slice(0, next) });
    nodes.push(...splitBareUrl(rest.slice(next)));
  }
  return nodes;
}

function visit(parent: MdNode): void {
  const children = parent.children;
  if (!children) return;
  for (let index = 0; index < children.length; index++) {
    const node = children[index];
    const text = node.children?.[0]?.value;
    if (
      node.type === "link" &&
      text !== undefined &&
      isLiteralAutolink(node) &&
      CJK_BOUNDARY.test(text)
    ) {
      const replacement = splitBareUrl(text);
      children.splice(index, 1, ...replacement);
      index += replacement.length - 1;
    } else {
      visit(node);
    }
  }
}

export function remarkCjkAutolink() {
  return (tree: MdNode) => visit(tree);
}
