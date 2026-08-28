import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../services/authApi";

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-xl font-bold tracking-tight">
              AutoLayer
            </div>
            <div className="text-xs text-slate-500">
              Admin Panel
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              [
                "border-b-2 px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/clients"
            className={({ isActive }) =>
              [
                "border-b-2 px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")
            }
          >
            Clients
          </NavLink>
        </div>
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
