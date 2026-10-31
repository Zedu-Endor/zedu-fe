import { discordComparison } from "./discord";
import { slackComparison } from "./slack";
import type { CompareContent } from "./types";

export type { CompareContent } from "./types";

export const comparisons: Record<string, CompareContent> = {
  [discordComparison.slug]: discordComparison,
  [slackComparison.slug]: slackComparison,
};
