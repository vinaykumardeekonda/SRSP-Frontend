import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // NEW: Import the ProtectedRoute

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Browse from "./pages/Browse.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminLogs from "./pages/AdminLogs.jsx";
import AdminActivity from "./pages/AdminActivity.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes with no navigation bar */}
          <Route path="/login" element={<Layout showNavigation={false}><Login /></Layout>} />
          <Route path="/register" element={<Layout showNavigation={false}><Register /></Layout>} />
          
          {/* Home page can be public or private, wrapped in Layout */}
          <Route path="/" element={<Home />} />
          
          {/* Protected Routes, requiring authentication and wrapped in Layout */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Layout><Upload /></Layout></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><Layout><Browse /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Layout><AdminPanel /></Layout></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute><Layout><AdminLogs /></Layout></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute><Layout><AdminActivity /></Layout></ProtectedRoute>} />
          
          {/* Not Found page */}
          <Route path="*" element={<Layout showNavigation={false}><NotFound /></Layout>} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;