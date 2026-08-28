import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";

export default function SetupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSetup(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || !confirmPassword) {
      setMessage("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Admin setup failed.",
        );
      }

      setSuccess(true);

      setMessage(
        data.message ||
          "Admin account created successfully. You can now sign in.",
      );

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create admin account.",
      );
    } finally {
      setLoading(false);
    }
  }

  function goToAdminLogin() {
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            AutoLayer
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Initial Setup
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create the first administrator account for
            your AutoLayer platform.
          </p>
        </div>

        {!success ? (
          <form
            onSubmit={handleSetup}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="setup-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Admin Email
              </label>

              <input
                id="setup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="setup-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="setup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 8 characters"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="setup-confirm-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="setup-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter the password again"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
              />
            </div>

            {message && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Admin..."
                : "Create Admin Account"}
            </button>
          </form>
        ) : (
          <div className="mt-8">
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800"
            >
              <p className="font-semibold">
                Admin account created successfully.
              </p>

              <p className="mt-1">
                Your administrator account is ready.
                Continue to the Admin Login page.
              </p>
            </div>

            <button
              type="button"
              onClick={goToAdminLogin}
              className="mt-5 w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Continue to Admin Login
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={goToAdminLogin}
          className="mt-5 w-full text-sm text-gray-500 transition hover:text-gray-900"
        >
          Go to Admin Login
        </button>
      </div>
    </div>
  );
             }
