const profanityPattern =
  /(бля|бляд|блед|хуй|хуе|хуи|пизд|пизж|еба|ебу|ебл|пидор|пидр|пидорас|мудак|сука|суч|гандон|чмо|мраз|уеб|уеб|долбоеб|залуп|шлюх|манда|нах|хер|хрен|говноед|выеб|заеб|наеб|подъеб|поеб|отъеб|разъеб)/i;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[6б]/g, "б")
    .replace(/[3з]/g, "з")
    .replace(/[@а]/g, "а")
    .replace(/[0о]/g, "о")
    .replace(/[1!il]/g, "и")
    .replace(/[^a-zа-яё0-9\s]/gi, " ")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsProfanity(value: string): boolean {
  return profanityPattern.test(normalizeText(value));
}
