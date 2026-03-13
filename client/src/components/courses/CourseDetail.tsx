import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Clock,
  BookOpen,
  Users,
  Star,
  Award,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Video,
  Shield,
  Loader,
  Eye,
  Heart,
  Share2,
  Bookmark,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePaystack } from "../../hooks/usePaystack";
import courseService from "../../services/course.service";
import videoService from "../../services/video.service";
import { Course, Lesson } from "../../types";
import VideoPlayer from "./VideoPlayer";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { initializePayment, isProcessing } = usePaystack();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  } | null>(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!slug) {
          setError("Course not found");
          return;
        }

        const data = await courseService.getCourseBySlug(slug);
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);

        // Check if user has bookmarked this course
        if (user) {
          const bookmarks = JSON.parse(
            localStorage.getItem("bookmarks") || "[]"
          );
          setIsBookmarked(bookmarks.includes(data.course._id));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug, user]);

  // Handle payment
  const handlePayment = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (!course) return;

    initializePayment(
      course._id,
      course.price,
      () => {
        // Success callback
        alert("🎉 Payment successful! You are now enrolled in the course.");
        setIsEnrolled(true);
        // Optionally redirect to learning page
        navigate("/dashboard");
      },
      () => {
        // Close callback
        console.log("Payment cancelled by user");
      }
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleBookmark = () => {
    if (!course) return;

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== course._id);
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(course._id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = () => {
    if (navigator.share && course) {
      navigator.share({
        title: course.title,
        text: course.subtitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const playPreviewLesson = (lesson: Lesson) => {
    if (!course || !lesson.isPreview) return;

    const module = course.modules.find((m) =>
      m.lessons.some((l) => l.id === lesson.id)
    );

    if (module) {
      setSelectedLesson({
        courseId: course._id,
        moduleId: module.id,
        lessonId: lesson.id,
      });
      setShowVideoPlayer(true);
    }
  };

  const startLearning = () => {
    if (!course || !isEnrolled) return;

    const firstModule = course.modules[0];
    const firstLesson = firstModule?.lessons[0];

    if (firstModule && firstLesson) {
      navigate(`/learn/${course._id}/${firstModule.id}/${firstLesson.id}`);
    }
  };

  const getTotalVideoDuration = () => {
    if (!course) return 0;

    let totalSeconds = 0;
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (lesson.type === "video" && lesson.content?.video?.duration) {
          totalSeconds += lesson.content.video.duration;
        }
      });
    });
    return totalSeconds;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getVideoCount = () => {
    if (!course) return 0;

    return course.modules.reduce((total, module) => {
      return (
        total +
        module.lessons.filter(
          (lesson) => lesson.type === "video" && lesson.content?.video
        ).length
      );
    }, 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader
            className="animate-spin text-emerald-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The course you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const totalVideoDuration = getTotalVideoDuration();
  const videoCount = getVideoCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Player Modal */}
      {showVideoPlayer && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Preview Lesson</h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setSelectedLesson(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                className="w-full h-full"
                controls
                autoPlay
                controlsList="nodownload"
                poster={course.thumbnail?.url}
                src={(() => {
                  // Find the lesson's video URL, fallback to placeholder
                  const mod = course.modules.find(
                    (m) => m.id === selectedLesson.moduleId
                  );
                  const lesson = mod?.lessons.find(
                    (l) => l.id === selectedLesson.lessonId
                  );
                  return (
                    lesson?.content?.video?.url ||
                    course.previewVideo?.url ||
                    PLACEHOLDER_PREVIEW_URL
                  );
                })()}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Course Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="bg-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {course.level}
                </span>
                <span className="bg-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Video className="w-4 h-4 mr-1" />
                  {videoCount} videos
                </span>
                <span className="bg-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(totalVideoDuration)}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 mb-6">
                {course.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.floor(course.rating.average)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold mr-1">
                    {course.rating.average.toFixed(1)}
                  </span>
                  <span className="text-emerald-200">
                    ({course.rating.count} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2" size={20} />
                  <span>
                    {course.enrollmentCount.toLocaleString()} students enrolled
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {course.instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold">
                    Created by {course.instructor.name}
                  </div>
                  <div className="text-emerald-200 text-sm">
                    {course.instructor.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isBookmarked
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-800 text-emerald-100 hover:bg-emerald-700"
                  }`}
                >
                  <Bookmark
                    className="w-4 h-4"
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg hover:bg-emerald-700"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden sticky top-4">
                <div className="aspect-video relative">
                  <img
                    src={course.thumbnail?.url || "https://images.unsplash.com/photo-1592982537447-6f2a6a0a38f3?q=80&w=1000&auto=format&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <button
                        onClick={() => {
                          const previewLesson = course.modules
                            .flatMap((m) => m.lessons)
                            .find((l) => l.isPreview);
                          if (previewLesson) {
                            playPreviewLesson(previewLesson);
                          }
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 p-4 rounded-full transition-all hover:scale-110"
                      >
                        <PlayCircle className="w-10 h-10 text-emerald-600" />
                      </button>
                    </div>
                  </div>

                <div className="p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₦{course.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mb-6">
                    One-time payment • Lifetime access
                  </div>

                  {!isEnrolled ? (
                    <>
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition font-bold text-lg mb-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" size={20} />
                            Processing...
                          </span>
                        ) : (
                          "Buy Now"
                        )}
                      </button>
                      <div className="text-center text-sm text-gray-600 mb-4">
                        30-day money-back guarantee
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={startLearning}
                      className="w-full px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold text-lg mb-3"
                    >
                      Continue Learning
                    </button>
                  )}

                  <div className="border-t pt-4">
                    <div className="text-sm font-bold text-gray-900 mb-3">
                      What's included:
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <Video
                          className="text-emerald-600 mr-2 flex-shrink-0"
                          size={16}
                        />
                        <span>{videoCount} video lessons</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock
                          className="text-emerald-600 mr-2 flex-shrink-0"
                          size={16}
                        />
                        <span>
                          {formatDuration(totalVideoDuration)} total duration
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <BookOpen
                          className="text-emerald-600 mr-2 flex-shrink-0"
                          size={16}
                        />
                        <span>{course.modules.length} learning modules</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Award
                          className="text-emerald-600 mr-2 flex-shrink-0"
                          size={16}
                        />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Shield className="mr-2 text-emerald-600" size={16} />
                      <span>Secured by Paystack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-semibold capitalize transition border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "text-emerald-600 border-emerald-600"
                    : "text-gray-600 border-transparent hover:text-emerald-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle
                          className="text-emerald-600 mr-3 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <span className="text-gray-700">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Course Description
                  </h2>
                  <div className="text-gray-700 space-y-4 leading-relaxed">
                    <p>{course.description}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start text-gray-700">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Course Curriculum
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <span className="flex items-center">
                      <BookOpen className="mr-2" size={16} />
                      {course.modules.length} modules
                    </span>
                    <span className="flex items-center">
                      <Video className="mr-2" size={16} />
                      {videoCount} video lessons
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-2" size={16} />
                      {formatDuration(totalVideoDuration)} total duration
                    </span>
                  </div>
                </div>

                <div className="divide-y">
                  {course.modules.map((module, idx) => {
                    const moduleVideos = module.lessons.filter(
                      (l) => l.type === "video" && l.content?.video
                    ).length;
                    const moduleDuration = module.lessons.reduce(
                      (total, lesson) => {
                        if (
                          lesson.type === "video" &&
                          lesson.content?.video?.duration
                        ) {
                          return total + lesson.content.video.duration;
                        }
                        return total;
                      },
                      0
                    );

                    return (
                      <div key={module.id}>
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-600">
                              {idx + 1}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900">
                                {module.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span>{module.lessons.length} lessons</span>
                                <span>•</span>
                                {moduleVideos > 0 && (
                                  <>
                                    <span className="flex items-center">
                                      <Video className="mr-1" size={12} />
                                      {moduleVideos} videos
                                    </span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{formatDuration(moduleDuration)}</span>
                              </div>
                            </div>
                          </div>
                          {expandedModule === module.id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </button>

                        {expandedModule === module.id && (
                          <div className="bg-gray-50 px-6 py-4">
                            {module.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between py-3 border-b last:border-b-0"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-sm">
                                    {lessonIdx + 1}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lesson.type === "video" && (
                                      <Video
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                    {lesson.type === "document" && (
                                      <FileText
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                    {lesson.type === "quiz" && (
                                      <Award
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                    {lesson.type === "assignment" && (
                                      <Download
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {lesson.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {lesson.duration}
                                      {lesson.type === "video" &&
                                        lesson.content?.video && (
                                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                            HD
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  {lesson.isPreview ? (
                                    <button
                                      onClick={() => playPreviewLesson(lesson)}
                                      className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 flex items-center gap-1"
                                    >
                                      <Eye size={14} />
                                      Preview
                                    </button>
                                  ) : !isEnrolled ? (
                                    <div className="flex items-center text-gray-400">
                                      <Lock size={16} />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/learn/${course._id}/${module.id}/${lesson.id}`
                                        )
                                      }
                                      className="text-emerald-600 cursor-pointer hover:text-emerald-700"
                                      title="Start learning"
                                    >
                                      <PlayCircle size={18} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === "instructor" && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  About the Instructor
                </h2>
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {course.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {course.instructor.title}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {course.instructor.bio
                        ? `${course.instructor.bio.substring(0, 200)}...`
                        : "Expert in this field with years of teaching experience"}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {course.level} Level
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Student Feedback
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {course.rating.average.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={24}
                            className={
                              i < Math.floor(course.rating.average)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <div className="text-gray-600">
                        {course.rating.count} ratings
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center">
                          <div className="text-sm text-gray-600 w-8">
                            {star} star
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: "70%" }} // This should come from actual data
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <p className="text-gray-600">
                    Reviews will be available after course launch...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium text-gray-900">
                      {course.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {course.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium text-gray-900">
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">
                  Course Features
                </h3>
                <div className="space-y-3">
                  {course.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <CheckCircle
                        className="text-emerald-600 mr-2 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isEnrolled && (
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-white mb-3">
                    Ready to start learning?
                  </h3>
                  <p className="text-emerald-100 text-sm mb-4">
                    Join {course.enrollmentCount.toLocaleString()} other
                    students who have already enrolled
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-white text-emerald-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin mr-2" size={20} />
                        Processing...
                      </span>
                    ) : (
                      `Enroll Now - ₦${course.price.toLocaleString()}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder preview video
const PLACEHOLDER_PREVIEW_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function getTotalDuration() {
  return 0;
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
