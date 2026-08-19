import React, { useState } from "react";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add logic to handle password reset email sending here
        console.log("Reset password requested for:", email);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cooking Background" />
                <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
                    <h1 className="text-5xl font-bold mb-4">No Worries!</h1>
                    <p className="text-xl opacity-90 max-w-md">We'll help you get back to your delicious journey in no time.</p>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <button
                        type="button"
                        className="flex items-center gap-2 mb-8 justify-center lg:justify-start cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-primary p-2 rounded-lg text-white"><UtensilsCrossed size={24} /></div>
                        <span className="text-2xl font-bold text-textMain">Foodie Delight</span>
                    </button>

                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-4 transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Back to Login
                            </button>
                            <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
                            <p className="text-center text-gray-500 mt-2 text-sm">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {!isSubmitted ? (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold" htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-6"
                                >
                                    Send Reset Link
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
                                <p className="text-gray-500 text-sm">
                                    We've sent a password reset link to <br /><span className="font-semibold text-gray-800">{email}</span>
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="mt-6 text-primary text-sm font-bold hover:underline"
                                >
                                    Didn't receive the email? Try again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
