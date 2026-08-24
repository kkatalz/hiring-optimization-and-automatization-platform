// E.g. 'john doe' => 'John Doe'
export const capitalizeName = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// E.g. 'createdAt' -> 'Created at'
export const formatSortField = (field: string) => {
  if (!field) return '';

  const words = field.replace(/([A-Z])/g, ' $1').split(' ');

  return words
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.toLowerCase();
    })
    .join(' ');
};
