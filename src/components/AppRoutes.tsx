import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import Drivers from '@/pages/Drivers';
import FuelLog from '@/pages/FuelLog';
import Maintenance from '@/pages/Maintenance';
import Budget from '@/pages/Budget';
import Documents from '@/pages/Documents';
import Vendors from '@/pages/Vendors';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import ServiceTickets from '@/pages/ServiceTickets';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/drivers" element={<Drivers />} />
      <Route path="/fuel-log" element={<FuelLog />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/users" element={<Users />} />
      <Route path="/service-tickets" element={<ServiceTickets />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}