import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthProvider";
import Dashboard from "./pages/Dashboard";
import Entries from "./pages/Entries";
import EntryForm from "./pages/EntryForm";
import Login from "./pages/Login";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <ProtectedRoute>
                <Layout>
                  <Entries />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-entry"
            element={
              <ProtectedRoute>
                <Layout>
                  <EntryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EntryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
