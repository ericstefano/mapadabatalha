import { Buffer } from 'node:buffer'

export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64String = buffer.toString('base64')
  return `data:${mimeType};base64,${base64String}`
};

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const base64String = event.target?.result as string
      const base64Content = base64String.split(',')[1] || base64String
      resolve(base64Content)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsDataURL(file)
  })
}

export function base64ToBuffer(base64String: string): Buffer {
  const cleanedBase64 = base64String.replace(/^data:.*?;base64,/, '').trim()
  return Buffer.from(cleanedBase64, 'base64')
}

export function getFileExtension(fileName: string) {
  return fileName.substring(fileName.lastIndexOf('.') + 1)
}
