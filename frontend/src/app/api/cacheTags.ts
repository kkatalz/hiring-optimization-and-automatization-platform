/** The parent row a collection can be scoped to. */
type ParentType = 'VACANCY' | 'SUBMISSION';

/** Every row of a type that belongs to one parent row, e.g. every submission of one vacancy. */
export const listWithin = (parent: ParentType, parentId: string) =>
  `LIST_WITHIN_${parent}_${parentId}`;
