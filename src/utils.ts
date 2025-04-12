import {
  compressWithPako,
  createBinaryHeader,
  createSHA256,
  decodeData,
  decompressWithPako,
  encodeData,
  generateUserFingerprint,
  generateUUID,
  generateVisualHash,
  readFileAsArrayBuffer
} from './helper'
import { ITodos, TodoExportFormat } from './interface'

export async function convertFileToTodo(file: File): Promise<TodoExportFormat> {
  try {
    // Read file as ArrayBuffer
    const fileBuffer = await readFileAsArrayBuffer(file)

    // Check minimum file size for header
    if (fileBuffer.byteLength < 32) {
      throw new Error('Invalid file: too small to be a valid todo file')
    }

    // Extract and validate header
    const headerView = new DataView(fileBuffer.slice(0, 32))

    // Check magic number ("TDOX")
    if (
      !(
        headerView.getUint8(0) === 0x54 &&
        headerView.getUint8(1) === 0x44 &&
        headerView.getUint8(2) === 0x4f &&
        headerView.getUint8(3) === 0x58
      )
    ) {
      throw new Error('Invalid file format: not a todo file')
    }

    // Check version compatibility
    const version = headerView.getUint16(4, true)
    if (version > 1) {
      throw new Error(`Unsupported file version: ${version}`)
    }

    // Verify header checksum
    const headerChecksum = await createSHA256(
      new Uint8Array(fileBuffer.slice(0, 24))
    )
    let checksumMatch = true
    for (let i = 0; i < 8; i++) {
      if (
        headerView.getUint8(24 + i) !==
        parseInt(headerChecksum.substring(i * 2, i * 2 + 2), 16)
      ) {
        checksumMatch = false
        break
      }
    }
    if (!checksumMatch) {
      throw new Error('Header checksum verification failed')
    }

    // Get content length
    const contentLength = headerView.getUint32(8, true)

    // Extract the data part
    const encodedData = new Uint8Array(fileBuffer.slice(32, 32 + contentLength))

    // Decode the data
    const decodedData = decodeData(encodedData)

    // Decompress the data
    const decompressedData = decompressWithPako(decodedData)

    // Parse JSON
    const importData = JSON.parse(decompressedData) as TodoExportFormat

    // Verify content checksum
    const contentWithoutChecksum = { ...importData }
    const storedChecksum = contentWithoutChecksum.metadata.contentChecksum
    delete contentWithoutChecksum.metadata.contentChecksum

    const calculatedChecksum = await createSHA256(
      JSON.stringify(contentWithoutChecksum)
    )
    if (calculatedChecksum !== storedChecksum) {
      throw new Error('Content integrity check failed')
    }

    return importData
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}

export async function exportTodos(todo: ITodos): Promise<Blob> {
  // Create the export data object
  const exportData: TodoExportFormat = {
    formatSignature: 'MYTODO_FORMAT_V1',
    metadata: {
      version: '1.0',
      createdAt: new Date().toISOString(),
      appIdentifier: 'MyPersonalTodoApp',
      appVersion: '1.2.3',
      exportId: generateUUID(), // Unique identifier for this export
      userFingerprint: await generateUserFingerprint() // Optional: device signature
    },
    todo,
    // Visual signature for displaying to user
    visualSignature: generateVisualHash(todo)
  }

  // JSON stringify the data
  const jsonString = JSON.stringify(exportData)

  // Create checksum of the JSON data
  const checksum = await createSHA256(jsonString)

  // Add checksum to the export data and stringify again
  exportData.metadata.contentChecksum = checksum
  const finalJsonString = JSON.stringify(exportData)

  // Compress the data (optional)
  const compressedData = compressWithPako(finalJsonString)

  console.log('Compressed Data:', compressedData, 'juju')

  // Encode the compressed data
  const encodedData = encodeData(compressedData)

  console.log('Encoded Data in exportTodos:', encodedData, 'juju') // Add this
  console.log('Encoded Data Length in exportTodos:', encodedData.length, 'juju')

  // Create binary header
  const headerBuffer = createBinaryHeader()
  const headerView = new DataView(headerBuffer)

  // Update content length in header
  headerView.setUint32(8, encodedData.length, true)

  // Update header checksum
  const headerChecksum = await createSHA256(
    new Uint8Array(headerBuffer.slice(0, 24))
  )

  for (let i = 0; i < 8; i++) {
    headerView.setUint8(
      24 + i,
      parseInt(headerChecksum.substring(i * 2, i * 2 + 2), 16)
    )
  }

  // Combine header and data
  const finalBuffer = new Uint8Array(
    headerBuffer.byteLength + encodedData.byteLength
  )
  finalBuffer.set(new Uint8Array(headerBuffer), 0)
  finalBuffer.set(encodedData, headerBuffer.byteLength)

  // Create a Blob with custom MIME type
  return new Blob([finalBuffer], { type: 'application/x-mytodo' })
}
