// A person's name is letters only. Hyphens, apostrophes and single spaces are
// allowed between letters, because 'Anne-Marie', "O'Brien" and 'Van Der Berg'
// are real names. Digits and every other sign are rejected.
const NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

export const isValidName = (name: string) => NAME_PATTERN.test(name.trim());

export const validateName = (name: string, label: string): string | null =>
  isValidName(name)
    ? null
    : `${label} can contain letters only, without digits or special characters.`;
