import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { DialogProvider } from "./context/DialogContext";
import { AppShell, AllowedPage, NotFoundPage } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { PeoplePage } from "./pages/PeoplePage";
import { AttendancePage } from "./pages/AttendancePage";
import { NotesPage } from "./pages/NotesPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import {
  AuditPage,
  NotificationsPage,
  RulesPage,
  SettingsPage,
} from "./pages/UtilityPages";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <WorkspaceProvider>
          <DialogProvider>
            <WorkspaceRoutes />
            <Toaster
              richColors
              position="bottom-right"
              closeButton
              toastOptions={{
                style: {
                  fontFamily: "Inter Variable, sans-serif",
                  fontSize: "13px",
                },
              }}
            />
          </DialogProvider>
        </WorkspaceProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
function WorkspaceRoutes() {
  const location = useLocation();
  if (location.pathname === "/login") return <LoginPage />;
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route
          path="/meetings"
          element={
            <AllowedPage path="/meetings">
              <MeetingsPage />
            </AllowedPage>
          }
        />
        <Route
          path="/students"
          element={
            <AllowedPage path="/students">
              <PeoplePage />
            </AllowedPage>
          }
        />
        <Route
          path="/people"
          element={
            <AllowedPage path="/people">
              <PeoplePage />
            </AllowedPage>
          }
        />
        <Route
          path="/assignments"
          element={
            <AllowedPage path="/assignments">
              <PeoplePage assignments />
            </AllowedPage>
          }
        />
        <Route
          path="/attendance"
          element={
            <AllowedPage path="/attendance">
              <AttendancePage />
            </AllowedPage>
          }
        />
        <Route
          path="/notes"
          element={
            <AllowedPage path="/notes">
              <NotesPage />
            </AllowedPage>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <AllowedPage path="/follow-ups">
              <FollowUpsPage />
            </AllowedPage>
          }
        />
        <Route
          path="/rules"
          element={
            <AllowedPage path="/rules">
              <RulesPage />
            </AllowedPage>
          }
        />
        <Route
          path="/audit"
          element={
            <AllowedPage path="/audit">
              <AuditPage />
            </AllowedPage>
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/overview" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
