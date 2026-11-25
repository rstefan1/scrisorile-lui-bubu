// Romanian words that change with a number: "3 litere", but "20 de litere".
// From 20 on, "de" comes between the number and the word, except when the
// last two digits are 01..19 ("101 litere", "120 de litere").

export function count(n, one, many) {
  if (n === 1) return one;
  const rest = n % 100;
  const de = n >= 20 && (rest === 0 || rest >= 20);
  return `${n} ${de ? 'de ' : ''}${many}`;
}

export const letters = (n) => count(n, 'o literă', 'litere');
export const seconds = (n) => count(n, 'o secundă', 'secunde');
