// Quick checks for the listing import. Sample listings are made up; the markup copies Vinted's.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVintedHtml } from "../src/utils/import/vinted.ts";
import { listingChange } from "../src/utils/import/listings.ts";

const item = (id, title, price, { status, views = "3 views", favs = "1 favourite" } = {}) => `
<div data-testid="grid-item"><div class="box" data-testid="product-item-id-${id}">
  <img alt="${title}" data-testid="product-item-id-${id}--image--img" src="https://example.test/${id}.jpg">
  <a href="/items/${id}" class="overlay" data-testid="product-item-id-${id}--overlay-link" title="${title}"><div></div>
  ${status ? `<div data-testid="product-item-id-${id}--status"><p class="t" data-testid="product-item-id-${id}--status-text">${status}</p></div>` : ""}
  </a>
  <p class="t" data-testid="product-item-id-${id}--description-title">${views}</p>
  <p class="t" data-testid="product-item-id-${id}--description-subtitle">${favs}</p>
  <p class="t" data-testid="product-item-id-${id}--price-text">${price}</p>
</div></div>`;

const html = `<div class="feed-grid">
${item(111, "Blue Jumper - M, brand: Acme &amp; Co, condition: Very good, size: M, Â£4.50", "Â£4.50", { views: "146 views", favs: "17 favourites" })}
${item(222, "Old Board Game, condition: Good, £8.00", "£8.00", { status: "Sold" })}
${item(333, "Red Scarf, brand: Knitco, condition: New with tags, £3.00", "£3.00", { status: "Processing" })}
<div data-testid="product-item-id-444"><p>broken item with no title or price</p></div>
</div>`;

test("reads Vinted wardrobe listings", () => {
  const { listings, skipped } = parseVintedHtml(html);
  assert.equal(skipped, 1);
  assert.equal(listings.length, 3);

  assert.deepEqual(listings[0], {
    externalId: "vinted:111",
    name: "Blue Jumper - M",
    brand: "Acme & Co",
    condition: "Very good",
    size: "M",
    price: 4.5,
    status: "listed",
    pending: false,
    views: 146,
    favourites: 17,
    url: "https://www.vinted.co.uk/items/111",
  });
  assert.equal(listings[1].name, "Old Board Game");
  assert.equal(listings[1].brand, undefined);
  assert.equal(listings[1].status, "sold");
  assert.equal(listings[2].status, "sold");
  assert.equal(listings[2].pending, true);
});

test("re-importing only moves items forward", () => {
  const [listed, sold] = parseVintedHtml(html).listings;
  assert.equal(listingChange(listed, undefined), "new");
  assert.equal(listingChange(listed, { status: "listed", listedPrice: 4.5 }), "unchanged");
  assert.equal(listingChange(listed, { status: "listed", listedPrice: 6 }), "update");
  assert.equal(listingChange(sold, { status: "listed", listedPrice: 8 }), "update");
  assert.equal(listingChange(listed, { status: "sold" }), "unchanged");
});
