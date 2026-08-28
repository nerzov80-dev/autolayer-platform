import { Link } from "react-router-dom";
import ClientsList from "../components/admin/ClientsList";

export default function AdminClientsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Client Management
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create and manage client accounts for AutoLayer.
          </p>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <ClientsList />
    </section>
  );
}
