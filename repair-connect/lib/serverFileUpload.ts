import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface ServerUploadResult {
  url: string
  localPath: string
  filename: string
  fileSize: number
  width?: number
  height?: number
}

// Ensure upload directories exist
function ensureUploadDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = crypto.randomBytes(8).toString('hex')
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_')

  return `${timestamp}_${randomStr}_${baseName}${ext}`
}

// Save file to server storage
export async function saveToServer(
  file: File,
  folder: string = 'uploads'
): Promise<ServerUploadResult> {
  try {
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    ensureUploadDir(uploadDir)

    // Generate unique filename
    const filename = generateFilename(file.name)
    const filePath = path.join(uploadDir, filename)

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Write file to disk
    fs.writeFileSync(filePath, buffer)

    // Return result
    return {
      url: `/uploads/${folder}/${filename}`,
      localPath: filePath,
      filename,
      fileSize: file.size,
      // Note: We don't get dimensions from server-side File processing
      // You'd need to use an image processing library like sharp for that
    }
  } catch (error) {
    console.error('Server file save error:', error)
    throw new Error(`Failed to save file to server: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Save multiple files to server storage
export async function saveMultipleToServer(
  files: File[],
  folder: string = 'uploads'
): Promise<ServerUploadResult[]> {
  const savePromises = files.map(file => saveToServer(file, folder))
  return Promise.all(savePromises)
}