import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { useSessionBootstrap } from "./hooks/useSessionBootstrap";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import UploadResource from "./pages/UploadResource";
import ResourceDetail from "./pages/ResourceDetail";
import Favorites from "./pages/Favorites";
import Forum from "./pages/Forum";
import ForumPostDetail from "./pages/ForumPostDetail";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import { ErrorBoundary } from "./errors/ErrorBoundary";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminFaculties from "./pages/admin/AdminFaculties";
import AdminProgrammes from "./pages/admin/AdminProgrammes";
import AdminSubjects from "./pages/admin/AdminSubjects";
import NotFound from "./pages/NotFound";
import "./App.css";
import Marketplace from "./pages/Marketplace";
import AdminModerationQueue from "./pages/admin/AdminModerationQueue";
import AdminOpportunities from "./pages/admin/AdminOpportunities";

function App() {
  useSessionBootstrap();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages keep the normal document-scrolling
            MainLayout shell (sticky header, footer, page scrolls). */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Landing />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <Register />
            </MainLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <MainLayout>
              <ForgotPassword />
            </MainLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <MainLayout>
              <ResetPassword />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Resources />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/upload"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UploadResource />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ErrorBoundary>
                  <ResourceDetail />
                </ErrorBoundary>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Favorites />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Forum />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ForumPostDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/universities"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminUniversities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculties"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminFaculties />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programmes"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminProgrammes />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminSubjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Marketplace />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminModerationQueue />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminOpportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
