// server/src/services/cloudinary.service.ts
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import streamifier from "streamifier";

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadVideo(
    buffer: Buffer,
    filename: string,
    folder: string = "lms"
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: folder,
          public_id: filename.split(".")[0],
          overwrite: true,
          chunk_size: 6000000, // 6MB chunks for better large file handling
          eager: [{ format: "mp4" }, { quality: "auto", format: "mp4" }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Unknown upload error"));
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async uploadDocument(
    buffer: Buffer,
    filename: string,
    folder: string = "lms/documents"
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: folder,
          public_id: filename.split(".")[0],
          overwrite: true,
          format: "pdf",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Unknown upload error"));
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  generateVideoUrl(publicId: string, transformations: any[] = []) {
    return cloudinary.url(publicId, {
      resource_type: "video",
      transformation: transformations,
      secure: true,
    });
  }

  generateThumbnailUrl(publicId: string) {
    return cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        { width: 800, height: 450, crop: "fill" },
        { quality: "auto" },
      ],
      secure: true,
    });
  }

  async deleteVideo(publicId: string) {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  }

  async deleteDocument(publicId: string) {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  }

  // Optional: Add this method if you need signed URLs
  generateSignedUrl(
    publicId: string,
    transformations: any[] = [],
    expirySeconds: number = 3600
  ) {
    return cloudinary.url(publicId, {
      resource_type: "video",
      transformation: transformations,
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expirySeconds,
    });
  }
}

export default new CloudinaryService();
