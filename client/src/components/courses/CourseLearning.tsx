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
import { Course, Module, Lesson } from "../../types";

export default function CourseLearning() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Curriculum State
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<{ module: Module, lesson: Lesson } | null>(null);
  
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
        navigate(`/courses/${slug}`);
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
         selectLesson(initialModule, initialLesson);
      }

    } catch (err: any) {
      setError(err.message || "Failed to load course");
    } finally {
      setIsLoading(false);
    }
  };

  const selectLesson = (module: Module, lesson: Lesson) => {
    setActiveLesson({ module, lesson });
    setSearchParams({ m: module.id, l: lesson.id }, { replace: true });

    // Close mobile sidebar if open
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
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
       const videoUrl = lesson.content?.video?.url;
       
       if (!videoUrl) {
          return (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 px-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Video not found</h3>
                <p className="text-gray-400">The video link for this lesson is missing.</p>
             </div>
          );
       }
       
       return (
         <div className="flex-1 flex flex-col bg-black">
            <div className="relative w-full h-full md:flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                key={videoUrl}
                controls
                controlsList="nodownload"
                autoPlay
                poster={lesson.content.video?.thumbnail || course.thumbnail?.url}
                className="max-w-full max-h-full"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
         </div>
       );
    }

    if (lesson.type === "document") {
       const documentUrl = lesson.content?.document?.url;
       if (!documentUrl) {
         return (
           <div className="flex-1 flex items-center justify-center bg-gray-100 p-6 text-center text-balance">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
               <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
               <p className="text-gray-700 font-medium">This document is not available for preview yet.</p>
             </div>
           </div>
         );
       }

       const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`;

       return (
         <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
            <iframe 
               src={viewerUrl} 
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
             <p className="text-gray-500">This lesson type ({lesson.type}) is for interactive learning. Please follow the instructions provided by your instructor.</p>
          </div>
       </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Navigation Bar specific to Learning */}
      <header className="h-16 bg-gray-900 text-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate("/dashboard")}
             className="text-gray-300 hover:text-white transition flex items-center"
             title="Back to Dashboard"
           >
              <ArrowLeft className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline font-medium text-sm">Dashboard</span>
           </button>
           <div className="h-6 w-px bg-gray-700 mx-1 hidden lg:block"></div>
           <h1 className="text-sm lg:text-base font-bold truncate max-w-[180px] lg:max-w-md" title={course.title}>
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
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative z-0 overflow-y-auto">
           <div className="flex-1 flex flex-col lg:p-6">
              <div className="bg-black w-full aspect-video lg:rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                {renderContentArea()}
              </div>

              {/* Lesson details below player */}
              {activeLesson && (
                <div className="p-6 lg:px-0 bg-transparent shrink-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{activeLesson.lesson.title}</h2>
                            <div className="flex items-center text-xs font-bold text-slate-500 tracking-wider">
                                <span className={`px-2 py-1 rounded capitalize ${activeLesson.lesson.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {activeLesson.lesson.type}
                                </span>
                                {activeLesson.lesson.duration && (
                                    <>
                                        <span className="mx-3 text-slate-300">|</span>
                                        <span>ESTIMATED TIME: {activeLesson.lesson.duration}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
           <div 
             className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
             onClick={() => setIsSidebarOpen(false)}
           />
        )}

        {/* Sidebar Curriculum */}
        <aside 
          className={`
            fixed lg:static inset-y-0 right-0 z-40 w-80 bg-white border-l border-slate-200 
            flex flex-col h-full transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6 border-b border-slate-100 shrink-0 bg-white">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Course Content</h2>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
               {course.modules.length} modules • {
                  course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
               } lessons
            </div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
             {course.modules.map((module, idx) => {
               const isExpanded = expandedModules.includes(module.id);
               return (
                 <div key={module.id} className="border-b border-slate-50 last:border-b-0">
                   <button
                     onClick={() => toggleModule(module.id)}
                     className={`w-full px-6 py-5 flex items-start justify-between hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/50' : 'bg-white'}`}
                   >
                     <div className="flex flex-col text-left pr-4">
                        <span className="text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-[0.2em]">
                          Module {idx + 1}
                        </span>
                        <span className="text-sm font-black text-slate-800 leading-tight tracking-tight">
                          {module.title}
                        </span>
                     </div>
                     {isExpanded ? (
                       <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                     ) : (
                       <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                     )}
                   </button>
                   
                   {isExpanded && (
                     <div className="bg-white py-1">
                        {module.lessons.map((lesson, lessonIdx) => {
                           const isActive = activeLesson?.lesson.id === lesson.id;
                           return (
                             <button
                               key={lesson.id}
                               onClick={() => selectLesson(module, lesson)}
                               className={`w-full px-6 py-4 flex items-start group transition-all duration-200 border-l-4 ${
                                 isActive ? "bg-emerald-50/40 border-emerald-500 shadow-inner" : "border-transparent hover:bg-slate-50"
                               }`}
                             >
                               <div className="mt-1 mr-4 shrink-0">
                                  {lesson.type === 'video' && <Video className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />}
                                  {lesson.type === 'document' && <FileText className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />}
                                  {lesson.type === 'quiz' && <Award className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />}
                                  {lesson.type === 'assignment' && <Download className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />}
                               </div>
                               <div className="text-left flex-1 min-w-0">
                                  <div className={`text-sm leading-snug tracking-tight mb-1 truncate transition-colors ${isActive ? 'font-black text-slate-900' : 'font-bold text-slate-600 group-hover:text-slate-900'}`}>
                                    {lesson.title}
                                  </div>
                                  {lesson.duration && (
                                    <div className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
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
