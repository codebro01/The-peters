import React, { useState } from "react";
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
  User,
  LogOut,
  BarChart3,
  Download,
  MessageSquare,
  Star,
} from "lucide-react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const student = {
    name: "Chinedu Okonkwo",
    email: "chinedu.okonkwo@email.com",
    joined: "September 2024",
    avatar: "CO",
    totalCourses: 3,
    completedCourses: 1,
    inProgressCourses: 2,
    certificatesEarned: 1,
    totalLearningHours: 24.5,
    currentStreak: 7,
    deviceSession: {
      device: "Windows PC - Chrome",
      location: "Lagos, Nigeria",
      lastActive: "2 minutes ago",
    },
  };

  const enrolledCourses = [
    {
      id: 1,
      title: "AgriStart Nigeria",
      instructor: "Dr. Adebayo Johnson",
      progress: 85,
      thumbnail: "agristart",
      totalModules: 12,
      completedModules: 10,
      lastAccessed: "2 hours ago",
      nextLesson: "Module 11: Scaling Your Agricultural Business",
      status: "in-progress",
    },
    {
      id: 2,
      title: "Snail Farming Mastery Nigeria (A–Z)",
      instructor: "Mrs. Blessing Eze",
      progress: 45,
      thumbnail: "snail",
      totalModules: 8,
      completedModules: 4,
      lastAccessed: "1 day ago",
      nextLesson: "Module 5: Feeding and Nutrition",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Poultry Production Excellence",
      instructor: "Dr. Funmi Adeleke",
      progress: 100,
      thumbnail: "poultry",
      totalModules: 14,
      completedModules: 14,
      lastAccessed: "3 days ago",
      completedDate: "November 15, 2024",
      status: "completed",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "completed",
      course: "AgriStart Nigeria",
      lesson: "Module 10: Record Keeping",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "quiz",
      course: "Snail Farming Mastery",
      lesson: "Module 4 Assessment",
      score: 95,
      time: "1 day ago",
    },
    {
      id: 3,
      type: "certificate",
      course: "Poultry Production Excellence",
      time: "3 days ago",
    },
    {
      id: 4,
      type: "started",
      course: "AgriStart Nigeria",
      lesson: "Module 11",
      time: "3 days ago",
    },
  ];

  const certificates = [
    {
      id: 1,
      course: "Poultry Production Excellence",
      instructor: "Dr. Funmi Adeleke",
      completedDate: "November 15, 2024",
      certificateId: "TPA-CERT-2024-001234",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      course: "AgriStart Nigeria",
      task: "Final Project Submission",
      dueDate: "December 31, 2024",
      daysLeft: 1,
    },
    {
      id: 2,
      course: "Snail Farming Mastery",
      task: "Module 5 Quiz",
      dueDate: "January 5, 2025",
      daysLeft: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  The Peters Agriculture
                </div>
                <div className="text-xs text-gray-500">Learning Hub</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {student.name}
                  </div>
                  <div className="text-xs text-gray-500">Student</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {student.avatar}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {student.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Continue your learning journey. You're making great progress!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-emerald-600" size={24} />
              </div>
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {student.inProgressCourses}
            </div>
            <div className="text-sm text-gray-600">Courses In Progress</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {student.certificatesEarned}
            </div>
            <div className="text-sm text-gray-600">Certificates Earned</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {student.totalLearningHours}h
            </div>
            <div className="text-sm text-gray-600">Total Learning Time</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {student.currentStreak} days
            </div>
            <div className="text-sm text-gray-600">Current Streak 🔥</div>
          </div>
        </div>

        {/* Device Session Warning */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Settings className="text-orange-600" size={24} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Active Session
              </h3>
              <p className="text-sm text-gray-700">
                You're currently logged in on:{" "}
                <strong>{student.deviceSession.device}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {student.deviceSession.location} • Last active:{" "}
                {student.deviceSession.lastActive}
              </p>
              <p className="text-xs text-orange-700 mt-2">
                ⚠️ Note: You can only be logged in on one device at a time.
                Logging in elsewhere will end this session.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {["overview", "courses", "certificates", "activity"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-semibold capitalize transition border-b-2 ${
                      activeTab === tab
                        ? "text-emerald-600 border-emerald-600"
                        : "text-gray-600 border-transparent hover:text-emerald-600"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Continue Learning */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Continue Learning
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {enrolledCourses
                      .filter((c) => c.status === "in-progress")
                      .map((course) => (
                        <div
                          key={course.id}
                          className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-100"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                by {course.instructor}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-bold text-emerald-600">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {course.completedModules} of {course.totalModules}{" "}
                              modules completed
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">
                              Next Lesson:
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {course.nextLesson}
                            </div>
                          </div>

                          <button className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold flex items-center justify-center">
                            <PlayCircle className="mr-2" size={20} />
                            Continue Course
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Upcoming Deadlines
                  </h2>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Calendar className="text-orange-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {deadline.task}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {deadline.course}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {deadline.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              deadline.daysLeft <= 2
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {deadline.daysLeft}
                          </div>
                          <div className="text-xs text-gray-600">days left</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Stats */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    This Week's Activity
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day, idx) => (
                          <div key={day} className="text-center">
                            <div className="text-xs text-gray-600 mb-2">
                              {day}
                            </div>
                            <div
                              className={`h-12 rounded ${
                                idx < 5 ? "bg-emerald-500" : "bg-gray-200"
                              }`}
                            ></div>
                            <div className="text-xs font-semibold text-gray-900 mt-1">
                              {idx < 5
                                ? `${Math.floor(Math.random() * 3) + 1}h`
                                : "-"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      Total this week:{" "}
                      <span className="font-bold text-emerald-600">
                        8.5 hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  My Courses
                </h2>
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {course.title}
                            </h3>
                            {course.status === "completed" && (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Instructor: {course.instructor}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold text-emerald-600">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">
                              {course.completedModules}/{course.totalModules}
                            </span>{" "}
                            modules
                          </div>
                          <div>Last accessed: {course.lastAccessed}</div>
                        </div>
                        <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold">
                          {course.status === "completed"
                            ? "Review Course"
                            : "Continue"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === "certificates" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  My Certificates
                </h2>
                {certificates.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border-2 border-emerald-200"
                      >
                        <div className="flex items-center justify-center mb-4">
                          <Award className="text-emerald-600" size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                          {cert.course}
                        </h3>
                        <p className="text-sm text-gray-600 text-center mb-4">
                          Instructor: {cert.instructor}
                        </p>
                        <div className="bg-white rounded-lg p-3 mb-4 text-center">
                          <div className="text-xs text-gray-500">
                            Certificate ID
                          </div>
                          <div className="text-sm font-mono font-semibold text-gray-900">
                            {cert.certificateId}
                          </div>
                        </div>
                        <div className="text-center text-sm text-gray-600 mb-4">
                          Completed: {cert.completedDate}
                        </div>
                        <button className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold flex items-center justify-center">
                          <Download className="mr-2" size={18} />
                          Download Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No certificates yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Complete your courses to earn certificates
                    </p>
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold">
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-start space-x-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.type === "completed"
                            ? "bg-emerald-100"
                            : activity.type === "quiz"
                            ? "bg-blue-100"
                            : activity.type === "certificate"
                            ? "bg-orange-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {activity.type === "completed" && (
                          <CheckCircle className="text-emerald-600" size={20} />
                        )}
                        {activity.type === "quiz" && (
                          <BarChart3 className="text-blue-600" size={20} />
                        )}
                        {activity.type === "certificate" && (
                          <Award className="text-orange-600" size={20} />
                        )}
                        {activity.type === "started" && (
                          <PlayCircle className="text-purple-600" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {activity.type === "completed" &&
                            `Completed lesson: ${activity.lesson}`}
                          {activity.type === "quiz" &&
                            `Passed quiz: ${activity.lesson}`}
                          {activity.type === "certificate" &&
                            `Earned certificate: ${activity.course}`}
                          {activity.type === "started" &&
                            `Started new lesson: ${activity.lesson}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {activity.course}
                        </p>
                        {activity.score && (
                          <p className="text-sm text-emerald-600 font-semibold mt-1">
                            Score: {activity.score}%
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <button className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition text-left">
            <BookOpen className="text-emerald-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 mb-1">Browse Courses</h3>
            <p className="text-sm text-gray-600">
              Explore more agricultural courses
            </p>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition text-left">
            <MessageSquare className="text-orange-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 mb-1">Community Forum</h3>
            <p className="text-sm text-gray-600">Connect with other farmers</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition text-left">
            <Settings className="text-blue-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 mb-1">Account Settings</h3>
            <p className="text-sm text-gray-600">
              Manage your profile and preferences
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
