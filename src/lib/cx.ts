export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]

export function cx(...parts: ClassValue[]): string {
  const out: string[] = []
  for (const p of parts) {
    if (!p) continue
    if (Array.isArray(p)) out.push(cx(...p))
    else out.push(String(p))
  }
  return out.join(' ')
}
