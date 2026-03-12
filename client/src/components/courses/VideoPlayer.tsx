// client/src/components/courses/VideoPlayer.tsx (Updated)
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoService from "../../services/video.service";
import { Loader, AlertCircle, Home } from "lucide-react";

interface VideoPlayerProps {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVideoEnd?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  courseId: propCourseId,
  moduleId: propModuleId,
  lessonId: propLessonId,
  onTimeUpdate,
  onVideoEnd,
}) => {
  // Get parameters from URL if not provided as props
  const params = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();

  const navigate = useNavigate();

  const courseId = propCourseId || params.courseId;
  const moduleId = propModuleId || params.moduleId;
  const lessonId = propLessonId || params.lessonId;

  const [streamUrl, setStreamUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<string>("auto");
  const [title, setTitle] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      fetchVideoStream();
    } else {
      setError(
        "Missing video parameters. Please select a lesson from a course.",
      );
      setLoading(false);
    }
  }, [courseId, moduleId, lessonId, quality]);

  const fetchVideoStream = async () => {
    try {
      setLoading(true);
      setError(null);

      const videoData = await videoService.getVideoStream(
        courseId!,
        moduleId!,
        lessonId!,
        quality,
      );

      setStreamUrl(videoData.streamUrl);
      setThumbnailUrl(videoData.thumbnailUrl);
      setDuration(videoData.duration);
      setTitle(videoData.title);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const goBackToCourses = () => {
    navigate("/courses");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader
            className="animate-spin text-emerald-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Video
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goBackToCourses}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <div className="flex justify-between items-center">
            <button
              onClick={goBackToCourses}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              ← Back to Courses
            </button>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="px-3 py-1 bg-gray-800 text-white border border-gray-700 rounded text-sm"
            >
              <option value="auto">Auto Quality</option>
              <option value="hd">HD</option>
              <option value="sd">SD</option>
            </select>
          </div>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            key={streamUrl}
            controls
            controlsList="nodownload"
            poster={thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            className="w-full h-full"
          >
            <source src={streamUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="text-sm text-gray-400 flex justify-between items-center">
          <div>
            Duration: {Math.floor(duration / 60)}:
            {(duration % 60).toFixed(0).padStart(2, "0")}
          </div>
          <div className="space-x-4">
            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="hover:text-white"
            >
              Fullscreen (F)
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.playbackRate =
                    videoRef.current.playbackRate === 2 ? 1 : 2;
                }
              }}
              className="hover:text-white"
            >
              2x Speed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
