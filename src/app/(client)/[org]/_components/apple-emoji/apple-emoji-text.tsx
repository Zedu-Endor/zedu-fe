"use client";

import type { ReactNode } from "react";
import {
  EMOJI_PATTERN,
  appleEmojiImageUrl,
  lookupAppleEmoji,
} from "~/lib/apple-emoji";

// Renders emoji as <img> nodes and everything else as escaped text, so the
// value never reaches the DOM as markup.
export function AppleEmojiText({ text }: { text?: string | null }) {
  const value = text || "";
  const nodes: ReactNode[] = [];
  let last = 0;

  for (const match of value.matchAll(new RegExp(EMOJI_PATTERN))) {
    const emoji = match[0];
    const unified = lookupAppleEmoji(emoji);
    const src = unified ? appleEmojiImageUrl(unified) : "";
    if (!src) continue;

    const start = match.index ?? 0;
    if (start > last) nodes.push(value.slice(last, start));
    nodes.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={start}
        className="apple-emoji-img"
        alt={emoji}
        src={src}
        draggable={false}
      />
    );
    last = start + emoji.length;
  }

  if (last === 0) return <>{value}</>;
  if (last < value.length) nodes.push(value.slice(last));

  return <span>{nodes}</span>;
}
