export function sanitizeId(id: string) {
  return id.replaceAll('_', '').replaceAll('-', '')
}
