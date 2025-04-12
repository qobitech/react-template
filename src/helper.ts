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
  // Get high-precision timestamp
  const timestamp = performance.now().toString().replace('.', '')

  // Browser-specific entropy
  const browserEntropy = navigator.userAgent
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(16)

  // Random component
  const getRandomSegment = (length: number) => {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Combine parts into UUID format
  const p1 = timestamp.slice(0, 8)
  const p2 = timestamp.slice(8, 12)
  const p3 = '4' + browserEntropy.slice(0, 3) // Version 4 UUID
  const p4 =
    (Math.floor(Math.random() * 4) + 8).toString(16) + timestamp.slice(-3) // RFC 4122 variant
  const p5 = getRandomSegment(6)

  return `${p1}-${p2}-${p3}-${p4}-${p5}`
}

// Generate visual hash for user recognition
export function generateVisualHash(data: any): string {
  const str = JSON.stringify(data)

  // Create RGB components using different hash algorithms
  let hashR = 5381
  let hashG = 52711
  let hashB = 1313

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    // Different modifications for each component
    hashR = ((hashR << 5) + hashR) ^ char
    hashG = (hashG << 4) + hashG + char
    hashB = char + (hashB << 6) + (hashB << 16) - hashB
  }

  // Normalize to 0-255 range
  const r = Math.abs(hashR % 256)
  const g = Math.abs(hashG % 256)
  const b = Math.abs(hashB % 256)

  // Convert to hex color with brightness adjustment to ensure readability
  // Ensure at least one component is > 150 for visibility
  const adjustBrightness =
    r + g + b < 300 ? 150 + Math.floor(Math.random() * 105) : 0

  const finalR = Math.min(255, r + (r < 100 ? adjustBrightness : 0))
  const finalG = Math.min(255, g + (g < 100 && r >= 100 ? adjustBrightness : 0))
  const finalB = Math.min(
    255,
    b + (b < 100 && r >= 100 && g >= 100 ? adjustBrightness : 0)
  )

  return `#${finalR.toString(16).padStart(2, '0')}${finalG
    .toString(16)
    .padStart(2, '0')}${finalB.toString(16).padStart(2, '0')}`
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

  // Create output array
  const encoded = new Uint8Array(bytes.length)

  // More complex key with mixed values
  const primaryKey = [0x3f, 0x8d, 0x2c, 0xa5, 0x76, 0xe1, 0x19, 0xb4]

  // Rolling key modification based on data content
  let rollingModifier = (bytes.length % 251) + 7

  // Process each byte with a more complex algorithm
  for (let i = 0; i < bytes.length; i++) {
    // Get the base key byte for this position
    const keyByte = primaryKey[i % primaryKey.length]

    // Apply a position-dependent transformation
    const positionFactor = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3

    // Calculate the modified key byte
    const modifiedKey = (keyByte + i) % 256 ^ rollingModifier

    // Encode the byte using XOR and rotation
    let result = bytes[i] ^ modifiedKey
    result =
      ((result << positionFactor) | (result >> (8 - positionFactor))) & 0xff

    // Store the result
    encoded[i] = result

    // Update rolling modifier based on input byte for added variability
    rollingModifier = (rollingModifier * 17 + bytes[i] * 13) % 251
  }

  return encoded
}

export function decodeData(encoded: Uint8Array): string {
  // Create output array
  const decoded = new Uint8Array(encoded.length)

  // Same key as in encodeData
  const primaryKey = [0x3f, 0x8d, 0x2c, 0xa5, 0x76, 0xe1, 0x19, 0xb4]

  // Initialize rolling modifier the same way
  let rollingModifier = (encoded.length % 251) + 7

  // Reverse the encoding process
  for (let i = 0; i < encoded.length; i++) {
    // Get the base key byte for this position
    const keyByte = primaryKey[i % primaryKey.length]

    // Apply the same position-dependent transformation
    const positionFactor = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3

    // Calculate the modified key byte
    const modifiedKey = (keyByte + i) % 256 ^ rollingModifier

    // Decode by reversing rotation and XOR
    let result = encoded[i]
    result =
      ((result >> positionFactor) | (result << (8 - positionFactor))) & 0xff
    result = result ^ modifiedKey

    // Store the result
    decoded[i] = result

    // Update rolling modifier based on decoded byte
    // We must use the decoded byte here to ensure the sequence matches during encoding
    rollingModifier = (rollingModifier * 17 + result * 13) % 251
  }

  // Convert bytes back to string
  const decoder = new TextDecoder()
  return decoder.decode(decoded)
}

export function sanitizeFileName(name: string): string {
  // Replace invalid filename characters with underscores
  return name
    .replace(/[\\/:*?"<>|]/g, '_') // Replace Windows/Unix invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim()
}
