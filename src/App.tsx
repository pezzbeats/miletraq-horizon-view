import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubsidiaryProvider } from "@/contexts/SubsidiaryContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Documents from "./pages/Documents";
import Budget from "./pages/Budget";
import FuelLog from "./pages/FuelLog";
import TankStatus from "./pages/TankStatus";
import Maintenance from "./pages/Maintenance";
import CategoriesMaster from "./pages/CategoriesMaster";
import PartsMaster from "./pages/PartsMaster";
import Vendors from "./pages/Vendors";
import Odometer from "./pages/Odometer";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Subsidiaries from "./pages/Subsidiaries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <SubsidiaryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/drivers" element={<Drivers />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/odometer" element={<Odometer />} />
                  <Route path="/fuel-log" element={<FuelLog />} />
                  <Route path="/tank-status" element={<TankStatus />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/categories-master" element={<CategoriesMaster />} />
                  <Route path="/parts-master" element={<PartsMaster />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/subsidiaries" element={<Subsidiaries />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Add all other protected routes here */}
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SubsidiaryProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
