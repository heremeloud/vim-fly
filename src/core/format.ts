/** A number with a comma between thousands (1,250), the same in every language. */
export function withCommas(n: number): string {
  return n.toLocaleString('en-US');
}

/** An amount in baht: ฿1,250, or -฿1,250 for a penalty. */
export function baht(n: number): string {
  return n < 0 ? `-฿${withCommas(-n)}` : `฿${withCommas(n)}`;
}
