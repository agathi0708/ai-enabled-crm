import { useState } from "react";
import { login } from "../../api/auth";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await login(
        email.trim(),
        password
      );

      onLogin?.(result.user);
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-8 sm:p-9">

            {/* Logo */}
            <div className="mb-7">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                A
              </div>
            </div>

            {/* Heading */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                AI CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to your sales intelligence
                workspace.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <div className="flex gap-3">
                    <span className="text-red-500">
                      ⚠
                    </span>

                    <p className="text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-7 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs text-slate-400">
                Secure access to your AI CRM workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;