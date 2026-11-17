import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";

import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const { signUp, authConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Use at least 12 characters, including uppercase, lowercase, a number and a symbol.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        navigate("/confirm-sign-up", {
          state: { email },
        });
      } else {
        navigate("/login", {
          replace: true,
          state: { message: "Registration completed. Please sign in." },
        });
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create account"
      description="Create your personal CloudVault account."
    >
      {!authConfigured && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Cognito is not configured yet. Registration will become available
          after we create the AWS User Pool.
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="12+ characters, uppercase, lowercase, number and symbol"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter password again"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          type="submit"
          disabled={!authConfigured || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-900">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
