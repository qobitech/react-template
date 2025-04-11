import pako from 'pako'

// Compress data using pako (zlib implementation)
export function compressWithPako(data: string): string {
  // Convert string to Uint8Array
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(data)

  // Compress using pako
  const compressed = pako.deflate(uint8Array)

  // Convert to base64 for easier storage
  return arrayBufferToBase64(compressed)
}

// Decompress data
export function decompressWithPako(compressedBase64: string): string {
  // Convert base64 back to Uint8Array
  const compressedData = base64ToArrayBuffer(compressedBase64)

  // Decompress
  const decompressed = pako.inflate(compressedData)

  // Convert back to string
  const decoder = new TextDecoder()
  return decoder.decode(decompressed)
}

// Helper functions for base64 conversion
export function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

// Generate UUID for export ID
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Generate visual hash for user recognition
export function generateVisualHash(data: any): string {
  // This would create a simple hash that can be converted to a visual pattern
  // For example, a color code or pattern of symbols
  let hash = 0
  const str = JSON.stringify(data)
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  // Convert to hex color
  return '#' + ((hash & 0xffffff) | 0x1000000).toString(16).substring(1)
}

// User fingerprint for device identification
export async function generateUserFingerprint(): Promise<string> {
  // Simple device fingerprinting
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height
  ]

  return await createSHA256(components.join('|'))
}

// SHA-256 hash function
export async function createSHA256(data: string | Uint8Array): Promise<string> {
  let buffer: Uint8Array
  if (typeof data === 'string') {
    const encoder = new TextEncoder()
    buffer = encoder.encode(data)
  } else {
    buffer = data
  }

  // In browsers
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// File reading helpers
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function createBinaryHeader(): ArrayBuffer {
  // Create a buffer for our header (32 bytes)
  const buffer = new ArrayBuffer(32)
  const view = new DataView(buffer)

  // Magic number to identify our format (bytes 0-3)
  // "TDOX" in ASCII
  view.setUint8(0, 0x54) // T
  view.setUint8(1, 0x44) // D
  view.setUint8(2, 0x4f) // O
  view.setUint8(3, 0x58) // X

  // Format version (bytes 4-5)
  // Major version in first byte, minor in second
  view.setUint8(4, 1) // Major version 1
  view.setUint8(5, 0) // Minor version 0

  // Flags (byte 6)
  let flags = 0
  flags |= 0x01 // Bit 0: Compression enabled
  flags |= 0x02 // Bit 1: Encryption enabled
  view.setUint8(6, flags)

  // Reserved byte (byte 7) for future use
  view.setUint8(7, 0x00)

  // Content length placeholder (bytes 8-11)
  // Will be filled in later when content size is known
  view.setUint32(8, 0, true) // Little-endian

  // Creation timestamp (bytes 12-19)
  // Store as milliseconds since epoch
  const timestamp = BigInt(new Date().getTime())
  view.setBigUint64(12, timestamp, true) // Little-endian

  // App identifier (bytes 20-23)
  // You can use any 4-byte value unique to your app
  view.setUint8(20, 0x4d) // M
  view.setUint8(21, 0x54) // T
  view.setUint8(22, 0x44) // D
  view.setUint8(23, 0x4f) // O

  // Checksum placeholder (bytes 24-31)
  // Will be calculated and filled in later
  for (let i = 24; i < 32; i++) {
    view.setUint8(i, 0)
  }

  return buffer
}

export function encodeData(data: string): Uint8Array {
  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder()
  const bytes = encoder.encode(data)

  // Apply a simple XOR cipher with a key
  const key = [0x42, 0x57, 0x31, 0x9a] // Your custom key
  const encoded = new Uint8Array(bytes.length)

  for (let i = 0; i < bytes.length; i++) {
    encoded[i] = bytes[i] ^ key[i % key.length]
  }

  return encoded
}

export function decodeData(encoded: Uint8Array): string {
  // Same XOR key as in encodeData
  const key = [0x42, 0x57, 0x31, 0x9a]
  const decoded = new Uint8Array(encoded.length)

  for (let i = 0; i < encoded.length; i++) {
    decoded[i] = encoded[i] ^ key[i % key.length]
  }

  // Convert bytes back to string
  const decoder = new TextDecoder()
  return decoder.decode(decoded)
}
