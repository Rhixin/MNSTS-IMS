import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UploadResult {
  success: boolean
  url?: string
  public_id?: string
  error?: string
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: {
    folder?: string
    public_id?: string
    transformation?: any[]
  } = {}
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'mnsts-ims',
      public_id: options.public_id,
      transformation: options.transformation || [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      resource_type: 'auto'
    })

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: 'Failed to upload image'
    }
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto',
    ...(options.width && { width: options.width }),
    ...(options.height && { height: options.height }),
    crop: 'fill'
  })
}