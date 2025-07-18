import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { OdometerTable } from "@/components/odometer/OdometerTable";
import { OdometerDialog } from "@/components/odometer/OdometerDialog";
import { OdometerOverview } from "@/components/odometer/OdometerOverview";

interface OdometerReading {
  id: string;
  reading_date: string;
  vehicle_id: string;
  odometer_reading: number;
  current_location?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  vehicles: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
  };
  profiles: {
    id: string;
    full_name: string;
  };
}

export default function Odometer() {
  const [readings, setReadings] = useState<OdometerReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<OdometerReading | null>(null);

  const fetchOdometerReadings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('odometer_readings')
        .select(`
          id,
          reading_date,
          vehicle_id,
          odometer_reading,
          current_location,
          notes,
          created_by,
          created_at,
          updated_at,
          vehicles!inner (
            id,
            vehicle_number,
            make,
            model
          ),
          profiles!inner (
            id,
            full_name
          )
        `)
        .order('reading_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReadings(data as unknown as OdometerReading[] || []);
    } catch (error) {
      console.error('Error fetching odometer readings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch odometer readings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReading = () => {
    setEditingReading(null);
    setDialogOpen(true);
  };

  const handleEditReading = (reading: OdometerReading) => {
    setEditingReading(reading);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchOdometerReadings();
    setDialogOpen(false);
    setEditingReading(null);
  };

  useEffect(() => {
    fetchOdometerReadings();
  }, []);

  // Calculate summary statistics
  const totalReadings = readings.length;
  const uniqueVehicles = new Set(readings.map(r => r.vehicle_id)).size;
  const lastWeekReadings = readings.filter(r => 
    new Date(r.reading_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const recentDate = readings.length > 0 ? format(new Date(readings[0].reading_date), "MMM d, yyyy") : "No readings";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Odometer Readings</h1>
          <p className="text-muted-foreground">
            Track vehicle mileage and monitor utilization patterns
          </p>
        </div>
        <Button onClick={handleAddReading} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Reading
        </Button>
      </div>

      {/* Overview Cards */}
      <OdometerOverview 
        totalReadings={totalReadings}
        uniqueVehicles={uniqueVehicles}
        lastWeekReadings={lastWeekReadings}
        recentDate={recentDate}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Odometer Readings</CardTitle>
            <CardDescription>
              Complete history of vehicle odometer readings and mileage tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <OdometerTable
              readings={readings}
              loading={loading}
              onEdit={handleEditReading}
              onRefresh={fetchOdometerReadings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <OdometerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reading={editingReading}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={handleAddReading}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}