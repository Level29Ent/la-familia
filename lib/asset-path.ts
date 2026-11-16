// Next prefixes its own chunks, but public assets need the same deployment path.
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`
}
