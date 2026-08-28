import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../services/authApi";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({
  children,
}: ClientLayoutProps) {
  const location = useLocation();

  const navigation = [
    {
      label: "Dashboard",
      href: "/client",
    },
  ];

  function handleLogout() {
    logout();
    window.location.href = "/client/login";
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/client"
            className="text-xl font-bold tracking-tight"
          >
            AutoLayer
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-73px)] w-60 border-r bg-white p-4 md:block">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
