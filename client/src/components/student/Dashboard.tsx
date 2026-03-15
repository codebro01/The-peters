import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  CheckCircle,
  Calendar,
  Target,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  BarChart3,
  Download,
  MessageSquare,
  Star,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import enrollmentService from "../../services/enrollment.service";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await enrollmentService.getMyEnrollments();
        // Sort by most recently enrolled or accessed
        setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const student = {
    name: user ? `${user.firstName} ${user.lastName}` : "Student",
    email: user?.email || "",
    joined: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
    avatar: user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : "ST",
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.progress?.progressPercentage === 100).length,
    inProgressCourses: enrollments.filter(e => e.progress?.progressPercentage < 100).length,
    certificatesEarned: enrollments.filter(e => e.certificateIssued).length,
    totalLearningHours: 0, // Placeholder
    currentStreak: 1, // Placeholder
    deviceSession: {
      device: "Current Browser",
      location: "Active Session",
      lastActive: "Just now",
    },
  };

  const enrolledCourses = enrollments.map(e => {
    const course = e.courseId || {};
    return {
      id: e._id,
      courseId: course._id,
      slug: course.slug,
      title: course.title || "Unknown Course",
      instructor: course.instructor?.name || "The Peters Agriculture",
      progress: e.progress?.progressPercentage || 0,
      thumbnail: course.thumbnail?.url || "",
      totalModules: course.modules?.length || 0,
      completedModules: e.progress?.completedModules?.length || 0,
      lastAccessed: new Date(e.lastAccessedAt || e.enrolledAt || Date.now()).toLocaleDateString(),
      nextLesson: "Continue Learning", 
      status: e.progress?.progressPercentage === 100 ? "completed" : "in-progress",
      completedDate: e.completedAt ? new Date(e.completedAt).toLocaleDateString() : undefined,
    };
  });

  const certificates = enrollments
    .filter(e => e.certificateIssued)
    .map(e => {
      const course = e.courseId || {};
      return {
        id: e._id,
        course: course.title || "Course",
        instructor: course.instructor?.name || "Instructor",
        completedDate: e.completedAt ? new Date(e.completedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        certificateId: e.certificateId || `CERT-${e._id.substring(0, 8).toUpperCase()}`,
      };
    });

  const recentActivity: any[] = [];
  const upcomingDeadlines: any[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10 block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:shadow-md transition">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 leading-none">
                  The Peters
                </div>
                <div className="text-xs text-emerald-600 font-medium tracking-wide">
                  LEARNING HUB
                </div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 hover:text-emerald-600 rounded-full transition">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full flex"></span>
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              
              <div className="flex items-center space-x-3 group cursor-pointer relative">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-gray-900">
                    {student.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Student • {student.joined}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold tracking-wider shadow-sm group-hover:ring-2 ring-emerald-100 transition">
                  {student.avatar}
                </div>
                
                {/* Embedded Dropdown Menu on hover */}
                <div className="absolute top-10 right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  <Link to="/" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                    <BookOpen className="w-4 h-4 mr-2" /> Browse Courses
                  </Link>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-1 border-t border-gray-50 pt-3">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {student.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Continue your learning journey. You're making great progress!
            </p>
          </div>
          <Link to="/courses" className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-lg transition border border-emerald-200">
            <BookOpen className="w-4 h-4 mr-2" /> Discover More Courses
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                <BookOpen className="text-emerald-600" size={24} />
              </div>
              <TrendingUp className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
              {student.inProgressCourses}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Courses In Progress</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center transition-colors">
                <Award className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
              {student.certificatesEarned}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Certificates Earned</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
              {student.totalCourses}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Enrollments</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 group-hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors">
                <Target className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
              {student.completedCourses}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed Courses</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex overflow-x-auto hide-scrollbar px-2 sm:px-6">
              {["overview", "courses", "certificates"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-4 sm:px-6 font-semibold capitalize whitespace-nowrap transition border-b-2 text-sm sm:text-base ${
                      activeTab === tab
                        ? "text-emerald-600 border-emerald-600 bg-white"
                        : "text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Continue Learning */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Continue Learning
                    </h2>
                    {enrolledCourses.length > 2 && (
                       <button onClick={() => setActiveTab('courses')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</button>
                    )}
                  </div>
                  
                  {enrolledCourses.filter((c) => c.status === "in-progress").length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {enrolledCourses
                        .filter((c) => c.status === "in-progress")
                        .slice(0, 4)
                        .map((course) => (
                          <div
                            key={course.id}
                            className="bg-white rounded-2xl p-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden flex flex-col"
                          >
                            <div className="relative h-32 bg-gray-100 rounded-t-xl overflow-hidden shrink-0">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                                  <BookOpen className="text-emerald-300 w-12 h-12" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-4 right-4">
                                <h3 className="font-bold text-white mb-1 line-clamp-1 truncate">
                                  {course.title}
                                </h3>
                              </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                              <p className="text-sm text-gray-500 mb-4 font-medium">
                                By {course.instructor}
                              </p>
                              
                              <div className="mb-4 flex-1">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="font-semibold text-gray-700">Course Progress</span>
                                  <span className="font-bold text-emerald-600">
                                    {course.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs font-medium text-gray-500 mt-2">
                                  {course.completedModules} of {course.totalModules} modules completed
                                </div>
                              </div>
                              
                              <Link to={`/learn/${course.slug || course.courseId}`} className="w-full py-3 bg-gray-50 group-hover:bg-emerald-600 group-hover:text-white text-gray-700 rounded-xl transition-colors font-bold flex items-center justify-center border border-gray-200 group-hover:border-emerald-600 mt-auto">
                                <PlayCircle className="mr-2 w-5 h-5" />
                                Resume Learning
                              </Link>
                            </div>
                          </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <BookOpen className="text-gray-400 w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No active courses</h3>
                      <p className="text-gray-500 mb-6 max-w-sm">You aren't enrolled in any active courses right now.</p>
                      <Link to="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm hover:shadow-md">
                        Browse Catalog
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  All Enrollments
                </h2>
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col sm:flex-row gap-6"
                      >
                        <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-xl shrink-0 overflow-hidden relative">
                           {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                                <BookOpen className="text-emerald-200 w-10 h-10" />
                              </div>
                            )}
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                  {course.title}
                                </h3>
                                {course.status === "completed" && (
                                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-500">
                                By {course.instructor}
                              </p>
                            </div>
                          </div>

                          <div className="my-auto py-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="font-semibold text-gray-700">Course Progress</span>
                              <span className="font-bold text-emerald-600">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
                              <div className="flex items-center"><Target className="w-4 h-4 mr-1.5" /> {course.completedModules}/{course.totalModules} modules</div>
                              <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Visited {course.lastAccessed}</div>
                            </div>
                            <Link to={`/learn/${course.slug || course.courseId}`} className={`px-6 py-2.5 rounded-xl font-bold text-sm text-center transition shadow-sm ${course.status === "completed" ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                              {course.status === "completed"
                                ? "Review Course"
                                : "Continue Course"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <BookOpen className="mx-auto text-gray-300 w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't enrolled yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Discover life-changing agricultural courses to kickstart your journey.</p>
                    <Link to="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold inline-block">Browse Catalog</Link>
                  </div>
                )}
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === "certificates" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Achievements
                </h2>
                {certificates.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-white rounded-2xl p-1 border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all group overflow-hidden"
                      >
                         <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 rounded-t-xl flex items-center justify-center border-b border-emerald-100/50">
                          <Award className="text-emerald-500 w-20 h-20 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                        </div>
                        <div className="p-6 text-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                            {cert.course}
                          </h3>
                          <p className="text-sm font-medium text-gray-500 mb-6">
                            By {cert.instructor}
                          </p>
                          
                          <div className="bg-gray-50 rounded-xl p-3 mb-6 border border-gray-100 inline-block text-left w-full">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued On</span>
                              <span className="text-sm font-bold text-gray-900">{cert.completedDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credential ID</span>
                              <span className="text-xs font-mono font-bold text-gray-700">{cert.certificateId}</span>
                            </div>
                          </div>
                          
                          <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-bold flex items-center justify-center shadow-sm">
                            <Download className="mr-2 w-5 h-5" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Award className="mx-auto text-gray-300 w-20 h-20 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No certificates earned yet
                    </h3>
                    <p className="text-gray-500 font-medium mb-6 max-w-sm mx-auto">
                      Complete all modules and lessons in a course to unlock your certificate.
                    </p>
                    <button onClick={() => setActiveTab('courses')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition">
                      View My Courses
                    </button>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}

