import React, { useState } from "react";
import api from "../../services/api";
const ConsultationBooking: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    scheduledDate: "",
    durationMins: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/consultations/book`, formData);

      if (response.data.success && response.data.data.authorization_url) {
        // Redirect to Paystack Checkout URL
        window.location.href = response.data.data.authorization_url;
      } else {
        setError("Failed to initialize payment. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message || "Failed to book consultation. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary text-center">
          Book a Consultation
        </h2>
        <p className="text-gray-600 mb-8 text-center text-lg">
          Schedule a 1-on-1 session with our agricultural experts.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 font-secondary mb-1">
              What do you want to discuss?
            </label>
            <input
              type="text"
              name="topic"
              id="topic"
              required
              value={formData.topic}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors"
              placeholder="e.g., Crop rotation planning, Soil health"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 font-secondary mb-1">
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                id="scheduledDate"
                required
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="durationMins" className="block text-sm font-medium text-gray-700 font-secondary mb-1">
                Duration
              </label>
              <select
                name="durationMins"
                id="durationMins"
                value={formData.durationMins}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors"
              >
                <option value={30}>30 Minutes - ₦50,000</option>
                {/* Expand later to other durations / dynamic prices */}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Initializing Secure Payment..." : "Proceed to Payment"}
          </button>
          <p className="text-sm text-center text-gray-500 mt-4">
            Payments are securely processed by Paystack.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;
