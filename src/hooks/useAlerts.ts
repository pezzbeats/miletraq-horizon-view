import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO, addDays } from 'date-fns';

export interface Alert {
  id: string;
  type: 'document_expiry' | 'maintenance_due' | 'fuel_low' | 'license_expiry' | 'budget_threshold' | 'efficiency_drop';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
  actionRequired?: boolean;
  vehicleNumber?: string;
  daysUntil?: number;
  data?: any;
}

export const useAlerts = (subsidiaryId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const generateAlerts = async () => {
    try {
      setLoading(true);
      const allAlerts: Alert[] = [];
      
      // Base query filters for subsidiary access
      let vehicleFilter = supabase.from('vehicles').select('*');
      let documentFilter = supabase.from('vehicle_documents').select('*, vehicles(vehicle_number)');
      let driverFilter = supabase.from('drivers').select('*');
      let tankFilter = supabase.from('fuel_tanks').select('*');
      let budgetFilter = supabase.from('budget').select('*');
      
      if (subsidiaryId) {
        vehicleFilter = vehicleFilter.eq('subsidiary_id', subsidiaryId);
        documentFilter = documentFilter.eq('subsidiary_id', subsidiaryId);
        driverFilter = driverFilter.eq('subsidiary_id', subsidiaryId);
        tankFilter = tankFilter.eq('subsidiary_id', subsidiaryId);
        budgetFilter = budgetFilter.eq('subsidiary_id', subsidiaryId);
      }

      // Fetch all relevant data
      const [
        { data: vehicles },
        { data: documents },
        { data: drivers },
        { data: fuelTanks },
        { data: budgets }
      ] = await Promise.all([
        vehicleFilter,
        documentFilter,
        driverFilter,
        tankFilter,
        budgetFilter
      ]);

      const today = new Date();

      // 1. Document Expiry Alerts
      if (documents) {
        documents.forEach((doc) => {
          if (doc.expiry_date) {
            const expiryDate = parseISO(doc.expiry_date);
            const daysUntil = differenceInDays(expiryDate, today);
            
            if (daysUntil <= 0) {
              allAlerts.push({
                id: `doc-expired-${doc.id}`,
                type: 'document_expiry',
                title: `${doc.document_name} Expired`,
                message: `Document expired ${Math.abs(daysUntil)} day(s) ago`,
                severity: 'critical',
                date: today.toISOString(),
                actionRequired: true,
                vehicleNumber: doc.vehicles?.vehicle_number,
                daysUntil,
                data: doc
              });
            } else if (daysUntil <= 30) {
              allAlerts.push({
                id: `doc-expiring-${doc.id}`,
                type: 'document_expiry',
                title: `${doc.document_name} Expiring Soon`,
                message: `Document will expire in ${daysUntil} day(s)`,
                severity: daysUntil <= 7 ? 'critical' : 'warning',
                date: today.toISOString(),
                actionRequired: daysUntil <= 7,
                vehicleNumber: doc.vehicles?.vehicle_number,
                daysUntil,
                data: doc
              });
            }
          }
        });
      }

      // 2. Driver License Expiry Alerts
      if (drivers) {
        drivers.forEach((driver) => {
          if (driver.license_expiry) {
            const expiryDate = parseISO(driver.license_expiry);
            const daysUntil = differenceInDays(expiryDate, today);
            
            if (daysUntil <= 0) {
              allAlerts.push({
                id: `license-expired-${driver.id}`,
                type: 'license_expiry',
                title: `Driver License Expired`,
                message: `${driver.name}'s license expired ${Math.abs(daysUntil)} day(s) ago`,
                severity: 'critical',
                date: today.toISOString(),
                actionRequired: true,
                daysUntil,
                data: driver
              });
            } else if (daysUntil <= 30) {
              allAlerts.push({
                id: `license-expiring-${driver.id}`,
                type: 'license_expiry',
                title: `Driver License Expiring`,
                message: `${driver.name}'s license will expire in ${daysUntil} day(s)`,
                severity: daysUntil <= 7 ? 'critical' : 'warning',
                date: today.toISOString(),
                actionRequired: daysUntil <= 7,
                daysUntil,
                data: driver
              });
            }
          }
        });
      }

      // 3. Fuel Tank Low Level Alerts
      if (fuelTanks) {
        fuelTanks.forEach((tank) => {
          const currentPercentage = (tank.current_volume / tank.capacity) * 100;
          const lowThresholdPercentage = (tank.low_threshold / tank.capacity) * 100;
          
          if (currentPercentage <= 5) {
            allAlerts.push({
              id: `fuel-critical-${tank.id}`,
              type: 'fuel_low',
              title: `Critical Fuel Level`,
              message: `${tank.fuel_type} tank is critically low (${currentPercentage.toFixed(1)}%)`,
              severity: 'critical',
              date: today.toISOString(),
              actionRequired: true,
              data: tank
            });
          } else if (currentPercentage <= lowThresholdPercentage) {
            allAlerts.push({
              id: `fuel-low-${tank.id}`,
              type: 'fuel_low',
              title: `Low Fuel Level`,
              message: `${tank.fuel_type} tank is below threshold (${currentPercentage.toFixed(1)}%)`,
              severity: 'warning',
              date: today.toISOString(),
              actionRequired: false,
              data: tank
            });
          }
        });
      }

      // 4. Budget Threshold Alerts
      if (budgets) {
        budgets.forEach((budget) => {
          if (budget.budgeted_amount > 0 && budget.actual_amount > 0) {
            const utilizationPercentage = (budget.actual_amount / budget.budgeted_amount) * 100;
            
            if (utilizationPercentage >= 100) {
              allAlerts.push({
                id: `budget-exceeded-${budget.id}`,
                type: 'budget_threshold',
                title: `Budget Exceeded`,
                message: `${budget.category} budget exceeded by ${(utilizationPercentage - 100).toFixed(1)}%`,
                severity: 'critical',
                date: today.toISOString(),
                actionRequired: true,
                data: budget
              });
            } else if (utilizationPercentage >= 80) {
              allAlerts.push({
                id: `budget-warning-${budget.id}`,
                type: 'budget_threshold',
                title: `Budget Alert`,
                message: `${budget.category} budget ${utilizationPercentage.toFixed(1)}% utilized`,
                severity: 'warning',
                date: today.toISOString(),
                actionRequired: false,
                data: budget
              });
            }
          }
        });
      }

      // 5. Maintenance Due Alerts (based on vehicle mileage and service intervals)
      if (vehicles) {
        // This would require more complex logic based on maintenance schedules
        // For now, we'll add a placeholder for vehicles that haven't had maintenance recently
        const { data: recentMaintenance } = await supabase
          .from('maintenance_log')
          .select('vehicle_id, maintenance_date')
          .gte('maintenance_date', addDays(today, -90).toISOString().split('T')[0]);

        const vehiclesWithRecentMaintenance = new Set(
          recentMaintenance?.map(m => m.vehicle_id) || []
        );

        vehicles.forEach((vehicle) => {
          if (!vehiclesWithRecentMaintenance.has(vehicle.id)) {
            allAlerts.push({
              id: `maintenance-due-${vehicle.id}`,
              type: 'maintenance_due',
              title: `Maintenance Due`,
              message: `${vehicle.vehicle_number} hasn't had maintenance in 90+ days`,
              severity: 'info',
              date: today.toISOString(),
              actionRequired: false,
              vehicleNumber: vehicle.vehicle_number,
              data: vehicle
            });
          }
        });
      }

      // Sort alerts by severity and date
      allAlerts.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        if (a.severity !== b.severity) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAlerts();
  }, [subsidiaryId]);

  return {
    alerts,
    loading,
    refetch: generateAlerts
  };
};