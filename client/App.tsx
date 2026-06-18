import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./components/ProtectedLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AccountConfirmation from "./pages/AccountConfirmation";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Program from "./pages/Program";
import Ideas from "./pages/Ideas";
import Account from "./pages/Account";
import MyProfile from "./pages/MyProfile";
import Sessions from "./pages/Sessions";
import AdminDocuments from "./pages/AdminDocuments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/account-confirmation" element={<AccountConfirmation />} />

              {/* Protected routes - require authentication */}
              <Route
                path="/home"
                element={
                  <ProtectedLayout>
                    <Index />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedLayout>
                    <Reports />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/program"
                element={
                  <ProtectedLayout>
                    <Program />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/ideas"
                element={
                  <ProtectedLayout>
                    <Ideas />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedLayout>
                    <Account />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/my-profile"
                element={
                  <ProtectedLayout>
                    <MyProfile />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedLayout>
                    <Sessions />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/admin/documents"
                element={
                  <ProtectedLayout>
                    <AdminDocuments />
                  </ProtectedLayout>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
