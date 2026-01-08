"use client";
import { useState } from "react";
import { Loader, ChevronRight, ChevronLeft, User, MapPin, Package, MessageSquare, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";

export default function RequestQuote() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    pickupLocation: "",
    deliveryLocation: "",
    serviceType: "",
    cargoType: "",
    weight: "",
    quantity: "",
    description: "",
    preferredDeliveryDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }
    
    if (step === 2) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = "Pickup location is required";
      if (!formData.deliveryLocation.trim()) newErrors.deliveryLocation = "Delivery location is required";
    }
    
    if (step === 3) {
      if (!formData.serviceType) newErrors.serviceType = "Service type is required";
      if (!formData.cargoType) newErrors.cargoType = "Cargo type is required";
    }

    // Step 4 has optional fields, so no validation needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        const trackingNum = data.quote?.trackingNumber || "PENDING";
        setTrackingNumber(trackingNum);
        setShowSuccessModal(true);
        
        // Reset form
        setCurrentStep(1);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          pickupLocation: "",
          deliveryLocation: "",
          serviceType: "",
          cargoType: "",
          weight: "",
          quantity: "",
          description: "",
          preferredDeliveryDate: "",
        });
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Personal Info", icon: User },
    { number: 2, label: "Location", icon: MapPin },
    { number: 3, label: "Shipment Details", icon: Package },
    { number: 4, label: "Additional Info", icon: MessageSquare },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24" id="request-quote">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Request a Quote
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Fill out the form below with your shipping requirements and we'll provide you with a competitive quote.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-12">
          {/* Step Indicators */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = step.number < currentStep;
                const isActive = step.number === currentStep;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-red-600 text-white scale-110 shadow-lg"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <p className={`text-xs md:text-sm font-medium mt-2 text-center ${
                        isActive ? "text-red-600" : isCompleted ? "text-green-500" : "text-gray-600"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 md:mx-4 transition-all duration-300 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-red-600" />
                  Personal Information
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                          errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                      />
                      {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                          errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                          errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                      />
                      {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company Ltd."
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location Information */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-red-600" />
                  Shipment Locations
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                        errors.pickupLocation ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.pickupLocation && <p className="text-red-600 text-xs mt-1">{errors.pickupLocation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      name="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                        errors.deliveryLocation ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.deliveryLocation && <p className="text-red-600 text-xs mt-1">{errors.deliveryLocation}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service & Cargo Details */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Package className="w-6 h-6 text-red-600" />
                  Service & Cargo Details
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                          errors.serviceType ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      >
                        <option value="">-- Select Service Type --</option>
                        <option value="LCL Shipping">LCL Shipping (Less than Container Load)</option>
                        <option value="FCL Shipping">FCL Shipping (Full Container Load)</option>
                        <option value="Air Freight">Air Freight</option>
                        <option value="Road Transport">Road Transport</option>
                        <option value="Sea Freight">Sea Freight</option>
                        <option value="Express Delivery">Express Delivery</option>
                        <option value="Consolidation">Consolidation Service</option>
                      </select>
                      {errors.serviceType && <p className="text-red-600 text-xs mt-1">{errors.serviceType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Cargo Type *
                      </label>
                      <select
                        name="cargoType"
                        value={formData.cargoType}
                        onChange={handleChange}
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm md:text-base bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition ${
                          errors.cargoType ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      >
                        <option value="">-- Select Cargo Type --</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Machinery">Machinery & Equipment</option>
                        <option value="Textiles">Textiles & Apparel</option>
                        <option value="Chemicals">Chemicals & Pharmaceuticals</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Construction Materials">Construction Materials</option>
                        <option value="Automotive">Automotive Parts</option>
                        <option value="General">General Cargo</option>
                        <option value="Hazardous">Hazardous Materials</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.cargoType && <p className="text-red-600 text-xs mt-1">{errors.cargoType}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="e.g., 500"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                        Quantity (Units)
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                  Additional Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      name="preferredDeliveryDate"
                      value={formData.preferredDeliveryDate}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Please provide any additional details about your shipment, special handling requirements, or specific needs..."
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition resize-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 md:px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={(e) => handleNext(e)}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Quote Request
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Quote Request Submitted!
            </h2>

            <p className="text-gray-600 text-center mb-6">
              Thank you for your quote request. We've received your information and our team is reviewing it.
            </p>

            {/* Tracking Number Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6 border border-red-200">
              <p className="text-sm text-gray-600 mb-2">Your Tracking Number</p>
              <p className="font-mono font-bold text-lg text-red-600 text-center">
                {trackingNumber}
              </p>
            </div>

            {/* Follow-up Message */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold text-amber-600">One of our experienced team members</span> will get in touch with you shortly to discuss your shipment requirements and provide a detailed quote.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-in-out;
        }
      `}</style>
    </section>
  );
}
