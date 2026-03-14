// ============================================
// USER TYPES
// ============================================
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isActive: boolean;
  deviceSession?: {
    deviceId: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: Date;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// COURSE TYPES
// ============================================
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document" | "quiz" | "assignment";
  order: number;
  isPreview: boolean;
  content: {
    video?: {
      url: string;
      publicId: string;
      duration: number;
      thumbnail?: string;
    };
    document?: {
      url: string;
      publicId: string;
    };
    quiz?: {
      questions: QuizQuestion[];
    };
  };
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  price: number;
  instructor: {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatar?: string;
  };
  category: "crop" | "livestock" | "climate" | "business";
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string;
  language: string;
  thumbnail: {
    url: string;
    publicId: string;
  };
  modules: Module[];
  features: string[];
  requirements: string[];
  outcomes: string[];
  rating: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
  previewVideo?: {
    url: string;
    publicId: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ENROLLMENT TYPES
// ============================================
export interface Enrollment {
  _id: string;
  userId: string;
  courseId: Course;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentReference: string;
  amountPaid: number;
  enrolledAt?: string;
  progress: {
    completedLessons: string[];
    completedModules: string[];
    progressPercentage: number;
    lastAccessedLesson?: {
      moduleId: string;
      lessonId: string;
      timestamp: string;
    };
  };
  quizResults: QuizResult[];
  certificateIssued: boolean;
  certificateId?: string;
  certificateIssuedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PAYMENT TYPES
// ============================================
export interface Payment {
  _id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  paystackReference?: string;
  status: "pending" | "success" | "failed" | "abandoned";
  metadata: {
    email: string;
    customerName: string;
    courseTitle?: string;
    authorization?: any;
  };
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// QUIZ TYPES
// ============================================
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
  passed: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  token: string | null;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

// ============================================
// AUTH TYPES
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
