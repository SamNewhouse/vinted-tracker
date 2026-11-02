import type { ImportedListing } from "../../types";

export interface ParseResult {
  listings: ImportedListing[];
  skipped: number;
}

const ITEM_START = /data-testid="product-item-id-(\d+)"/g;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

const decode = (text: string): string =>
  text
    .replace(/&(?:amp|quot|#39|#x27|lt|gt|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/Â£/g, "£") // UTF-8 pound sign read as Latin-1 when copied
    .trim();

const parseMoney = (text: string): number => parseFloat(text.replace(/[^\d.]/g, ""));

const parseCount = (text: string | undefined): number | undefined => {
  const n = text ? parseInt(text.replace(/[^\d]/g, ""), 10) : NaN;
  return Number.isNaN(n) ? undefined : n;
};

/** Text inside the element whose data-testid is `product-item-id-<id>--<suffix>`. */
const textOf = (chunk: string, id: string, suffix: string): string | undefined => {
  const match = chunk.match(
    new RegExp(`data-testid="product-item-id-${id}--${suffix}"[^>]*>([^<]*)<`),
  );
  return match ? decode(match[1]) : undefined;
};

/** `"Name, brand: X, condition: Y, size: Z, £3.00"` → name and the labelled parts. */
const parseTitle = (
  title: string,
): Pick<ImportedListing, "name" | "brand" | "condition" | "size"> => {
  const [name, ...parts] = title
    .replace(/,\s*£[\d.,]+$/, "")
    .split(/, (?=(?:brand|condition|size): )/);
  const field = (key: string) => parts.find((p) => p.startsWith(`${key}: `))?.slice(key.length + 2);
  return { name, brand: field("brand"), condition: field("condition"), size: field("size") };
};

/**
 * Reads listings from the HTML of a Vinted wardrobe grid ("My wardrobe" page, copied with
 * the browser's "Copy outerHTML"). Works on a string, so the pasted HTML is never rendered.
 * ponytail: relies on Vinted's data-testid markup; if Vinted changes it, this returns
 * nothing and reports every item as skipped.
 */
export const parseVintedHtml = (html: string): ParseResult => {
  const starts = [...html.matchAll(ITEM_START)];
  const listings: ImportedListing[] = [];
  let skipped = 0;

  starts.forEach((start, i) => {
    const id = start[1];
    const chunk = html.slice(start.index, starts[i + 1]?.index ?? html.length);

    const linkTag = chunk.match(
      new RegExp(`<a\\b[^>]*data-testid="product-item-id-${id}--overlay-link"[^>]*>`),
    )?.[0];
    const title = linkTag?.match(/\btitle="([^"]*)"/)?.[1];
    const priceText = textOf(chunk, id, "price-text");
    const price = priceText ? parseMoney(priceText) : NaN;

    if (!title || Number.isNaN(price)) {
      skipped++;
      return;
    }

    const status = textOf(chunk, id, "status-text")?.toLowerCase();
    listings.push({
      externalId: `vinted:${id}`,
      ...parseTitle(decode(title)),
      price,
      status: status === "sold" || status === "processing" ? "sold" : "listed",
      pending: status === "processing",
      views: parseCount(textOf(chunk, id, "description-title")),
      favourites: parseCount(textOf(chunk, id, "description-subtitle")),
      url: `https://www.vinted.co.uk/items/${id}`,
    });
  });

  return { listings, skipped };
};
