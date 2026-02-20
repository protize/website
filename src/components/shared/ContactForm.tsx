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

export default function ContactForm() {
    const [result, setResult] = useState("");
    const [resultError, setResultError] = useState("");
    const [service, setService] = useState("");
    const [serviceOpen, setServiceOpen] = useState(false);
    const [serviceError, setServiceError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const messageRef = useRef(null);
    const newsletterRef = useRef(null);

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!service) {
            setServiceError(true);
            return;
        }

        setResult("Sending....");
        setIsLoading(true);

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
            } else {
                console.error("Web3Forms error:", data);
                setResultError("Error: " + (data.message || "Something went wrong"));
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
            setResultError("Error: Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (value) => {
        setService(value);
        setServiceOpen(false);
        setServiceError(false);
    };

    return (
        <form id="contact-form" className="space-y-6" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        ref={nameRef}
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        ref={emailRef}
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="john@example.com"
                    />
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                {/* Custom Select */}
                <div className="w-full max-w-lg relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Interested In *
                    </label>

                    <button
                        type="button"
                        onClick={() => setServiceOpen((o) => !o)}
                        className={`w-full px-4 py-3 rounded-lg border ${serviceError ? 'border-red-400' : 'border-gray-300'
                            } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-left flex items-center justify-between`}
                        aria-haspopup="listbox"
                        aria-expanded={serviceOpen}
                    >
                        <span className={service ? 'text-gray-900' : 'text-gray-400'}>
                            {service
                                ? SERVICES.find((s) => s.value === service)?.label
                                : 'Select a service'}
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${serviceOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {serviceError && (
                        <p className="text-xs text-red-500 mt-1">Please select a service.</p>
                    )}

                    {serviceOpen && (
                        <ul
                            role="listbox"
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                        >
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
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Tell us about your project..."
                />
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

            <button type="submit" className="btn-primary">
                {isLoading ? (
                    <svg
                        className="w-5 h-5 animate-spin mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                        ></path>
                    </svg>
                ) : (
                    <>
                        Send Message
                        <svg
                            className="inline-block w-6 h-6 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
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
