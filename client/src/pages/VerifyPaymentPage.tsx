import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ArrowRight } from "lucide-react";
import paymentService from "../services/payment.service";

const VerifyPaymentPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found.");
        return;
      }

      try {
        const data = await paymentService.verifyPayment(reference);
        if (data?.status === "success") {
          setStatus("success");
          setMessage(
            data.message ||
              "Payment verified and enrollment completed successfully!"
          );
        } else {
          setStatus("failed");
          setMessage("Payment verification failed. Please contact support.");
        }
      } catch (error: any) {
        setStatus("failed");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Payment verification failed. Please contact support."
        );
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <Loader
              className="animate-spin text-emerald-600 mx-auto mb-6"
              size={64}
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-emerald-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight size={20} />
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/courses")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition"
              >
                Back to Courses
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPaymentPage;
