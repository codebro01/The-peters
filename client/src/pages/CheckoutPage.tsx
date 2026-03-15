import React, { useState } from "react";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronLeft, 
  Truck, 
  CreditCard, 
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../hooks/useAuth";
import storeService from "../services/store.service";

const CheckoutPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate shipping address
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phoneNumber) {
      setError("Please fill in all shipping details.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 1. Create Order on backend
      const order = await storeService.createOrder({
        items: cart,
        shippingAddress,
        totalAmount: getCartTotal()
      });

      // 2. Initialize Paystack
      const handler = (window as any).PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: user?.email || "",
        amount: getCartTotal() * 100, // kobo
        ref: order.paymentReference,
        currency: "NGN",
        callback: async (response: any) => {
          // Payment successful in popup
          setIsProcessing(true);
          try {
            await storeService.verifyOrderPayment(response.reference);
            setPaymentSuccess(true);
            setOrderReference(order.paymentReference);
            clearCart();
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });

      handler.openIframe();
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order <span className="font-mono font-bold text-emerald-600">#{orderReference}</span> is being processed.
          </p>
          <div className="bg-emerald-50 rounded-2xl p-4 mb-8 text-left text-sm text-emerald-800">
            <p className="font-bold mb-1">What's next?</p>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>You'll receive an email confirmation shortly</li>
              <li>Our team will call to confirm shipping details</li>
              <li>You can track your order in your dashboard</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/store")}
            className="mt-4 text-emerald-600 font-bold hover:underline"
          >
            Keep Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/store" className="inline-flex items-center text-emerald-600 font-bold mb-8 hover:gap-2 transition-all">
          <ChevronLeft size={20} /> Back to Store
        </Link>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <ShoppingBag className="mx-auto text-gray-300 mb-6" size={80} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8">Looks like you haven't added any premium agriculture items yet.</p>
            <Link to="/store" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-xl shadow-emerald-200">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-bold text-gray-700">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-xl font-bold text-emerald-700">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Details</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      placeholder="Street address, apartment, suite..."
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Zip/Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={shippingAddress.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+234..."
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-emerald-700">₦{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 mb-6 text-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <CreditCard size={24} />
                      Pay with Paystack
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-8 pt-8 border-t border-gray-50">
                   <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="text-emerald-600" size={20} />
                     <span className="text-sm font-bold text-gray-800">Secure Payment Guaranteed</span>
                   </div>
                   <p className="text-xs text-gray-500">
                     Your payment is processed securely by Paystack. We do not store your card details on our servers.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
