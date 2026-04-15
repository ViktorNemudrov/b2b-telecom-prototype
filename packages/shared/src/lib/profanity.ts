const profanityPattern =
  /(бля|бляд|блять|хуй|хуе|хуи|пизд|еба|ёба|ебл|пидор|пидр|пидорас|мудак|сука|суч|гандон|чмо|мраз|уеб|уёб|долбоеб|долбоёб|залуп|шлюх|манда)/i;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, " ")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsProfanity(value: string): boolean {
  return profanityPattern.test(normalizeText(value));
}
