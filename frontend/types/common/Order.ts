export const ORDER_FIELDS = ['ASC', 'DESC'] as const;
export type SortOrder = (typeof ORDER_FIELDS)[number];
