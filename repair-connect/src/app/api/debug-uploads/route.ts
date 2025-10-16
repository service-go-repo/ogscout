import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    console.log('🔍 Checking uploads directory:', uploadsDir)
    
    try {
      // Check if uploads directory exists
      await fs.access(uploadsDir)
      
      // Read directory contents
      const userDirs = await fs.readdir(uploadsDir)
      console.log('📁 User directories found:', userDirs)
      
      const result: any = {
        uploadsDir,
        userDirectories: []
      }
      
      // Check each user directory
      for (const userDir of userDirs) {
        const userPath = path.join(uploadsDir, userDir)
        const stat = await fs.stat(userPath)
        
        if (stat.isDirectory()) {
          try {
            const files = await fs.readdir(userPath)
            const fileDetails = []
            
            for (const file of files) {
              const filePath = path.join(userPath, file)
              const fileStat = await fs.stat(filePath)
              fileDetails.push({
                name: file,
                size: fileStat.size,
                url: `/uploads/${userDir}/${file}`,
                fullPath: filePath
              })
            }
            
            result.userDirectories.push({
              userId: userDir,
              files: fileDetails,
              totalFiles: files.length
            })
          } catch (error) {
            console.error(`Error reading user directory ${userDir}:`, error)
          }
        }
      }
      
      return NextResponse.json(result)
      
    } catch (error) {
      return NextResponse.json({
        error: 'Uploads directory not found',
        uploadsDir,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } catch (error) {
    console.error('Debug uploads API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
