import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pinFavouritesFirst } from "../dm/favourites.ts";

const dm = (id, isFavourite) => ({ channel_id: id, is_favourite: isFavourite });
const ids = (list) => list.map((d) => d.channel_id);

describe("pinFavouritesFirst", () => {
  it("puts favourited DMs before the rest", () => {
    const list = [dm("a", false), dm("b", true), dm("c", false), dm("d", true)];

    assert.deepEqual(ids(pinFavouritesFirst(list)), ["b", "d", "a", "c"]);
  });

  it("keeps the original order inside each group", () => {
    const list = [
      dm("recent", false),
      dm("fav-recent", true),
      dm("older", false),
      dm("fav-older", true),
      dm("oldest", false),
    ];

    assert.deepEqual(ids(pinFavouritesFirst(list)), [
      "fav-recent",
      "fav-older",
      "recent",
      "older",
      "oldest",
    ]);
  });

  it("treats a missing or null is_favourite as not favourited", () => {
    const list = [{ channel_id: "none" }, dm("null", null), dm("fav", true)];

    assert.deepEqual(ids(pinFavouritesFirst(list)), ["fav", "none", "null"]);
  });

  it("returns every DM exactly once and does not change the input", () => {
    const list = [dm("a", true), dm("b", false), dm("c", true)];
    const copy = [...list];

    const result = pinFavouritesFirst(list);

    assert.equal(result.length, list.length);
    assert.deepEqual(new Set(result), new Set(list));
    assert.deepEqual(list, copy);
    assert.notEqual(result, list);
  });

  it("returns an empty list for null, undefined or an empty list", () => {
    assert.deepEqual(pinFavouritesFirst(null), []);
    assert.deepEqual(pinFavouritesFirst(undefined), []);
    assert.deepEqual(pinFavouritesFirst([]), []);
  });
});
