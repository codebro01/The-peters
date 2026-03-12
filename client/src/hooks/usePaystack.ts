import { useState } from "react";
import paymentService from "../services/payment.service";
import { useAuth } from "./useAuth";

// Declare PaystackPop globally
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const usePaystack = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const initializePayment = async (
    courseId: string,
    amount: number,
    onSuccess: () => void,
    onClose: () => void
  ) => {
    try {
      setIsProcessing(true);

      // Initialize payment on backend
      const response = await paymentService.initializePayment(courseId);

      // Use Paystack Inline
      const handler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: user?.email || "",
        amount: amount * 100, // Convert to kobo
        ref: response.reference,
        currency: "NGN",
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${user?.firstName} ${user?.lastName}`,
            },
            {
              display_name: "Course ID",
              variable_name: "course_id",
              value: courseId,
            },
          ],
        },
        callback: async (response: any) => {
          // Payment successful
          try {
            setIsProcessing(true);
            await paymentService.verifyPayment(response.reference);
            setIsProcessing(false);
            onSuccess();
          } catch (error) {
            console.error("Payment verification failed:", error);
            setIsProcessing(false);
            alert("Payment verification failed. Please contact support.");
          }
        },
        onClose: () => {
          setIsProcessing(false);
          onClose();
        },
      });

      handler.openIframe();
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      setIsProcessing(false);
      alert(error.message || "Failed to initialize payment");
    }
  };

  return { initializePayment, isProcessing };
};
