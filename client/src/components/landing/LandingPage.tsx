import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  BookOpen,
  ShoppingCart,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Leaf,
  Sprout,
  Package,
  UserCheck,
  ArrowRight,
  Star,
  Play,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
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
import { Course } from "../../types";
import courseService from "../../services/course.service";

export default function PetersAgricultureLanding() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fetchedCourses, setFetchedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        // Fetch courses, maybe limit to 6 for featured
        const data = await courseService.getAllCourses();
        // Just take the first 6 for the home screen
        setFetchedCourses(data.slice(0, 6));
        setError(null);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Helper to determine color based on course level or index
  const getCourseColor = (level: string, index: number) => {
    if (level === "Beginner" || level === "Intermediate") return "emerald";
    if (level === "Advanced") return "orange";
    return index % 2 === 0 ? "emerald" : "orange";
  };

  const openPreview = (course: Course) => {
    // Find first video lesson
    let videoUrl = course.previewVideo?.url;
    
    if (!videoUrl) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.type === "video" && lesson.content?.video?.url) {
            videoUrl = lesson.content.video.url;
            break;
          }
        }
        if (videoUrl) break;
      }
    }

    if (videoUrl) {
      setPreviewVideoUrl(videoUrl);
      setPreviewTitle(course.title);
      setIsPreviewOpen(true);
    } else {
      alert("No preview video available for this course.");
    }
  };

  const getThumbnail = (course: Course) => {
    // Try to find first video thumbnail
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.type === "video" && lesson.content?.video?.thumbnail) {
          return lesson.content.video.thumbnail;
        }
      }
    }
    return course.thumbnail?.url || Cucumber;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🌱 Trusted Agricultural Solutions
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Practical Agricultural Solutions for Modern
                <span className="text-emerald-600"> Nigerian </span>
                Farmers
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Training • Consultancy • Agricultural Tools & Products
              </p>
              <p className="text-lg text-gray-700">
                We help farmers, agripreneurs, and agricultural stakeholders
                farm smarter, adapt to climate challenges, access markets, and
                grow profitable agricultural businesses in Nigeria.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition flex items-center font-semibold text-lg shadow-xl shadow-emerald-200"
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"} <ChevronRight className="ml-2" size={24} />
                </button>
                <button onClick={() => navigate("/consultation")} className="px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition font-semibold text-lg">
                  Book a Consultation
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-emerald-100 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={farmImage}
                  alt="The Peters farm"
                  className="w-full h-full flex items-center justify-center bg-gray-100"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Nigeria-Focused
                    </div>
                    <div className="text-sm text-gray-600">
                      Built for Local Conditions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-6 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold">
              Trusted Agricultural Solutions, Built for Nigeria
            </h3>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Understanding Nigerian{" "}
                <span className="text-orange-600">Farming Realities</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At The Peters Agriculture, we understand the realities of
                farming in Nigeria — weather instability, limited resources,
                market access challenges, and lack of modern tools.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      Practical, not theoretical
                    </h4>
                    <p className="text-gray-600">
                      Field-tested solutions that work in real Nigerian
                      conditions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      Designed for Nigerian conditions
                    </h4>
                    <p className="text-gray-600">
                      Climate-adapted strategies for local environments
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      Scalable from small to commercial farms
                    </h4>
                    <p className="text-gray-600">
                      Start small, grow big with our proven systems
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      Focused on profitability and sustainability
                    </h4>
                    <p className="text-gray-600">
                      Make money while protecting the environment
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-emerald-100 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={Training}
                  alt="The Peters Training Class"
                  className="w-full h-full flex items-center justify-center bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            About{" "}
            <span className="text-emerald-600">The Peters Agriculture</span>
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            The Peters Agriculture is an agricultural solutions and
            capacity-building brand committed to empowering farmers and
            agribusinesses with knowledge, expert guidance, and the right tools
            to succeed in today's agricultural environment.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We bridge the gap between traditional farming practices and modern,
            sustainable agriculture, helping our clients reduce risks, increase
            yields, and build resilient farm businesses.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What <span className="text-emerald-600">We Do</span>
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive agricultural solutions for every stage of your
              journey
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Agricultural Training */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition group border border-emerald-100">
              <div className="mb-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <BookOpen className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🌱 Agricultural Training
                </h3>
                <p className="text-gray-600 mb-4">
                  We offer practical training programs designed for beginners,
                  growing farmers, and commercial agribusinesses.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Beginner agriculture & low-capital farming</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Crop and livestock production</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Sustainable and climate-smart agriculture</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Market access and agribusiness management</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center justify-center"
              >
                Explore Our Courses <ArrowRight className="ml-2" size={20} />
              </button>
            </div>

            {/* Agricultural Consultation */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition group border border-orange-100">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <UserCheck className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🧑🌾 Agricultural Consultation
                </h3>
                <p className="text-gray-600 mb-4">
                  We provide expert consultation to help farmers and
                  agribusinesses solve real agricultural challenges.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-orange-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Farm assessment and problem diagnosis</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-orange-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Soil, water, climate, and production advice</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-orange-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Market access and sales strategy</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-orange-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Business planning and scaling support</span>
                </div>
              </div>
              <button onClick={() => navigate("/consultation")} className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center">
                Book a Consultation <ArrowRight className="ml-2" size={20} />
              </button>
            </div>

            {/* Agricultural Tools & Products */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition group border border-emerald-100">
              <div className="mb-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Package className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🛠️ Agricultural Tools & Products
                </h3>
                <p className="text-gray-600 mb-4">
                  We supply quality agricultural tools, equipment, and farm
                  products to support efficient farming operations.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Farm tools and accessories</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Agricultural inputs</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ChevronRight
                    className="text-emerald-600 mr-2 flex-shrink-0"
                    size={20}
                  />
                  <span>Practical equipment for small and medium farms</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/store")}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center justify-center"
              >
                Visit Our Store <ShoppingCart className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section
        id="courses"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Featured <span className="text-emerald-600">Courses</span>
            </h2>
            <p className="text-xl text-gray-600">
              Practical, Nigeria-focused agricultural training programs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : fetchedCourses.length > 0 ? (
              fetchedCourses.map((course, index) => {
                const color = getCourseColor(course.level, index);
                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group relative"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={getThumbnail(course)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play Overlay */}
                      <div 
                        onClick={() => openPreview(course)}
                        className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                          <Play className="text-emerald-600 fill-emerald-600" size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className={`inline-block px-3 py-1 ${
                            color === "emerald"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          } rounded-full text-xs font-semibold`}
                        >
                          {course.level}
                        </div>
                        <button 
                          onClick={() => openPreview(course)}
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Play size={14} className="fill-emerald-600" /> PREVIEW
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-2 text-sm">
                        {course.subtitle || course.description}
                      </p>
                      <button
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className={`w-full px-4 py-3 ${
                          color === "emerald"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-orange-600 hover:bg-orange-700"
                        } text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2`}
                      >
                        Learn More <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600">No courses available at the moment.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-orange-600 text-white rounded-lg hover:shadow-xl transition font-semibold text-lg"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose{" "}
              <span className="text-emerald-600">The Peters Agriculture?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nigeria-focused agricultural solutions
              </h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Practical, field-tested knowledge
              </h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Low-capital and scalable approaches
              </h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Climate-smart and sustainable practices
              </h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Market-oriented training and advisory
              </h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Support beyond learning — tools & guidance
              </h3>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-900">
              We don't just teach agriculture — we help you succeed in it.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who <span className="text-orange-600">We Serve</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Beginner and smallholder farmers",
              "Agripreneurs and startups",
              "Commercial farmers",
              "Cooperative societies",
              "NGOs and development organizations",
              "Agricultural investors",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition flex items-center space-x-4"
              >
                <CheckCircle
                  className="text-emerald-600 flex-shrink-0"
                  size={24}
                />
                <span className="text-gray-800 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-emerald-100">
              Your path to agricultural success in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Learn</h3>
              <p className="text-emerald-100">
                Gain practical agricultural knowledge
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Plan</h3>
              <p className="text-emerald-100">
                Get expert consultation and guidance
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Equip</h3>
              <p className="text-emerald-100">
                Access the right tools and products
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Grow</h3>
              <p className="text-emerald-100">
                Build profitable and sustainable farms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Farming Today Requires More Than Hard Work
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Modern agriculture demands knowledge, adaptability, market
            awareness, and the right tools. At The Peters Agriculture, we help
            you navigate uncertainty and turn challenges into opportunities.
          </p>
        </div>
      </section>

      {/* Visual Gallery Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={Greenhouse}
                alt="The Peters Training Class"
                className="w-full h-full flex items-center justify-center bg-gray-100"
              />
            </div>
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={store}
                alt="The Peters Store"
                className="w-full h-full flex items-center justify-center bg-gray-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to <span className="text-emerald-600">Grow Smarter?</span>
          </h2>
          <p className="text-xl text-gray-700 mb-10">
            Whether you're just starting or looking to scale, we're here to
            support your agricultural journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/courses")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition font-semibold text-lg shadow-xl shadow-emerald-200"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Learning Today"}
            </button>
            <button onClick={() => navigate("/consultation")} className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition font-semibold text-lg shadow-xl shadow-orange-200">
              Book a Consultation
            </button>
            <button 
              onClick={() => navigate("/store")}
              className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-semibold text-lg"
            >
              Shop Agricultural Tools
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-gray-300">Get in touch with our team</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-white" size={28} />
              </div>
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-gray-300">+234 703 988 0655</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-300">+234 703 988 0655</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={28} />
              </div>
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-gray-300 text-sm">
                support@thepetersholding.com
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={28} />
              </div>
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-gray-300">Nigeria</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Send us a message
            </h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                rows={5}
                placeholder="Your Message"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-orange-600 text-white rounded-lg hover:shadow-xl transition font-semibold text-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={logo}
                  alt="The Peters Agriculture Logo"
                  className="w-18 h-12 object-contain"
                />
                <div>
                  <div className="text-xl font-bold">THE PETERS</div>
                  <div className="text-sm text-orange-400 font-semibold">
                    Agriculture
                  </div>
                </div>
              </div>
              <p className="text-gray-400">
                Practical Agricultural Solutions for a Sustainable Nigeria.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-emerald-400">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Training
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Consultation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Tools & Products
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-orange-400">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#about" className="hover:text-orange-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#courses"
                    className="hover:text-orange-400 transition"
                  >
                    Courses
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-orange-400 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-emerald-400">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: +234 703 988 0655</li>
                <li>Email: support@thepetersholding.com</li>
                <li>Location: Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 The Peters Agriculture. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewVideoUrl(null);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/50 text-white rounded-lg backdrop-blur-md">
              <p className="font-semibold">{previewTitle} - Preview</p>
            </div>
            {previewVideoUrl && (
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full"
                onEnded={() => setIsPreviewOpen(false)}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => {
              setIsPreviewOpen(false);
              setPreviewVideoUrl(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
