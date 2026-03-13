import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
interface ConsultationData {
  _id: string;
  name: string;
  topic: string;
  scheduledDate: string;
  durationMins: number;
  meetingLink?: string;
  paymentStatus: string;
}


const ConsultationVerify: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConsultationData | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await api.get(
          `/consultations/verify/${reference}`
        );
        setData(response.data.data);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(
          err.response?.data?.message || "Payment verification failed. Please contact support."
        );
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Verifying your consultation payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="mb-6">{error}</p>
          <Link
            to="/consultation"
            className="inline-block bg-white text-red-600 font-medium px-6 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative">
        <div className="bg-green-600 text-white py-10 px-8 text-center relative z-10">
          <svg className="w-20 h-20 mx-auto mb-4 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl font-bold font-primary">Booking Confirmed!</h2>
          <p className="mt-2 text-green-100 text-lg">Your agricultural consultation session is securely booked.</p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 inline-flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Session Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-gray-900">{data?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Topic</p>
                  <p className="font-medium text-gray-900">{data?.topic}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {data?.scheduledDate && new Date(data.scheduledDate).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{data?.durationMins} Minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Meeting Link
              </h3>
              {data?.meetingLink ? (
                <>
                  <p className="text-green-700 mb-4 text-sm">
                    We've emailed you confirmation. Please use the following Google Meet link to join your consultation at the scheduled time.
                  </p>
                  <a
                    href={data.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    Open Google Meet
                  </a>
                </>
              ) : (
                <p className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
                  Your meeting link is being generated. You will receive it via email shortly.
                </p>
              )}
            </div>

            <div className="text-center pt-4">
              <Link
                to="/"
                className="text-green-600 font-medium hover:text-green-700 transition-colors inline-block"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationVerify;
