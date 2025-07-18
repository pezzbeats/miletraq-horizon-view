import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuelLogTable } from "@/components/fuel-log/FuelLogTable";
import { FuelLogDialog } from "@/components/fuel-log/FuelLogDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FuelLogEntry {
  id: string;
  date: string;
  vehicle_id: string;
  driver_id?: string;
  fuel_source: string;
  fuel_volume: number;
  rate_per_liter?: number;
  total_cost?: number;
  odometer_reading?: number;
  vendor_id?: string;
  km_driven?: number;
  mileage?: number;
  previous_reading?: number;
  created_at: string;
  vehicles?: {
    vehicle_number: string;
    make: string;
    model: string;
    fuel_type: string;
  };
  drivers?: {
    name: string;
  };
  vendors?: {
    name: string;
  };
}

const FuelLog = () => {
  const [fuelEntries, setFuelEntries] = useState<FuelLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelLogEntry | null>(null);

  const fetchFuelEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fuel_log')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model,
            fuel_type
          ),
          drivers (
            name
          ),
          vendors (
            name
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFuelEntries(data || []);
    } catch (error) {
      console.error('Error fetching fuel entries:', error);
      toast({
        title: "Error",
        description: "Failed to load fuel entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelEntries();
  }, []);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: FuelLogEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchFuelEntries();
    setDialogOpen(false);
    setEditingEntry(null);
  };

  // Calculate totals for displayed entries
  const totalVolume = fuelEntries.reduce((sum, entry) => sum + entry.fuel_volume, 0);
  const totalCost = fuelEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fuel Log</h1>
          <p className="text-muted-foreground">Track fuel consumption and efficiency</p>
        </div>
        <Button onClick={handleAddEntry} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Fuel Entry
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolume.toFixed(1)}L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      <FuelLogTable 
        fuelEntries={fuelEntries}
        loading={loading}
        onEdit={handleEditEntry}
        onRefresh={fetchFuelEntries}
      />

      <FuelLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fuelEntry={editingEntry}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={handleAddEntry}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FuelLog;