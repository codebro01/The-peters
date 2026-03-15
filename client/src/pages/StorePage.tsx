import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  Package, 
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../contexts/CartContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: {
    url: string;
    publicId: string;
  };
  isAvailable: boolean;
}

const StorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  
  const { addToCart, getCartCount } = useCart();

  const categories = ["All", "Fertilizer", "Seed", "Tool", "Machinery", "Livestock", "Other"];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== "All" ? `&category=${selectedCategory}` : "";
      const sortParam = `&sort=${sortBy}`;
      const response = await api.get(`/store/products?search=${searchTerm}${categoryParam}${sortParam}`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
      setLoading(false);
    } catch (err: any) {
      setError("Failed to fetch products. Please try again later.");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-emerald-100 text-sm font-semibold mb-6">
            🛠️ Quality Agricultural Supplies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Agriculture Store</h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Get the best fertilizers, seeds, and farming tools to scale your agricultural productivity in Nigeria.
          </p>
        </div>
      </section>

      {/* Store Container */}
      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex flex-wrap gap-4 items-center justify-between border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </form>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Filter size={16} /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border-none rounded-xl text-sm font-medium py-2 pl-3 pr-8 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-emerald-600 animate-spin mb-4" size={48} />
            <p className="text-gray-500 font-medium">Loading premium products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-2xl text-center">
            <AlertCircle className="mx-auto mb-4" size={48} />
            <p className="font-bold text-lg mb-2">Oops!</p>
            <p>{error}</p>
            <button onClick={fetchProducts} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <Package className="mx-auto text-gray-300 mb-6" size={80} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any products in this category. Try adjusting your search or filters.
            </p>
            <button 
              onClick={() => {setSelectedCategory("All"); setSearchTerm("");}}
              className="mt-8 text-emerald-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-wider shadow-sm">
                    {product.category}
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                      Only {product.stock} left!
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold shadow-xl">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div>
                      <span className="text-2xl font-black text-emerald-700">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                        product.stock === 0 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95"
                      }`}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      {getCartCount() > 0 && (
        <Link 
          to="/checkout"
          className="lg:hidden fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 font-bold z-40 active:scale-95 transition"
        >
          <ShoppingCart size={24} />
          <span>{getCartCount()} Items</span>
          <ArrowRight size={20} />
        </Link>
      )}

      {/* Footer CTA */}
      <section className="bg-white py-16 px-4 mt-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Empowering Your Farm with <span className="text-emerald-600">The Right Tools</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Don't see what you're looking for? We also provide bulk orders and specialized machinery on request.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                   <TrendingUp size={24} />
                 </div>
                 <span className="font-bold text-gray-700">Boost Yields</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                   <Award size={24} />
                 </div>
                 <span className="font-bold text-gray-700">Genuine Quality</span>
               </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-3xl text-white shadow-2xl shadow-orange-200 text-center lg:text-left w-full lg:w-auto">
            <h3 className="text-xl font-bold mb-4">Need Expert Advice?</h3>
            <p className="mb-8 opacity-90 max-w-sm">Not sure which fertilizer or tool is right for your soil? Talk to our consultants.</p>
            <Link 
              to="/consultation"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
            >
              Book Consultation <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StorePage;
