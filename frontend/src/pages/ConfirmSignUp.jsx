import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";

import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ConfirmSignUp() {
  const { confirmSignUp, resendSignUpCode, authConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await confirmSignUp(email, code);
      navigate("/login", {
        replace: true,
        state: { message: "Email verified. You can now sign in." },
      });
    } catch (err) {
      setError(err.message || "Email verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await resendSignUpCode(email);
      setMessage("A new verification code has been sent.");
    } catch (err) {
      setError(err.message || "Unable to resend verification code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Check your inbox"
      description="Enter the verification code sent to your email address."
    >
      {!authConfigured && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Cognito is not configured yet. Email verification will become
          available after AWS setup.
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="confirm-email" className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <input
            id="confirm-email"
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
          <label htmlFor="confirmation-code" className="mb-2 block text-sm font-semibold text-slate-700">
            Verification code
          </label>
          <input
            id="confirmation-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter verification code"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          type="submit"
          disabled={!authConfigured || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MailCheck className="h-4 w-4" />}
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={!authConfigured || !email || resending}
        className="mt-5 w-full text-sm font-semibold text-sky-700 hover:text-sky-900 disabled:opacity-50"
      >
        {resending ? "Sending..." : "Resend verification code"}
      </button>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-900">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
