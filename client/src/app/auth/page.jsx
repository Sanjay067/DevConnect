"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useRegister } from "@/features/auth/hooks/useRegister";
import Loader from "@/shared/components/Loader";

export default function Login() {
  const router = useRouter();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate(
        { email: form.email, password: form.password },
        {
          onSuccess: () => {
            router.push("/feed");
          },
        }
      );
    } else {
      registerMutation.mutate(form, {
        onSuccess: () => {
          router.push("/feed");
        },
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;
  const errorMessage = error?.response?.data?.message || error?.message;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full h-max max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row">
        {/* Form panel */}
        <div className="w-full p-10 md:w-[65%] md:p-16">
          <form onSubmit={handleSubmit}>
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-7">
              <h1
                className="text-center text-3xl font-semibold"
                style={{ color: "black" }}
              >
                {isLogin ? "Login" : "Sign Up"}
              </h1>

              {isLoading && (<Loader />
              )}

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              {/* Signup-only: Username + Name */}
              {!isLogin && (
                <div className="flex w-full flex-col gap-4 sm:flex-row">
                  <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              )}

              <button
                className="mt-4 w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        {/* Toggle panel */}
        <div className="flex w-full items-center justify-center bg-neutral-900 p-10 md:w-[35%]">
          <div
            onClick={() => {
              setIsLogin(!isLogin);
              loginMutation.reset();
              registerMutation.reset();
            }}
            className="cursor-pointer text-center text-base font-semibold text-white transition hover:text-blue-400"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
