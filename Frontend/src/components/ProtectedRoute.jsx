import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Spinner } from "./UI";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-center" style={{ height: "100vh" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
