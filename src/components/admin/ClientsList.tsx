import { useEffect, useState } from "react";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
  type Client,
} from "../../services/adminApi";

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const response = await getClients();
      setClients(response.clients ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  async function handleCreateClient(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await createClient({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (response.client) {
        setClients((current) => [
          response.client as Client,
          ...current,
        ]);
      } else {
        await loadClients();
      }

      setName("");
      setPhone("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create client.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(client: Client) {
    try {
      setError("");

      const nextStatus =
        client.status === "active" ? "inactive" : "active";

      const response = await updateClient(client.id, {
        status: nextStatus,
      });

      if (response.client) {
        setClients((current) =>
          current.map((item) =>
            item.id === client.id
              ? (response.client as Client)
              : item,
          ),
        );
      } else {
        await loadClients();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update client.",
      );
    }
  }

  async function handleDeleteClient(client: Client) {
    const confirmed = window.confirm(
      `Delete client "${client.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteClient(client.id);

      setClients((current) =>
        current.filter((item) => item.id !== client.id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete client.",
      );
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage AutoLayer client accounts.
        </p>
      </div>

      <form
        onSubmit={handleCreateClient}
        className="rounded-xl border bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold">
          Add Client
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Client name"
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
          />

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number"
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
          />

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Add Client"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No clients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {client.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {client.id}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {client.phone}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          client.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void handleToggleStatus(client)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          {client.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDeleteClient(client)
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
                }
