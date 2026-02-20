import { useState, useRef } from 'react';

const SERVICES = [
    { value: "web-development", label: "Web Development" },
    { value: "mobile-apps", label: "Mobile App Development" },
    { value: "cloud-solutions", label: "Cloud Solutions" },
    { value: "ui-ux", label: "UI/UX Design" },
    { value: "devops", label: "DevOps & Automation" },
    { value: "consulting", label: "IT Consulting" },
    { value: "other", label: "Other" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+\d\s\-\(\)]{7,15}$/;

export default function ContactForm() {
    const [result, setResult] = useState("");
    const [resultError, setResultError] = useState("");
    const [service, setService] = useState("");
    const [serviceOpen, setServiceOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Field-level errors
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        service: "",
    });

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const messageRef = useRef(null);
    const newsletterRef = useRef(null);

    // Validate a single field and return error string (or "")
    const validateField = (field, value) => {
        switch (field) {
            case "name":
                if (!value.trim()) return "Full name is required.";
                if (value.trim().length < 2) return "Name must be at least 2 characters.";
                return "";
            case "email":
                if (!value.trim()) return "Email address is required.";
                if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address.";
                return "";
            case "phone":
                if (value && !PHONE_REGEX.test(value)) return "Please enter a valid phone number.";
                return "";
            case "message":
                if (!value.trim()) return "Project details are required.";
                if (value.trim().length < 10) return "Please provide at least 10 characters.";
                return "";
            case "service":
                if (!value) return "Please select a service.";
                return "";
            default:
                return "";
        }
    };

    // Validate on blur for instant feedback
    const handleBlur = (field) => {
        const value = {
            name: nameRef.current?.value,
            email: emailRef.current?.value,
            phone: phoneRef.current?.value,
            message: messageRef.current?.value,
        }[field] ?? "";

        setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    };

    // Validate all fields, return true if all pass
    const validateAll = () => {
        const newErrors = {
            name: validateField("name", nameRef.current?.value ?? ""),
            email: validateField("email", emailRef.current?.value ?? ""),
            phone: validateField("phone", phoneRef.current?.value ?? ""),
            message: validateField("message", messageRef.current?.value ?? ""),
            service: validateField("service", service),
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((e) => e === "");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        // Prevent duplicate submissions
        if (isLoading) return;

        if (!validateAll()) return;

        setIsLoading(true);
        setResult("");
        setResultError("");

        const formData = new FormData();
        formData.append("access_key", "6a7cc952-2c83-4eae-9ed5-780391faa21a");
        formData.append("name", nameRef.current.value);
        formData.append("email", emailRef.current.value);
        formData.append("phone", phoneRef.current.value || "");
        formData.append("message", messageRef.current.value);
        formData.append("service", service);
        formData.append("newsletter", newsletterRef.current.checked ? "Yes" : "No");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setResult("Form Submitted Successfully");
                nameRef.current.value = "";
                emailRef.current.value = "";
                phoneRef.current.value = "";
                messageRef.current.value = "";
                newsletterRef.current.checked = false;
                setService("");
                setErrors({ name: "", email: "", phone: "", message: "", service: "" });
            } else {
                setResultError("Error: " + (data.message || "Something went wrong"));
            }
        } catch {
            setResultError("Error: Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (value) => {
        setService(value);
        setServiceOpen(false);
        setErrors((prev) => ({ ...prev, service: "" }));
    };

    // Reusable error message component
    const FieldError = ({ field }) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
        ) : null;

    return (
        <form id="contact-form" className="space-y-6" onSubmit={onSubmit} noValidate>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        ref={nameRef}
                        type="text"
                        id="name"
                        onBlur={() => handleBlur("name")}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        placeholder="John Doe"
                    />
                    <FieldError field="name" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        ref={emailRef}
                        type="email"
                        id="email"
                        onBlur={() => handleBlur("email")}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        placeholder="john@example.com"
                    />
                    <FieldError field="email" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        ref={phoneRef}
                        type="tel"
                        id="phone"
                        onBlur={() => handleBlur("phone")}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-400' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                        placeholder="+1 (555) 123-4567"
                    />
                    <FieldError field="phone" />
                </div>

                {/* Custom Select */}
                <div className="w-full max-w-lg relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Interested In *
                    </label>

                    <button
                        type="button"
                        onClick={() => setServiceOpen((o) => !o)}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.service ? 'border-red-400' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-left flex items-center justify-between`}
                        aria-haspopup="listbox"
                        aria-expanded={serviceOpen}
                    >
                        <span className={service ? 'text-gray-900' : 'text-gray-400'}>
                            {service ? SERVICES.find((s) => s.value === service)?.label : 'Select a service'}
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${serviceOpen ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <FieldError field="service" />

                    {serviceOpen && (
                        <ul role="listbox" className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            {SERVICES.map((opt) => (
                                <li
                                    key={opt.value}
                                    role="option"
                                    aria-selected={service === opt.value}
                                    onClick={() => handleServiceSelect(opt.value)}
                                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${service === opt.value
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details *
                </label>
                <textarea
                    ref={messageRef}
                    id="message"
                    rows={7}
                    onBlur={() => handleBlur("message")}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-400' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none`}
                    placeholder="Tell us about your project..."
                />
                <FieldError field="message" />
            </div>

            <div>
                <label className="flex items-start space-x-3">
                    <input
                        ref={newsletterRef}
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">
                        I'd like to receive updates about Protize services and industry insights
                    </span>
                </label>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? (
                    <>
                        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending....
                    </>
                ) : (
                    <>
                        Send Message
                        <svg className="inline-block w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </button>

            {result && <p className="text-sm font-medium text-green-600">{result}</p>}
            {resultError && <p className="text-sm font-medium text-red-600">{resultError}</p>}

            <p className="text-sm text-gray-500 text-center">* We'll respond within 24 hours.</p>
        </form>
    );
}
