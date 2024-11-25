import type { Buffer } from 'node:buffer'

export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64String = buffer.toString('base64')
  return `data:${mimeType};base64,${base64String}`
};
