import mongoose, { Schema, Document } from "mongoose";

/* =======================
   Interfaces
======================= */

// In your Course model (models/Course.ts)
interface ILesson {
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
      thumbnail?: string; // Add thumbnail for video preview
      format?: string; // Add video format
    };
    document?: {
      url: string;
      publicId: string;
    };
    quiz?: {
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    };
  };
}

interface IModule {
  id: string;
  title: string;
  duration: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  price: number;
  instructor: {
    id: mongoose.Types.ObjectId;
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
  modules: IModule[];
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
  lastUpdated: Date;
}

/* =======================
   Schema
======================= */

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },

    // TEMPORARY FIX: Make slug not required initially
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },

    price: { type: Number, required: true, min: 0 },

    instructor: {
      id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      title: { type: String, required: true },
      bio: String,
      avatar: String,
    },

    category: {
      type: String,
      enum: ["crop", "livestock", "climate", "business"],
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      required: true,
    },

    duration: { type: String, required: true },
    language: { type: String, default: "English" },

    thumbnail: {
      url: String,
      publicId: String,
    },

    modules: [
      {
        id: String,
        title: String,
        duration: String,
        order: Number,
        lessons: [
          {
            id: String,
            title: String,
            duration: String,
            type: {
              type: String,
              enum: ["video", "document", "quiz", "assignment"],
            },
            order: Number,
            isPreview: { type: Boolean, default: false },
            content: {
              video: {
                url: String,
                publicId: String,
                duration: Number,
                thumbnail: String,
                format: String,
              },
              document: {
                url: String,
                publicId: String,
              },
              quiz: {
                questions: [
                  {
                    question: String,
                    options: [String],
                    correctAnswer: Number,
                    explanation: String,
                  },
                ],
              },
            },
          },
        ],
      },
    ],

    features: [String],
    requirements: [String],
    outcomes: [String],

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    enrollmentCount: { type: Number, default: 0 },
    previewVideo: {
      url: String,
      publicId: String,
    },

    isPublished: { type: Boolean, default: false },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* =======================
   Pre-save Hook (FIXED - No next parameter)
======================= */

CourseSchema.pre("save", async function () {
  // Only generate slug if it doesn't exist (for new documents)
  if (!this.slug && this.title) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Make it unique by adding timestamp
    const uniqueSlug = `${baseSlug}-${Date.now()}`;
    this.slug = uniqueSlug;
  }
});

/* =======================
   Model
======================= */

const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
