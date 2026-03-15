// client/src/services/video.service.ts
import api, { uploadApi } from "./api"; // Fixed import

interface UploadVideoParams {
  courseId: string;
  moduleId: string;
  lessonId: string;
  videoFile: File;
}

interface VideoStreamData {
  streamUrl: string;
  thumbnailUrl: string;
  duration: number;
  title: string;
  isPreview: boolean;
}

class VideoService {
  // Upload video to lesson
  async uploadVideo(params: UploadVideoParams) {
    const { courseId, moduleId, lessonId, videoFile } = params;

    const formData = new FormData();
    formData.append("video", videoFile);

    const response = await uploadApi.post(
      `/videos/upload/${courseId}/${moduleId}/${lessonId}`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          // You can dispatch this to Redux or update state
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      },
    );

    return response.data;
  }

  // Get video stream URL
  async getVideoStream(
    courseId: string,
    moduleId: string,
    lessonId: string,
    quality?: string,
  ) {
    const response = await api.get<{ data: VideoStreamData }>(
      `/videos/stream/${courseId}/${moduleId}/${lessonId}`,
      {
        params: { quality },
      },
    );
    return response.data.data;
  }

  // Update video lesson
  async updateLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    updates: { title?: string; duration?: string; isPreview?: boolean },
  ) {
    const response = await api.put(
      `/videos/${courseId}/${moduleId}/${lessonId}`,
      updates,
    );
    return response.data;
  }

  // Delete video
  async deleteVideo(courseId: string, moduleId: string, lessonId: string) {
    const response = await api.delete(
      `/videos/${courseId}/${moduleId}/${lessonId}`,
    );
    return response.data;
  }

  // Upload thumbnail for a lesson
  async uploadThumbnail(
    courseId: string,
    moduleId: string,
    lessonId: string,
    thumbnailFile: File,
  ) {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    const response = await uploadApi.post(
      `/videos/upload-thumbnail/${courseId}/${moduleId}/${lessonId}`,
      formData,
    );
    return response.data;
  }
}

// Export as default instance
export default new VideoService();
