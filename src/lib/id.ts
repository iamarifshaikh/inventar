/**
 * Short-ID generator — the core trick of the app.
 *
 * A vendor writes this code on a paper tag and sticks it on the shirt.
 * Rules (from the brief):
 *   • first 2 letters of the product name
 *   • + first character of the variant (size)
 *   • + an auto-incrementing, zero-padded sequence number
 *   • UPPERCASE, max 8 characters, writable in under 3 seconds
 *   • never collide — the running sequence guarantees uniqueness
 *
 * e.g.  "Arsenal" + "Large"  -> AR-L-01
 *       "Arsenal" + "Small"  -> AR-S-02
 *       "Brazil"  + "Medium" -> BR-M-03
 */

const onlyLetters = (s: string) => s.replace(/[^a-zA-Z]/g, '')
const alnum = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '')

export function namePrefix(name: string): string {
  const letters = onlyLetters(name).toUpperCase()
  return (letters.slice(0, 2) || 'XX').padEnd(2, 'X')
}

export function variantToken(size?: string): string {
  if (!size) return ''
  return alnum(size).charAt(0).toUpperCase()
}

/**
 * Build the next code. `seq` is the running counter held in the store,
 * `taken` is the set of ids already in use (defensive collision guard).
 */
export function makeCode(
  name: string,
  size: string | undefined,
  seq: number,
  taken: Set<string>,
): { code: string; nextSeq: number } {
  const prefix = namePrefix(name)
  const token = variantToken(size)
  let n = seq

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const num = String(n).padStart(2, '0')
    const code = token ? `${prefix}-${token}-${num}` : `${prefix}-${num}`
    n += 1
    if (!taken.has(code) && code.length <= 8) {
      taken.add(code)
      return { code, nextSeq: n }
    }
    // safety valve
    if (n > seq + 100000) {
      const fallback = `${prefix}-${Date.now().toString(36).slice(-2).toUpperCase()}`
      taken.add(fallback)
      return { code: fallback, nextSeq: n }
    }
  }
}
