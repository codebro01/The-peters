import React, { useState } from "react";
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
  Snail,
} from "lucide-react";
// Import images from assets folder
import farmImage from "../../assets/images/FarmThePeters.jpeg";
import Training from "../../assets/images/Class.png";
import Greenhouse from "../../assets/images/Farm 2 The Peters.png";
import store from "../../assets/images/Store The Peters.jpeg";
import Agristart from "../../assets/images/Agristart.jpeg";
import Agromastery from "../../assets/images/AgroMastery.jpeg";
import Agrofuture from "../../assets/images/Agrifuture.jpeg";
import Cucumber from "../../assets/images/Cocumber Farming.jpeg";
import snail from "../../assets/images/Snail Farming.jpeg";
import logo from "../../assets/images/THE PETERS LOGO.png";

export default function LMSCourseCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Courses", icon: BookOpen },
    { id: "crop", name: "Crop Production", icon: TrendingUp },
    { id: "livestock", name: "Livestock", icon: Users },
    { id: "climate", name: "Climate-Smart", icon: Award },
    { id: "business", name: "Agribusiness", icon: TrendingUp },
  ];

  const courses = [
    {
      id: 1,
      title: "AgriStart Nigeria",
      description:
        "A beginner-friendly introduction to farming in Nigeria. Learn how to start agriculture with little capital and practical guidance.",
      category: "business",
      level: "Beginner",
      duration: "8 weeks",
      modules: 12,
      students: 1234,
      rating: 4.8,
      reviews: 345,
      price: 25000,
      instructor: "Dr. Adebayo Johnson",
      thumbnail: Agristart,
      features: ["Certificate", "Lifetime Access", "Community"],
    },
    {
      id: 2,
      title: "AgroMastery Nigeria",
      description:
        "Advanced training on irrigation, soil fertility, and scaling agricultural production sustainably in Nigeria.",
      category: "crop",
      level: "Advanced",
      duration: "12 weeks",
      modules: 18,
      students: 856,
      rating: 4.9,
      reviews: 234,
      price: 45000,
      instructor: "Prof. Chioma Okafor",
      thumbnail: Agromastery,
      features: ["Certificate", "Expert Support"],
    },
    {
      id: 3,
      title: "AgriFuture Nigeria",
      description:
        "Climate-smart agricultural practices to help farmers adapt to weather challenges and improve yields.",
      category: "climate",
      level: "Intermediate",
      duration: "10 weeks",
      modules: 15,
      students: 2103,
      rating: 4.7,
      reviews: 567,
      price: 35000,
      instructor: "Eng. Ibrahim Musa",
      thumbnail: Agrofuture,
      features: ["Certificate", "Case Studies"],
    },
    {
      id: 4,
      title: "Cucumber Mastery Nigeria (A–Z)",
      description:
        "Complete open-field and greenhouse cucumber farming. From seed selection to harvest and marketing.",
      category: "crop",
      level: "All Levels",
      duration: "6 weeks",
      modules: 10,
      students: 1567,
      rating: 4.9,
      reviews: 423,
      price: 30000,
      instructor: "Mr. Oluwaseun Peters",
      thumbnail: Cucumber,
      features: ["Certificate", "WhatsApp Support"],
    },
    {
      id: 5,
      title: "Snail Farming Mastery Nigeria (A–Z)",
      description:
        "Low-capital snail farming business. Ideal for small spaces with high market demand and fast returns.",
      category: "livestock",
      level: "All Levels",
      duration: "5 weeks",
      modules: 8,
      students: 3421,
      rating: 4.8,
      reviews: 891,
      price: 20000,
      instructor: "Mrs. Blessing Eze",
      thumbnail: snail,
      features: ["Certificate", "Startup Guide"],
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || course.level === selectedLevel;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <section className="bg-gray-50 min-h-screen">
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

          {/* STATS */}
          {/*<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14 max-w-4xl mx-auto">
            {[
              ["12,000+", "Active Students"],
              ["50+", "Expert Instructors"],
              ["100+", "Courses"],
              ["98%", "Success Rate"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-3xl font-extrabold">{value}</div>
                <div className="text-emerald-200 text-sm uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>*/}
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
          <div className="grid md:grid-cols-2 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
              >
                {/* THUMBNAIL */}
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="text-center text-white">
                      <PlayCircle size={48} className="mx-auto mb-2" />
                      <p className="text-sm">Preview Course</p>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-700">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* META */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> {course.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {course.students.toLocaleString()}
                    </span>
                  </div>

                  {/* RATING */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(course.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="ml-2 font-semibold">{course.rating}</span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        ₦{course.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        One-time payment
                      </div>
                    </div>
                    <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-lg font-semibold flex items-center">
                      View Course
                      <ChevronRight size={18} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
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
