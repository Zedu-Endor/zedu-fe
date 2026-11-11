/**
 * Ordering for DM lists with favourited (starred) people.
 *
 * Kept free of app imports so it can be unit tested with `node --test`.
 */

type FavouriteLike = { is_favourite?: boolean | null } | null | undefined;

/**
 * Returns [dms] with favourited entries first. The order inside each group is
 * kept, so the list's own ordering (recent first, or best search match first)
 * still applies within favourites and within the rest.
 */
export const pinFavouritesFirst = <T extends FavouriteLike>(
  dms: readonly T[] | null | undefined
): T[] => {
  const favourites: T[] = [];
  const rest: T[] = [];

  for (const dm of dms ?? []) {
    (dm?.is_favourite ? favourites : rest).push(dm);
  }

  return [...favourites, ...rest];
};
