import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { useSessionBootstrap } from "./hooks/useSessionBootstrap";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminFaculties from "./pages/admin/AdminFaculties";
import AdminProgrammes from "./pages/admin/AdminProgrammes";
import AdminSubjects from "./pages/admin/AdminSubjects";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  useSessionBootstrap();

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/universities"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUniversities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculties"
            element={
              <ProtectedRoute requireAdmin>
                <AdminFaculties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/programmes"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProgrammes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSubjects />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
