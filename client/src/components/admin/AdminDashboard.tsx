import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  BarChart3,
  BookOpen,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Upload,
  Video,
  FileText,
  CheckCircle,
  PlayCircle,
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Star,
  Package,
  ShoppingBag,
  Truck,
  MapPin,
  Phone
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration: number;
  format: string;
  resource_type: string;
  bytes: number;
  width: number;
  height: number;
  thumbnail_url?: string;
}

// Interfaces
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

interface VideoContent {
  url: string;
  publicId: string;
  duration: number;
  thumbnail?: string;
  format?: string;
}

interface LessonContent {
  video?: VideoContent;
  document?: {
    url: string;
    publicId: string;
  };
  text?: string;
  questions?: any[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document" | "quiz" | "assignment";
  order: number;
  isPreview: boolean;
  content: LessonContent;
  isPaid: boolean;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  category: "crop" | "livestock" | "climate" | "business";
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string;
  language: string;
  isPublished: boolean;
  enrollmentCount: number;
  features: string[];
  requirements: string[];
  outcomes: string[];
  modules: Module[];
  slug: string;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Enrollment {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  progress: {
    progressPercentage: number;
  };
  enrolledAt: string;
  paymentStatus: string;
  status?: string;
  createdAt?: string;
}

interface Payment {
  _id: string;
  paymentReference: string;
  amount: number;
  currency: string;
  status: "success" | "pending" | "failed";
  metadata?: {
    customerName?: string;
    email?: string;
  };
  paidAt?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: {
    url: string;
    publicId: string;
  };
  isAvailable: boolean;
  createdAt?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
  };
  paymentStatus: string;
  paymentReference: string;
  orderStatus: string;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  recentEnrollments?: any[];
  topCourses?: any[];
}

// API client
const api = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("token");
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data.data || data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getProfile: () => api.request<{ user: User }>("/auth/me"),
  getDashboardStats: () => api.request<DashboardStats>("/admin/stats"),
  getCourses: () => api.request<Course[]>("/admin/courses"),
  createCourse: (data: Partial<Course>) =>
    api.request<Course>("/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCourse: (id: string, data: Partial<Course>) =>
    api.request<Course>(`/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCourse: (id: string) =>
    api.request(`/admin/courses/${id}`, { method: "DELETE" }),
  togglePublish: (id: string) =>
    api.request(`/admin/courses/${id}/publish`, { method: "PATCH" }),

  // Video upload with progress tracking via XMLHttpRequest
  uploadVideo: (
    file: File,
    courseId: string,
    moduleId: string,
    lessonId: string,
    onProgress?: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("video", file);
      const token = localStorage.getItem("token");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/videos/upload/${courseId}/${moduleId}/${lessonId}`);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || "Upload failed"));
          }
        } catch {
          reject(new Error("Failed to parse server response"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  updateVideoLesson: (
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: any
  ) =>
    api.request(`/videos/${courseId}/${moduleId}/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteVideo: (courseId: string, moduleId: string, lessonId: string) =>
    api.request(`/videos/${courseId}/${moduleId}/${lessonId}`, {
      method: "DELETE",
    }),

  // Document upload with progress tracking via XMLHttpRequest
  uploadDocument: (
    file: File,
    courseId: string,
    moduleId: string,
    lessonId: string,
    onProgress?: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("document", file);
      const token = localStorage.getItem("token");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/videos/upload-document/${courseId}/${moduleId}/${lessonId}`);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || "Upload failed"));
          }
        } catch {
          reject(new Error("Failed to parse server response"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  getVideoStream: (courseId: string, moduleId: string, lessonId: string) =>
    api.request<{ streamUrl: string; thumbnailUrl: string; duration: number }>(
      `/videos/stream/${courseId}/${moduleId}/${lessonId}`
    ),

  // Module management
  addModule: (courseId: string, data: Partial<Module>) =>
    api.request(`/admin/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateModule: (courseId: string, moduleId: string, data: Partial<Module>) =>
    api.request(`/admin/modules/${courseId}/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteModule: (courseId: string, moduleId: string) =>
    api.request(`/admin/modules/${courseId}/${moduleId}`, { method: "DELETE" }),

  // User management
  getUsers: () => api.request<User[]>("/admin/users"),
  toggleUserStatus: (id: string) =>
    api.request(`/admin/users/${id}/toggle-status`, { method: "PATCH" }),

  // Analytics
  getEnrollments: () => api.request<Enrollment[]>("/admin/enrollments"),
  getPayments: () => api.request<Payment[]>("/admin/payments"),

  // Products
  getProducts: () => api.request<Product[]>("/admin/products"),
  createProduct: (data: any) =>
    api.request<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: any) =>
    api.request<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    api.request(`/admin/products/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: () => api.request<Order[]>("/admin/orders"),
};

// Document Uploader Component
const DocumentUploader: React.FC<{
  courseId: string;
  moduleId: string;
  lessonId: string;
  onUploadComplete: (result: any) => void;
  existingDocument?: { url: string; publicId: string };
  onRemoveDocument: () => void;
}> = ({
  courseId,
  moduleId,
  lessonId,
  onUploadComplete,
  existingDocument,
  onRemoveDocument,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Document file must be less than 20MB");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await api.uploadDocument(
        file,
        courseId,
        moduleId,
        lessonId,
        (percent) => setProgress(percent)
      );
      onUploadComplete(result);
      setProgress(100);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="document-uploader p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Lesson Document (PDF)
        </h5>
        {existingDocument && !uploading && (
          <button
            type="button"
            onClick={onRemoveDocument}
            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Remove Document
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {!existingDocument && !uploading && (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 20MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {uploading && (
        <div className="w-full bg-white p-4 rounded-lg border">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading document...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {existingDocument && !uploading && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center grow-0 shrink-0">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Document Uploaded
              </p>
              <div className="flex gap-4 mt-1">
                <a
                  href={existingDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  View Document
                </a>
              </div>
            </div>
            <div>
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded flex items-center gap-1 bg-blue-50">
                <Upload className="w-4 h-4" />
                Replace
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Video Uploader Component
const VideoUploader: React.FC<{
  courseId: string;
  moduleId: string;
  lessonId: string;
  onUploadComplete: (data: CloudinaryUploadResult) => void;
  existingVideo?: VideoContent;
  onRemoveVideo?: () => void;
}> = ({
  courseId,
  moduleId,
  lessonId,
  onUploadComplete,
  existingVideo,
  onRemoveVideo,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid video file (MP4, MOV, AVI, MKV, WebM)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video file must be less than 100MB");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const result = await api.uploadVideo(
        file, courseId, moduleId, lessonId,
        (percent) => setProgress(percent)
      );
      onUploadComplete(result);
      setProgress(100);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    } finally {
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="video-uploader p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-800 flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Content
        </h4>
        {existingVideo && onRemoveVideo && (
          <button
            type="button"
            onClick={onRemoveVideo}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Remove Video
          </button>
        )}
      </div>

      {existingVideo ? (
        <div className="bg-white p-4 rounded border">
          <div className="flex items-start gap-4 mb-3">
            {existingVideo.thumbnail ? (
              <img
                src={existingVideo.thumbnail}
                alt="Video thumbnail"
                className="w-32 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800">
                  Video Uploaded
                </span>
                <span className="text-xs text-gray-500">
                  {Math.floor(existingVideo.duration / 60)}:
                  {(existingVideo.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Format:</span>{" "}
                  {existingVideo.format || "MP4"}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 font-medium">Ready</span>
                </div>
              </div>
              <div className="mt-2">
                <a
                  href={existingVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Preview Video
                </a>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Video is ready for students to watch.
          </p>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
            <Upload className="w-4 h-4" />
            Replace Video
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                MP4, MOV, AVI, MKV, or WebM • Max 100MB
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                Select Video File
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {previewUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <video
                src={previewUrl}
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}

          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Lesson Editor Component
const LessonEditor: React.FC<{
  lesson: Lesson;
  courseId: string;
  moduleId: string;
  lessonIndex: number;
  onUpdate: (index: number, updates: Partial<Lesson>) => void;
  onDelete: (index: number) => void;
}> = ({ lesson, courseId, moduleId, lessonIndex, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = (result: any) => {
    // The server returns { lesson: {...}, videoInfo: {...} }
    const videoInfo = result.videoInfo || result;
    const lessonData = result.lesson;

    // Use lesson data from server (already saved to DB) or fall back to videoInfo
    const videoUrl = lessonData?.content?.video?.url || videoInfo.url || videoInfo.secure_url;
    const videoPublicId = lessonData?.content?.video?.publicId || videoInfo.public_id;
    const videoDuration = lessonData?.content?.video?.duration || videoInfo.duration || 0;
    const videoThumbnail = lessonData?.content?.video?.thumbnail || videoInfo.thumbnail;
    const videoFormat = lessonData?.content?.video?.format || videoInfo.format;

    const durationInSeconds = videoDuration;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    const durationFormatted = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    onUpdate(lessonIndex, {
      duration: durationFormatted,
      type: "video",
      content: {
        video: {
          url: videoUrl,
          publicId: videoPublicId,
          duration: durationInSeconds,
          thumbnail:
            videoThumbnail ||
            (videoUrl ? videoUrl.replace(/\.(mp4|mov|avi|wmv)$/, ".jpg") : ""),
          format: videoFormat,
        },
      },
    });
  };

  const handleRemoveVideo = async () => {
    if (window.confirm("Are you sure you want to remove this video?")) {
      try {
        await api.deleteVideo(courseId, moduleId, lesson.id);
        onUpdate(lessonIndex, {
          type: "document",
          content: {},
        });
      } catch (error) {
        console.error("Failed to delete video:", error);
        alert("Failed to remove video");
      }
    }
  };

  const handleDocumentUpload = (result: any) => {
    const docInfo = result.documentInfo || result;
    const lessonData = result.lesson;

    const docUrl = lessonData?.content?.document?.url || docInfo.url;
    const docPublicId = lessonData?.content?.document?.publicId || docInfo.publicId || docInfo.public_id;

    onUpdate(lessonIndex, {
      type: "document",
      content: {
        document: {
          url: docUrl,
          publicId: docPublicId,
        },
      },
    });
  };

  const handleRemoveDocument = () => {
    if (window.confirm("Are you sure you want to remove this document?")) {
      onUpdate(lessonIndex, {
        type: "document",
        content: {},
      });
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
              {lessonIndex + 1}
            </div>
            <div>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) =>
                  onUpdate(lessonIndex, { title: e.target.value })
                }
                className="font-medium text-gray-800 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-b focus:border-gray-300"
                placeholder="Lesson title"
              />
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    lesson.type === "video"
                      ? "bg-blue-100 text-blue-800"
                      : lesson.type === "document"
                      ? "bg-gray-100 text-gray-800"
                      : lesson.type === "quiz"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {lesson.type}
                </span>
                {lesson.isPreview && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Preview
                  </span>
                )}
                {lesson.content?.video && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Video Ready
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{lesson.duration}</span>
            <button
              type="button"
              onClick={() => onDelete(lessonIndex)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pl-11 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={lesson.type}
                  onChange={(e) =>
                    onUpdate(lessonIndex, {
                      type: e.target.value as Lesson["type"],
                      content: e.target.value === "video" ? lesson.content : {},
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="video">Video Lesson</option>
                  <option value="document">Document</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={lesson.duration}
                  onChange={(e) =>
                    onUpdate(lessonIndex, { duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., 15:30"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={lesson.isPreview}
                    onChange={(e) =>
                      onUpdate(lessonIndex, { isPreview: e.target.checked })
                    }
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  Preview Lesson (Free)
                </label>
              </div>
            </div>

            {lesson.type === "video" && (
              <VideoUploader
                courseId={courseId}
                moduleId={moduleId}
                lessonId={lesson.id}
                onUploadComplete={handleVideoUpload}
                existingVideo={lesson.content?.video}
                onRemoveVideo={handleRemoveVideo}
              />
            )}

            {lesson.type === "document" && (
              <DocumentUploader
                courseId={courseId}
                moduleId={moduleId}
                lessonId={lesson.id}
                onUploadComplete={handleDocumentUpload}
                existingDocument={lesson.content?.document}
                onRemoveDocument={handleRemoveDocument}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Module Editor Component
const ModuleEditor: React.FC<{
  module: Module;
  courseId: string;
  moduleIndex: number;
  onUpdate: (
    index: number,
    updates: Partial<Module>,
    shouldAutoSave?: boolean
  ) => void;
  onDelete: (index: number) => void;
}> = ({ module, courseId, moduleIndex, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${module.lessons.length + 1}`,
      duration: "10:00",
      type: "video",
      order: module.lessons.length + 1,
      isPreview: false,
      isPaid: true,
      content: {},
    };

    onUpdate(
      moduleIndex,
      {
        lessons: [...module.lessons, newLesson],
      },
      true // Auto-save when adding lesson so the ID exists on the server before upload
    );
  };

  const updateLesson = (lessonIndex: number, updates: Partial<Lesson>) => {
    const updatedLessons = [...module.lessons];
    updatedLessons[lessonIndex] = {
      ...updatedLessons[lessonIndex],
      ...updates,
    };
    onUpdate(moduleIndex, { lessons: updatedLessons });
  };

  const deleteLesson = (lessonIndex: number) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      const updatedLessons = module.lessons.filter((_, i) => i !== lessonIndex);
      onUpdate(moduleIndex, { lessons: updatedLessons }, true);
    }
  };

  return (
    <div className="border rounded-lg bg-white mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
              {moduleIndex + 1}
            </div>
            <div>
              <input
                type="text"
                value={module.title}
                onChange={(e) =>
                  onUpdate(moduleIndex, { title: e.target.value })
                }
                className="font-medium text-gray-800 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-b focus:border-gray-300"
                placeholder="Module title"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {module.lessons.length} lessons • {module.duration}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(moduleIndex)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pl-11">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) =>
                    onUpdate(moduleIndex, { title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={module.duration}
                  onChange={(e) =>
                    onUpdate(moduleIndex, { duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., 2 hours 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={module.order}
                  onChange={(e) =>
                    onUpdate(moduleIndex, {
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  min="1"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-700">Lessons</h5>
                <button
                  type="button"
                  onClick={addLesson}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>

              <div className="space-y-3">
                {module.lessons.map((lesson, lessonIndex) => (
                  <LessonEditor
                    key={lesson.id}
                    lesson={lesson}
                    courseId={courseId}
                    moduleId={module.id}
                    lessonIndex={lessonIndex}
                    onUpdate={updateLesson}
                    onDelete={deleteLesson}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Course Editor Modal
const CourseEditorModal: React.FC<{
  course: Course | null;
  onClose: () => void;
  onSave: (course: Partial<Course>) => Promise<void>;
}> = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: course?.title || "",
    subtitle: course?.subtitle || "",
    description: course?.description || "",
    price: course?.price || 0,
    category: course?.category || "crop",
    level: course?.level || "Beginner",
    duration: course?.duration || "",
    language: course?.language || "English",
    features: course?.features || [],
    requirements: course?.requirements || [],
    outcomes: course?.outcomes || [],
    modules: course?.modules || [],
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save course:", error);
    } finally {
      setSaving(false);
    }
  };

  const addModule = async () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Module ${(formData.modules?.length || 0) + 1}`,
      duration: "0 hours",
      order: (formData.modules?.length || 0) + 1,
      lessons: [],
    };

    const updatedModules = [...(formData.modules || []), newModule];
    setFormData((prev) => ({
      ...prev,
      modules: updatedModules,
    }));

    if (course?._id) {
      try {
        await api.updateCourse(course._id, { ...formData, modules: updatedModules });
      } catch (err) {
        console.error("Auto-save module failed:", err);
      }
    }
  };

  const updateModule = async (
    index: number,
    updates: Partial<Module>,
    shouldAutoSave = false
  ) => {
    const updatedModules = [...(formData.modules || [])];
    updatedModules[index] = { ...updatedModules[index], ...updates };
    setFormData((prev) => ({ ...prev, modules: updatedModules }));

    if (shouldAutoSave && course?._id) {
      try {
        await api.updateCourse(course._id, { ...formData, modules: updatedModules });
      } catch (err) {
        console.error("Auto-save update failed:", err);
      }
    }
  };

  const deleteModule = async (index: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this module and all its lessons?"
      )
    ) {
      const updatedModules = (formData.modules || []).filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({ ...prev, modules: updatedModules }));

      if (course?._id) {
        try {
          await api.updateCourse(course._id, { ...formData, modules: updatedModules });
        } catch (err) {
          console.error("Auto-save delete failed:", err);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {course ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left sidebar - Tabs */}
          <div className="w-48 border-r bg-gray-50">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab("details")}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
                  activeTab === "details"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Course Details
              </button>
              <button
                onClick={() => setActiveTab("modules")}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
                  activeTab === "modules"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Modules & Lessons
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
                  activeTab === "settings"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtitle *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subtitle: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₦) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="e.g., 8 weeks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.language}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                        placeholder="e.g., English"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as Course["category"],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="crop">Crop</option>
                        <option value="livestock">Livestock</option>
                        <option value="climate">Climate</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level *
                      </label>
                      <select
                        required
                        value={formData.level}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            level: e.target.value as Course["level"],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Course Content
                    </h3>
                    <button
                      type="button"
                      onClick={addModule}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Module
                    </button>
                  </div>

                  {formData.modules && formData.modules.length > 0 ? (
                    <div className="space-y-4">
                      {formData.modules.map((module, index) => (
                        <ModuleEditor
                          key={module.id}
                          module={module}
                          courseId={course?._id || "new-course"}
                          moduleIndex={index}
                          onUpdate={updateModule}
                          onDelete={deleteModule}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">No modules added yet</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Start by adding modules to structure your course content
                      </p>
                      <button
                        type="button"
                        onClick={addModule}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Add First Module
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features (one per line)
                    </label>
                    <textarea
                      value={formData.features?.join("\n") || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          features: e.target.value
                            .split("\n")
                            .filter((f) => f.trim()),
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Lifetime access&#10;Certificate of completion"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements (one per line)
                    </label>
                    <textarea
                      value={formData.requirements?.join("\n") || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requirements: e.target.value
                            .split("\n")
                            .filter((r) => r.trim()),
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Basic farming knowledge&#10;Internet connection"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Learning Outcomes (one per line)
                    </label>
                    <textarea
                      value={formData.outcomes?.join("\n") || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          outcomes: e.target.value
                            .split("\n")
                            .filter((o) => o.trim()),
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Master crop rotation techniques&#10;Understand soil management"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : course ? (
                    "Update Course"
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Editor Modal
const ProductEditorModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onSave: (product: any) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "Fertilizer",
    stock: product?.stock || 0,
    image: product?.image || { url: "", publicId: "" },
    isAvailable: product?.isAvailable !== undefined ? product.isAvailable : true,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {["Fertilizer", "Seed", "Tool", "Machinery", "Livestock", "Other"].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
               <select
                 value={formData.isAvailable ? "available" : "unavailable"}
                 onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "available" })}
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
               >
                 <option value="available">Available</option>
                 <option value="unavailable">Unavailable</option>
               </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                required
                value={formData.image.url}
                onChange={(e) => setFormData({ ...formData, image: { ...formData.image, url: e.target.value } })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : (product ? "Save Changes" : "Add Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}> = ({ course, onEdit, onDelete, onTogglePublish }) => {
  const countVideos = () => {
    let count = 0;
    course.modules?.forEach((module) => {
      module.lessons?.forEach((lesson) => {
        if (lesson.type === "video" && lesson.content?.video) {
          count++;
        }
      });
    });
    return count;
  };

  const videoCount = countVideos();

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{course.title}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                course.isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
              {course.category}
            </span>
            {videoCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                <Video className="w-3 h-3" />
                {videoCount} video{videoCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{course.subtitle}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>₦{course.price.toLocaleString()}</span>
            <span>•</span>
            <span>{course.level}</span>
            <span>•</span>
            <span>{course.enrollmentCount || 0} students</span>
            <span>•</span>
            <span>{course.modules?.length || 0} modules</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePublish(course._id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title={course.isPublished ? "Unpublish" : "Publish"}
          >
            {course.isPublished ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onEdit(course)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(course._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {course.modules && course.modules.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Course Content</h4>
          <div className="space-y-2">
            {course.modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs">
                    {moduleIndex + 1}
                  </div>
                  <span className="text-gray-800">{module.title}</span>
                  <span className="text-gray-500 text-xs">
                    ({module.lessons?.length || 0} lessons)
                  </span>
                </div>
                <span className="text-gray-500 text-xs">{module.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "courses") loadCourses();
    if (activeTab === "users") loadUsers();
    if (activeTab === "enrollments") loadEnrollments();
    if (activeTab === "payments") loadPayments();
    if (activeTab === "products") loadProducts();
    if (activeTab === "orders") loadOrders();
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        api.getProfile(),
        api.getDashboardStats(),
      ]);
      setAdmin(profileData.user || profileData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadEnrollments = async () => {
    try {
      const data = await api.getEnrollments();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await api.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payments:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const handleCreateProduct = async (formData: any) => {
    try {
      await api.createProduct(formData);
      await loadProducts();
      alert("Product created successfully!");
    } catch (err: any) {
      alert("Failed to create product: " + (err?.message || "Unknown error"));
      throw err;
    }
  };

  const handleUpdateProduct = async (id: string, formData: any) => {
    try {
      await api.updateProduct(id, formData);
      await loadProducts();
      alert("Product updated successfully!");
    } catch (err: any) {
      alert("Failed to update product: " + (err?.message || "Unknown error"));
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
      alert("Product deleted successfully!");
    } catch (err: any) {
      alert("Failed to delete product: " + (err?.message || "Unknown error"));
    }
  };

  const handleCreateCourse = async (formData: Partial<Course>) => {
    try {
      await api.createCourse(formData);
      await loadCourses();
      alert("Course created successfully!");
    } catch (err: any) {
      alert("Failed to create course: " + (err?.message || "Unknown error"));
      throw err;
    }
  };

  const handleUpdateCourse = async (id: string, formData: Partial<Course>) => {
    try {
      await api.updateCourse(id, formData);
      await loadCourses();
      alert("Course updated successfully!");
    } catch (err: any) {
      alert("Failed to update course: " + (err?.message || "Unknown error"));
      throw err;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.deleteCourse(id);
      await loadCourses();
      alert("Course deleted successfully!");
    } catch (err: any) {
      alert("Failed to delete course: " + (err?.message || "Unknown error"));
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.togglePublish(id);
      await loadCourses();
    } catch (err: any) {
      alert(
        "Failed to toggle publish status: " + (err?.message || "Unknown error")
      );
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      await api.toggleUserStatus(id);
      await loadUsers();
    } catch (err: any) {
      alert(
        "Failed to toggle user status: " + (err?.message || "Unknown error")
      );
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      `${enrollment.userId?.firstName} ${enrollment.userId?.lastName}`
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPayments = payments.filter(
    (payment) =>
      payment.metadata?.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (order) =>
      order.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.userId?.firstName} ${order.userId?.lastName}`
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadInitialData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {admin?.firstName} {admin?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {admin?.role}
                </p>
              </div>
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.firstName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {admin?.firstName?.[0]}
                    {admin?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {["overview", "courses", "users", "enrollments", "payments", "products", "orders"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{(stats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCourses || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalStudents || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEnrollments || 0}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Enrollments */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Recent Enrollments</h3>
                  <button 
                    onClick={() => setActiveTab('enrollments')}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentEnrollments?.map((enrollment: any) => (
                        <tr key={enrollment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.userId?.firstName} {enrollment.userId?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{enrollment.userId?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {enrollment.courseId?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {(!stats.recentEnrollments || stats.recentEnrollments.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                            No recent enrollments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Performing Courses */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="font-semibold text-gray-900">Top Performing Courses</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {stats.topCourses?.map((course: any) => (
                      <div key={course._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{course.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{course.enrollmentCount} students</span>
                            <span>•</span>
                            <span>₦{course.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {course.rating?.average || '0.0'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!stats.topCourses || stats.topCourses.length === 0) && (
                      <div className="text-center py-10 text-gray-500">
                        No course data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowCourseModal(true);
                }}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            </div>

            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={(course) => {
                    setEditingCourse(course);
                    setShowCourseModal(true);
                  }}
                  onDelete={handleDeleteCourse}
                  onTogglePublish={handleTogglePublish}
                />
              ))}

              {filteredCourses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No courses found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <span className="text-green-600 font-medium text-sm">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(user._id)}
                          className={`text-sm px-3 py-1 rounded ${
                            user.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "enrollments" && (
          <div>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search enrollments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {enrollment.userId ? (
                          <>
                            {enrollment.userId.firstName} {enrollment.userId.lastName}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {enrollment.courseId?.title || "N/A"}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress?.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {enrollment.progress?.progressPercentage || 0}%
                          </span>
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(
                          enrollment.enrolledAt || enrollment.createdAt!
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          enrollment.paymentStatus === 'completed' 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {enrollment.paymentStatus || enrollment.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No enrollments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {payment.metadata?.customerName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.metadata?.email || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {payment.paymentReference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            payment.status === "success"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(
                          payment.paidAt || payment.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No payments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image?.url && (
                            <img src={product.image.url} alt={product.name} className="w-10 h-10 rounded object-cover mr-3" />
                          )}
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₦{(product.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID / Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{order.paymentReference}</div>
                        <div className="text-xs text-gray-500">{order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{order.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₦{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 text-xs rounded-full block w-fit ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full block w-fit ${order.orderStatus === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No orders found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showCourseModal && (
        <CourseEditorModal
          course={editingCourse}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
          }}
          onSave={async (data) => {
            if (editingCourse) {
              await handleUpdateCourse(editingCourse._id, data);
            } else {
              await handleCreateCourse(data);
            }
          }}
        />
      )}

      {showProductModal && (
        <ProductEditorModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={async (data) => {
            if (editingProduct) {
              await handleUpdateProduct(editingProduct._id, data);
            } else {
              await handleCreateProduct(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
