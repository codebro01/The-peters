// client/src/components/admin/VideoUploadModal.tsx
import React, { useState } from "react";
import { X, Upload, Video, CheckCircle } from "lucide-react";
import axios from "axios";

interface VideoUploadModalProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  courseId,
  moduleId,
  lessonId,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a video file (MP4, MOV, AVI, etc.)");
        return;
      }

      // Validate file size (500MB max)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("video", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://the-peters.onrender.com/api/videos/upload/${courseId}/${moduleId}/${lessonId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        // Wait a moment to show success
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Upload Video</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!uploading ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop your video file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supported: MP4, MOV, AVI, WMV, MKV • Max: 500MB
                </p>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className={`px-4 py-2 rounded-lg ${
                    file
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Upload Video
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-green-200 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 border-4 border-green-600 rounded-full"
                    style={{
                      clipPath: `inset(0 ${100 - progress}% 0 0)`,
                      transform: "rotate(-90deg)",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">
                    {progress}%
                  </span>
                </div>
              </div>
              <p className="text-gray-600">Uploading video to Cloudinary...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few minutes for large files
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
