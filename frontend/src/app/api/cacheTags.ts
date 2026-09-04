/**
 * The vocabulary for RTK Query cache-tag ids.
 *
 * A tag's id is one of these two:
 *   1. an entity's own id, when the cache entry holds a single row;
 *   2. a collection key from this file, when the cache entry holds a list of rows.
 *
 * Collection keys are built here rather than inlined, because a tag that no
 * mutation invalidates fails silently: the screen keeps showing stale data and
 * nothing reports an error. Going through `allWithin` makes a mistyped scope a
 * compile error instead.
 *
 * Both keys start with `ALL`, so a collection key can never collide with an entity id.
 */

/** Every row of a type, e.g. every vacancy the requester can see. */
export const ALL = 'ALL';

/** The parent row a collection can be scoped to. */
type ParentType = 'VACANCY' | 'SUBMISSION';

/** Every row of a type that belongs to one parent row, e.g. every submission of one vacancy. */
export const allWithin = (parent: ParentType, parentId: string) =>
  `${ALL}_WITHIN_${parent}_${parentId}`;
