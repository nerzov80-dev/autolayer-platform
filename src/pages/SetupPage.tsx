import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SetupPage() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckSetup() {
    try {
      setChecking(true);
      setMessage("");

      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error("Backend health check failed.");
      }

      const data = (await response.json()) as {
        success?: boolean;
      };

      if (!data.success) {
        throw new Error("AutoLayer API is not ready.");
      }

      setMessage("Setup is complete and the API is ready.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify setup.",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            AutoLayer
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Setup
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your AutoLayer platform is being prepared. Use the
            check below to verify that the deployed API is
            responding correctly.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => void handleCheckSetup()}
            disabled={checking}
            className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? "Checking..." : "Check Setup"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Continue to Admin Login
          </button>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              message.includes("complete")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
