"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm, RegisterForm } from "@/types";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  const [loginFormData, setLoginFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [registerFormData, setRegisterFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError("");
      setIsFlipping(false);
    }, 400);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData),
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "/overview";
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerFormData.password !== registerFormData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (registerFormData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerFormData.email,
          password: registerFormData.password,
          firstName: registerFormData.firstName,
          lastName: registerFormData.lastName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="bg-accent-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-primary-forest p-8 flex items-center justify-center">
                <h1 className="text-6xl font-bold text-accent-white tracking-wider">
                  MNSTS
                </h1>
              </div>
              <div className="p-8 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary-forest mb-4">
                    Registration Submitted Successfully!
                  </h2>
                  <p className="text-secondary-gray mb-6">
                    Your registration has been submitted and is pending admin approval.
                    The system administrator will review your request and activate your account.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div
          className="relative bg-accent-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            perspective: "1500px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div className="grid md:grid-cols-2 min-h-[700px]">
            {/* Left Side - Register Form (Always here, gets revealed when logo flips away) */}
            <div className="bg-accent-white p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-primary-forest mb-2">
                    Create Account
                  </h1>
                  <p className="text-secondary-gray">Join MNSTS IMS</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {error && !isLogin && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-primary-forest mb-2"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={registerFormData.firstName}
                        onChange={(e) =>
                          setRegisterFormData({
                            ...registerFormData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-primary-forest mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={registerFormData.lastName}
                        onChange={(e) =>
                          setRegisterFormData({
                            ...registerFormData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="registerEmail"
                      className="block text-sm font-medium text-primary-forest mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="registerEmail"
                      required
                      value={registerFormData.email}
                      onChange={(e) =>
                        setRegisterFormData({
                          ...registerFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="registerPassword"
                      className="block text-sm font-medium text-primary-forest mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        id="registerPassword"
                        required
                        value={registerFormData.password}
                        onChange={(e) =>
                          setRegisterFormData({
                            ...registerFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-gray hover:text-primary-forest transition-colors"
                      >
                        {showRegisterPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-primary-forest mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        required
                        value={registerFormData.confirmPassword}
                        onChange={(e) =>
                          setRegisterFormData({
                            ...registerFormData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-gray hover:text-primary-forest transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-secondary-gray">
                    Already have an account?{" "}
                    <button
                      onClick={handleFlip}
                      disabled={isFlipping}
                      className="text-primary-forest font-medium hover:text-secondary-teal transition-colors disabled:opacity-50"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form (Always here, gets revealed when logo flips away) */}
            <div className="bg-accent-white p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-primary-forest mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-secondary-gray">Sign in to your account</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {error && isLogin && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-primary-forest mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={loginFormData.email}
                      onChange={(e) =>
                        setLoginFormData({
                          ...loginFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-primary-forest mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        id="password"
                        required
                        value={loginFormData.password}
                        onChange={(e) =>
                          setLoginFormData({
                            ...loginFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-gray hover:text-primary-forest transition-colors"
                      >
                        {showLoginPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-secondary-gray">
                    <button
                      onClick={() => router.push("/forgot-password")}
                      className="text-primary-forest font-medium hover:text-secondary-teal transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </p>
                  <p className="text-secondary-gray">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={handleFlip}
                      disabled={isFlipping}
                      className="text-primary-forest font-medium hover:text-secondary-teal transition-colors disabled:opacity-50"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Sliding Logo Component */}
            <div
              className={`absolute top-0 bottom-0 w-1/2 transition-all duration-500 ease-in-out bg-primary-forest ${
                isFlipping ? "shadow-2xl" : "shadow-xl"
              }`}
              style={{
                left: isLogin ? "0%" : "50%",
                borderTopLeftRadius: isLogin ? "1rem" : "0",
                borderBottomLeftRadius: isLogin ? "1rem" : "0",
                borderTopRightRadius: isLogin ? "0" : "1rem",
                borderBottomRightRadius: isLogin ? "0" : "1rem",
                zIndex: 10,
              }}
            >
              <div className="h-full p-12 flex flex-col items-center justify-center relative">
                <div className="text-center relative z-10">
                  <h2 className="text-6xl font-bold text-accent-white mb-6 tracking-wider drop-shadow-2xl">
                    MNSTS
                  </h2>
                  <p className="text-accent-lightGold text-lg mb-8">
                    Inventory Management System
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
