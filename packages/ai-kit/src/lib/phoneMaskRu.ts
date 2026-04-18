/** Маска мобильного РФ: «+7 961 416 24 34» (до 10 цифр после кода страны). */

export function formatRuMobileMask(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.startsWith("7")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let out = "+7";
  if (digits.length === 0) return `${out} `;

  out += " ";
  if (digits.length <= 3) return out + digits;
  out += digits.slice(0, 3);
  if (digits.length <= 6) return out + " " + digits.slice(3);
  out += " " + digits.slice(3, 6);
  if (digits.length <= 8) return out + " " + digits.slice(6);
  out += " " + digits.slice(6, 8);
  if (digits.length <= 10) return out + " " + digits.slice(8);
  return out + " " + digits.slice(8, 10);
}
