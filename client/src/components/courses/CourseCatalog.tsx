import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  TrendingUp,
  Award,
  PlayCircle,
  Loader,
  X,
} from "lucide-react";
import { Course } from "../../types";
import courseService from "../../services/course.service";

// Placeholder preview video (public domain)
const PLACEHOLDER_PREVIEW_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function LMSCourseCatalog() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = [
    { id: "all", name: "All Courses", icon: BookOpen },
    { id: "crop", name: "Crop Production", icon: TrendingUp },
    { id: "livestock", name: "Livestock", icon: Users },
    { id: "climate", name: "Climate-Smart", icon: Award },
    { id: "business", name: "Agribusiness", icon: TrendingUp },
  ];

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params: any = {};
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (selectedLevel !== "all") params.level = selectedLevel;
        if (searchQuery) params.search = searchQuery;

        const data = await courseService.getAllCourses(params);
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch courses");
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedLevel, searchQuery]);

  const filteredCourses = courses;

  const getCourseThumbnail = (course: Course) => {
    if (course.thumbnail?.url) return course.thumbnail.url;

    // Fallback to first video lesson thumbnail
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        if (lesson.content?.video?.thumbnail) {
          return lesson.content.video.thumbnail;
        }
      }
    }

    // Ultimate fallback
    return "https://images.unsplash.com/photo-1592982537447-6f2a6a0a38f3?q=80&w=1000&auto=format&fit=crop";
  };

  const getPreviewVideoUrl = (course: Course) => {
    // Use course previewVideo if uploaded, else a placeholder
    if (course.previewVideo?.url) return course.previewVideo.url;
    // Check for first preview lesson video
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        if (lesson.isPreview && lesson.content?.video?.url) {
          return lesson.content.video.url;
        }
      }
    }
    return PLACEHOLDER_PREVIEW_URL;
  };

  const openPreview = (course: Course) => {
    setPreviewCourse(course);
  };

  const closePreview = () => {
    setPreviewCourse(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {previewCourse.title}
                </h3>
                <p className="text-sm text-gray-500">Course Preview</p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                autoPlay
                controlsList="nodownload"
                poster={getCourseThumbnail(previewCourse)}
                src={getPreviewVideoUrl(previewCourse)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  ₦{previewCourse.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  One-time payment
                </span>
              </div>
              <button
                onClick={() => {
                  closePreview();
                  navigate(`/courses/${previewCourse.slug}`);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                View Full Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="bg-emerald-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Agricultural Learning Hub
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto">
            Practical, agricultural courses designed to help farmers and
            agripreneurs succeed.
          </p>

          {/* SEARCH */}
          <div className="max-w-3xl mx-auto mt-10">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-4 gap-10">
        {/* FILTERS */}
        <aside className="bg-white rounded-xl p-6 shadow-sm sticky top-6 h-fit">
          <div className="flex items-center mb-6">
            <Filter className="text-emerald-700 mr-2" />
            <h3 className="text-xl font-bold">Filters</h3>
          </div>

          {/* CATEGORY */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Category</h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition
                  ${
                    selectedCategory === cat.id
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <cat.icon size={18} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL */}
          <div>
            <h4 className="font-semibold mb-3">Level</h4>
            <div className="space-y-2">
              {[
                "all",
                "Beginner",
                "Intermediate",
                "Advanced",
                "All Levels",
              ].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition
                    ${
                      selectedLevel === level
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {level === "all" ? "All Levels" : level}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* COURSES */}
        <main className="lg:col-span-3">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader
                className="animate-spin text-emerald-600 mr-3"
                size={32}
              />
              <span className="text-gray-600 text-lg">
                Loading courses...
              </span>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {/* Courses grid */}
          {!isLoading && !error && (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
                >
                  {/* THUMBNAIL */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={getCourseThumbnail(course)}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Preview Overlay */}
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      onClick={() => openPreview(course)}
                    >
                      <div className="text-center text-white">
                        <PlayCircle size={48} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">Preview Course</p>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize">
                        {course.category}
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.subtitle || course.description}
                    </p>

                    {/* META */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {course.modules?.length || 0}{" "}
                        modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />{" "}
                        {(course.enrollmentCount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* RATING */}
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(course.rating?.average || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-2 font-semibold">
                        {(course.rating?.average || 0).toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-400 text-sm">
                        ({course.rating?.count || 0})
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          ₦{(course.price || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          One-time payment
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-lg font-semibold flex items-center transition"
                      >
                        View Course
                        <ChevronRight size={18} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <BookOpen size={60} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold">No courses found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search.
              </p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
