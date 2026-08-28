import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  type AuthUser,
} from "../services/authApi";
import {
  getClientLandingPages,
  type LandingPage,
} from "../services/clientApi";

export default function ClientDashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [landingPages, setLandingPages] = useState<
    LandingPage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const userResponse = await getCurrentUser();

        if (!userResponse.success || !userResponse.user) {
          throw new Error("Unable to load client account.");
        }

        if (
          userResponse.user.role !== "client" ||
          !userResponse.user.clientId
        ) {
          throw new Error("Client access is required.");
        }

        setUser(userResponse.user);

        const pagesResponse =
          await getClientLandingPages(
            userResponse.user.clientId,
          );

        setLandingPages(
          pagesResponse.landingPages ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-8 text-sm text-gray-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Client Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Welcome back
          {user?.email ? `, ${user.email}` : ""}.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Landing Pages
        </p>

        <p className="mt-2 text-4xl font-bold">
          {landingPages.length}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Landing pages associated with your account.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Your Landing Pages
          </h2>
        </div>

        {landingPages.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No landing pages have been created yet.
          </div>
        ) : (
          <div className="divide-y">
            {landingPages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    /{page.slug}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Template: {page.template_id}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    page.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {page.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
      >
        Back to Home
      </button>
    </section>
  );
}
