import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layouts/AdminLayout";
import ClientLayout from "./components/layouts/ClientLayout";
import SetupPage from "./pages/SetupPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminClientsPage from "./pages/AdminClientsPage";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/setup" replace />} />

      <Route path="/setup" element={<SetupPage />} />

      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        <Route index element={<AdminDashboardPage />} />
        <Route
          path="clients"
          element={<AdminClientsPage />}
        />
      </Route>

      <Route
        path="/client/login"
        element={<ClientLoginPage />}
      />

      <Route
        path="/client"
        element={<ClientLayout />}
      >
        <Route
          index
          element={<ClientDashboardPage />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/setup" replace />}
      />
    </Routes>
  );
}
