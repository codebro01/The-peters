// client/src/components/admin/VideoUploader.tsx
import React, { useState } from "react";
import videoService from "../../services/video.service";

interface VideoUploaderProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  onUploadComplete: (data: any) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  courseId,
  moduleId,
  lessonId,
  onUploadComplete,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file");
        return;
      }

      setVideoFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await videoService.uploadVideo({
        courseId,
        moduleId,
        lessonId,
        videoFile,
      });

      onUploadComplete(result.data);

      // Reset form
      setVideoFile(null);
      const fileInput = document.getElementById(
        "video-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload video");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="video-uploader p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Upload Video</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Video File
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Supports: MP4, AVI, MOV, WMV (Max: 100MB)
          </p>
        </div>

        {videoFile && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm">
              <strong>Selected:</strong> {videoFile.name}
            </p>
            <p className="text-xs text-gray-600">
              Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {uploading && (
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!videoFile || uploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${
              !videoFile || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>
    </div>
  );
};

export default VideoUploader;
