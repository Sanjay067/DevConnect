"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/store/authSlice";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useRegister } from "@/features/auth/hooks/useRegister";

function TypingHeader({ text }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    setDisplayText("");
    let currentText = "";
    let index = 0;
    const interval = setInterval(() => {
      currentText += text.charAt(index);
      setDisplayText(currentText);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 70); // 70ms natural speed

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
      {displayText}
      <span className="animate-pulse font-bold ml-0.5">_</span>
    </span>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate(
        { email: form.email, password: form.password },
        {
          onSuccess: () => {
            document.cookie = "is_authenticated=true; path=/; max-age=3600; SameSite=Lax";
            dispatch(checkAuth()).then(() => {
              router.push("/feed");
            });
          }
        }
      );
    } else {
      registerMutation.mutate(form, {
        onSuccess: () => {
          document.cookie = "is_authenticated=true; path=/; max-age=3600; SameSite=Lax";
          dispatch(checkAuth()).then(() => {
            router.push("/feed");
          });
        },
      });
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    loginMutation.reset();
    registerMutation.reset();
    setForm({ email: "", password: "", username: "", name: "", confirmPassword: "" });
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;
  const errorMessage = error?.response?.data?.message || error?.message;

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 py-8"
      style={{ background: "var(--bg)" }}
    >
      {/* Outer card — lifts off the page */}
      <div
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800"
        style={{
          background: "var(--surface)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px -12px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── LEFT: Form Panel ──────────────────────────────── */}
        <div className="flex w-full flex-col justify-center px-10 py-12 md:w-[55%] md:px-14">

          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <i className="fa-regular fa-compass text-xl text-emerald-500"></i>
            <span className="text-base font-bold tracking-tight text-zinc-100">dev.connect</span>
          </div>

          {/* Title block */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight min-h-[32px]">
              <TypingHeader text={isLogin ? "Welcome back" : "Create your account"} />
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {isLogin
                ? "Sign in to continue to DevConnect"
                : "Join thousands of developers building together"}
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Signup-only row */}
            {!isLogin && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <InputField
                  icon="fa-solid fa-at"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                <InputField
                  icon="fa-solid fa-user"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <InputField
              icon="fa-solid fa-envelope"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <InputField
              icon="fa-solid fa-lock"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <InputField
                icon="fa-solid fa-lock"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  <i className={`text-xs ${isLogin ? "fa-solid fa-arrow-right-to-bracket" : "fa-solid fa-user-plus"}`}></i>
                  {isLogin ? "Sign in" : "Create account"}
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={switchMode}
              className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300 cursor-pointer"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>


        <div
          className="hidden md:flex md:w-[45%] flex-col items-center justify-center border-l border-zinc-800 px-12 py-14 text-center"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.13) 0%, #0c0c0f 65%)",
          }}
        >
          {/* Glowing icon */}
          <div className="relative mb-8 flex items-center justify-center">
            <div
              className="absolute h-24 w-24 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
                filter: "blur(12px)",
              }}
            />
            <i className="fa-regular fa-compass relative text-5xl text-emerald-400"></i>
          </div>

          {/* Brand name */}
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-50">DevConnect</h2>
          <p className="mb-10 text-sm text-zinc-400 leading-relaxed">
            Where developers build<br />together
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4 text-left w-full max-w-[220px]">
            {[
              { icon: "fa-solid fa-users", text: "Connect with developers" },
              { icon: "fa-solid fa-code-branch", text: "Share projects & get feedback" },
              { icon: "fa-solid fa-rocket", text: "Find collaborators fast" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <i className={`${item.icon} text-xs text-emerald-400`}></i>
                </div>
                <span className="text-xs font-medium text-zinc-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Input Component ─────────────────────────────── */
function InputField({ icon, type = "text", name, placeholder, value, onChange, required }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 transition-all duration-200 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20"
      style={{ background: "#0c0c0e" }}
    >
      <i className={`${icon} w-4 shrink-0 text-center text-xs text-zinc-500`}></i>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
      />
    </div>
  );
}
