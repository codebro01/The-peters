import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Menu,
  X,
  PlayCircle,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader,
  AlertCircle,
  Award,
  Download
} from "lucide-react";
import courseService from "../../services/course.service";
import videoService from "../../services/video.service";
import { Course, Module, Lesson } from "../../types";

export default function CourseLearning() {
  const { slug } = useParams<{ slug: string }>();
  // We can optionally use search params to link to a specific module/lesson
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Curriculum State
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<{ module: Module, lesson: Lesson } | null>(null);
  
  // Content State
  const [videoStreamData, setVideoStreamData] = useState<any>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

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

      if (!data.isEnrolled) {
        // If not enrolled, they shouldn't be here
        navigate(`/courses/${slug}`); // redirect back to overview
        return;
      }

      // Initialize selected lesson from URL or default to first
      const queryModuleId = searchParams.get('m');
      const queryLessonId = searchParams.get('l');

      let initialModule = data.course.modules[0];
      let initialLesson = initialModule?.lessons[0];

      if (queryModuleId && queryLessonId) {
        const foundModule = data.course.modules.find(m => m.id === queryModuleId);
        if (foundModule) {
          const foundLesson = foundModule.lessons.find(l => l.id === queryLessonId);
          if (foundLesson) {
             initialModule = foundModule;
             initialLesson = foundLesson;
          }
        }
      }

      if (initialModule && initialLesson) {
         setExpandedModules([initialModule.id]);
         selectLesson(initialModule, initialLesson, data.course._id);
      }

    } catch (err: any) {
      setError(err.message || "Failed to load course");
    } finally {
      setIsLoading(false);
    }
  };

  const selectLesson = async (module: Module, lesson: Lesson, currentCourseId?: string) => {
    const cid = currentCourseId || course?._id;
    if (!cid) return;

    setActiveLesson({ module, lesson });
    setSearchParams({ m: module.id, l: lesson.id }, { replace: true });

    // Close mobile sidebar if open
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    if (lesson.type === "video") {
      fetchVideoStream(cid, module.id, lesson.id);
    }
  };

  const fetchVideoStream = async (courseId: string, moduleId: string, lessonId: string) => {
    try {
      setIsVideoLoading(true);
      setVideoError(null);
      setVideoStreamData(null);

      // We request 'auto' quality. videoService sends this to the backend.
      const data = await videoService.getVideoStream(courseId, moduleId, lessonId, "hd");
      setVideoStreamData(data);
    } catch (err: any) {
      setVideoError(err.response?.data?.message || err.message || "Failed to load video stream");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Renderers
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Course not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderContentArea = () => {
    if (!activeLesson) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
           <p className="text-gray-500">Select a lesson to start learning.</p>
        </div>
      );
    }

    const { lesson } = activeLesson;

    if (lesson.type === "video") {
       if (isVideoLoading) {
          return (
            <div className="flex-1 flex items-center justify-center bg-black">
              <Loader className="animate-spin text-emerald-500" size={48} />
            </div>
          );
       }
       if (videoError) {
          return (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 px-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Video playback error</h3>
                <p className="text-gray-400 mb-6">{videoError}</p>
                <button 
                  onClick={() => fetchVideoStream(course._id, activeLesson.module.id, lesson.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
                >
                  Retry
                </button>
             </div>
          );
       }
       
       if (videoStreamData) {
         return (
           <div className="flex-1 flex flex-col bg-black">
              <div className="relative w-full aspect-video md:aspect-auto md:flex-1 bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  key={videoStreamData.streamUrl}
                  controls
                  controlsList="nodownload"
                  autoPlay
                  poster={videoStreamData.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  <source src={videoStreamData.streamUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
           </div>
         );
       }

       return null;
    }

    if (lesson.type === "document") {
       const documentUrl = lesson.content?.document?.url;
       if (!documentUrl) {
         return (
           <div className="flex-1 flex items-center justify-center bg-gray-100 p-6 text-center">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
               <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
               <p className="text-gray-700">Document URL is missing.</p>
             </div>
           </div>
         );
       }

       return (
         <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
            <iframe 
               src={`${documentUrl}#toolbar=0`} 
               title={lesson.title}
               className="w-full h-full flex-1 border-0"
               style={{ minHeight: '100%' }}
            />
         </div>
       );
    }

    return (
       <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
             <FileText className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
             <p className="text-gray-500">This lesson type ({lesson.type}) is not supported in the viewer yet.</p>
          </div>
       </div>
    );
  };

  return (
    <div className="h-screen flex flex-col pt-16 bg-white overflow-hidden">
      {/* Top Navigation Bar specific to Learning */}
      <header className="h-16 bg-gray-900 text-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 shadow-md border-b border-gray-800">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate("/dashboard")}
             className="text-gray-300 hover:text-white transition flex items-center"
             title="Back to Dashboard"
           >
              <ArrowLeft className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline font-medium">Dashboard</span>
           </button>
           <div className="h-6 w-px bg-gray-700 mx-2 hidden lg:block"></div>
           <h1 className="text-base lg:text-lg font-bold truncate max-w-[200px] lg:max-w-md" title={course.title}>
             {course.title}
           </h1>
        </div>
        <div className="flex items-center">
           <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="lg:hidden p-2 text-gray-300 hover:text-white"
           >
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative z-0 overflow-y-auto">
           {renderContentArea()}
           
           {/* Lesson details below player/viewer on desktop, inline on mobile */}
           {activeLesson && (
             <div className="p-6 bg-white shrink-0 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.lesson.title}</h2>
                <div className="flex items-center text-sm font-medium text-gray-500">
                   <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md capitalize">
                      {activeLesson.lesson.type}
                   </span>
                   {activeLesson.lesson.duration && (
                     <>
                       <span className="mx-3">•</span>
                       <span>Duration: {activeLesson.lesson.duration}</span>
                     </>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
           <div 
             className="fixed inset-0 bg-black/50 z-30 lg:hidden"
             onClick={() => setIsSidebarOpen(false)}
           />
        )}

        {/* Sidebar Curriculum */}
        <aside 
          className={`
            fixed lg:static inset-y-0 right-0 z-40 w-80 bg-gray-50 border-l border-gray-200 
            flex flex-col h-[calc(100vh-4rem)] lg:h-full transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0 mt-16 lg:mt-0' : 'translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-5 border-b border-gray-200 shrink-0 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
            <div className="text-sm text-gray-500 mt-1">
               {course.modules.length} modules • {
                  course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
               } lessons
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pb-20 lg:pb-0">
             {course.modules.map((module, idx) => {
               const isExpanded = expandedModules.includes(module.id);
               return (
                 <div key={module.id} className="border-b border-gray-200 last:border-b-0 bg-white">
                   <button
                     onClick={() => toggleModule(module.id)}
                     className="w-full px-5 py-4 flex items-start justify-between hover:bg-emerald-50/50 transition bg-gray-50/30"
                   >
                     <div className="flex flex-col text-left pr-4">
                        <span className="text-xs font-semibold uppercase text-emerald-600 mb-1 tracking-wider">
                          Module {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-900 text-balance leading-tight">
                          {module.title}
                        </span>
                     </div>
                     {isExpanded ? (
                       <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                     ) : (
                       <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                     )}
                   </button>
                   
                   {isExpanded && (
                     <div className="bg-white">
                        {module.lessons.map((lesson, lessonIdx) => {
                           const isActive = activeLesson?.lesson.id === lesson.id;
                           return (
                             <button
                               key={lesson.id}
                               onClick={() => selectLesson(module, lesson, course._id)}
                               className={`w-full px-5 py-3 flex items-start hover:bg-emerald-50 transition border-l-4 ${
                                 isActive ? "bg-emerald-50/80 border-emerald-500" : "border-transparent"
                               }`}
                             >
                               <div className="mt-0.5 mr-3 shrink-0">
                                  {lesson.type === 'video' && <Video className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />}
                                  {lesson.type === 'document' && <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />}
                                  {lesson.type === 'quiz' && <Award className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />}
                                  {lesson.type === 'assignment' && <Download className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />}
                               </div>
                               <div className="text-left flex-1 min-w-0">
                                  <div className={`text-sm leading-tight mb-1 truncate ${isActive ? 'font-bold text-emerald-900' : 'font-medium text-gray-700'}`}>
                                    {lessonIdx + 1}. {lesson.title}
                                  </div>
                                  {lesson.duration && (
                                    <div className={`text-xs ${isActive ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                                       {lesson.duration}
                                    </div>
                                  )}
                               </div>
                             </button>
                           );
                        })}
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        </aside>
      </div>
    </div>
  );
}
