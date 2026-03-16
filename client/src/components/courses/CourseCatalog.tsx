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

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <section className="bg-gray-50 min-h-screen pb-20">
      {/* Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {previewCourse.title}
                </h3>
                <p className="text-sm font-medium text-emerald-600">Course Preview</p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="aspect-video bg-black relative">
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
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-black text-gray-900">
                  ₦{previewCourse.price.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Secure Lifetime Access
                </div>
              </div>
              <button
                onClick={() => {
                  closePreview();
                  navigate(`/courses/${previewCourse.slug}`);
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative bg-emerald-900 pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-emerald-400 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-orange-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-emerald-800/50 backdrop-blur-md border border-emerald-700/50 rounded-full text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-6 animate-fade-in">
            Expert-Led Training
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
            Agricultural <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Learning Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-12 font-medium">
            Join thousands of successful farmers mastering practical skills from crop production to sustainable agribusiness.
          </p>

          {/* SEARCH BOX */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600"
                  size={24}
                />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white text-gray-900 text-lg shadow-2xl focus:outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE QUICK CATEGORIES & FILTER TOGGLE */}
      <div className="lg:hidden sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="p-3 bg-white border border-gray-200 rounded-xl text-emerald-700 shadow-sm active:scale-95 transition-all"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* DESKTOP FILTERS (STAY AS ASIDE) */}
          <aside className="hidden lg:block w-72 shrink-0">
             <div className="sticky top-32 space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight">Filters</h3>
                    <Filter className="text-emerald-600" size={20} />
                  </div>

                  {/* CATEGORY */}
                  <div className="mb-10">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Skill Area</h4>
                    <div className="space-y-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                            selectedCategory === cat.id
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                              : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
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
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Difficulty</h4>
                    <div className="space-y-1.5">
                      {["all", "Beginner", "Intermediate", "Advanced"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                            selectedLevel === level
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                              : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {level === "all" ? "All Levels" : level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Promo Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="text-lg font-black mb-2 tracking-tight line-clamp-2">New Certification Path!</h4>
                    <p className="text-emerald-100 text-xs mb-4 font-medium opacity-80">Master the business of farming with our expert path.</p>
                    <button className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors">Learn More</button>
                  </div>
                  <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                </div>
             </div>
          </aside>

          {/* COURSES MAIN SECTION */}
          <main className="flex-1 min-w-0">
            {/* COUNTER & SORT */}
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 leading-none">
                {isLoading ? "Fetching courses..." : `${filteredCourses.length} Courses Found`}
              </h2>
              <div className="text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer hidden sm:block">
                Clear all filters
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader className="animate-spin text-emerald-600" size={48} />
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Harvesting Catalog...</span>
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-red-50">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Catalog Unavailable</h3>
                <p className="text-gray-500 font-medium mb-8">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-emerald-500/20"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Courses grid */}
            {!isLoading && !error && (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden group border border-gray-100"
                  >
                    {/* THUMBNAIL */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={getCourseThumbnail(course)}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Price Badge */}
                      <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                        <span className="text-lg font-black text-emerald-700">₦{(course.price || 0).toLocaleString()}</span>
                      </div>

                      {/* Preview Overlay */}
                      <div
                        className="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex transition duration-500 cursor-pointer"
                        onClick={() => openPreview(course)}
                      >
                        <div className="text-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                            <PlayCircle size={32} />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest">Quick Preview</p>
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {course.category}
                        </span>
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {course.level}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black mb-3 tracking-tight group-hover:text-emerald-700 transition">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                        {course.subtitle || course.description}
                      </p>

                      {/* META */}
                      <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 mb-8">
                         <div className="text-center">
                            <div className="text-emerald-700 font-black mb-1 flex justify-center"><Clock size={16}/></div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">{course.duration}</div>
                         </div>
                         <div className="text-center border-x border-gray-100">
                            <div className="text-emerald-700 font-black mb-1 flex justify-center"><BookOpen size={16}/></div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">{course.modules?.length || 0} Modules</div>
                         </div>
                         <div className="text-center">
                            <div className="text-emerald-700 font-black mb-1 flex justify-center"><Users size={16}/></div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">{(course.enrollmentCount || 0).toLocaleString()}</div>
                         </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="w-full bg-gray-900 group-hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center transition-all duration-300"
                      >
                        Enroll Now
                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredCourses.length === 0 && (
              <div className="bg-white rounded-3xl py-24 text-center border border-dashed border-gray-200">
                <BookOpen size={64} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-2xl font-black tracking-tight mb-2">No Courses Matched</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                  We couldn't find any courses matching your current filters. Try resetting them.
                </p>
                <button 
                  onClick={() => {setSelectedCategory('all'); setSelectedLevel('all'); setSearchQuery('')}}
                  className="mt-8 text-emerald-600 font-black uppercase tracking-widest text-sm hover:underline"
                >
                   Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <div 
        className={`fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMobileFilters(false)}
      />
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[120] bg-white rounded-t-[2.5rem] p-8 shadow-2xl transition-transform duration-500 lg:hidden ${
          showMobileFilters ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-black tracking-tight">Advanced Filters</h3>
           <button onClick={() => setShowMobileFilters(false)}><X size={24}/></button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 mb-8">
           {/* Mobile Cat Selection */}
           <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h4>
              <div className="grid grid-cols-2 gap-3">
                 {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                        selectedCategory === cat.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <cat.icon size={14} />
                      <span className="truncate">{cat.name}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Mobile Level Selection */}
           <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Level</h4>
              <div className="grid grid-cols-2 gap-3">
                {["all", "Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                      selectedLevel === level
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {level === "all" ? "All Levels" : level}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <button 
          onClick={() => setShowMobileFilters(false)}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20"
        >
          See Results
        </button>
      </div>
    </section>
  );
}
