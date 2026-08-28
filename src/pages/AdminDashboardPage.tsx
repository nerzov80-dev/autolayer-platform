import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, type AuthUser } from "../services/authApi";
import { getClients } from "../services/adminApi";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, clientsResponse] =
          await Promise.all([
            getCurrentUser(),
            getClients(),
          ]);

        if (!userResponse.success || !userResponse.user) {
          throw new Error("Unable to load administrator.");
        }

        if (userResponse.user.role !== "admin") {
          throw new Error("Administrator access required.");
        }

        setUser(userResponse.user);
        setClientCount(
          clientsResponse.clients?.length ?? 0,
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
          Administrator
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Welcome back{user?.email ? `, ${user.email}` : ""}.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Clients
          </p>

          <p className="mt-3 text-4xl font-bold">
            {clientCount}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Client accounts currently available.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Account Role
          </p>

          <p className="mt-3 text-2xl font-bold capitalize">
            {user?.role ?? "admin"}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Current authenticated role.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Quick Actions
        </h2>

        <div className="mt-4">
          <Link
            to="/admin/clients"
            className="inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Manage Clients
          </Link>
        </div>
      </div>
    </section>
  );
}
