import React, { useState, useEffect } from "react";
import { Plus, Fuel, Calendar, Car, User, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/ui/mobile-card";

interface DirectPurchase {
  id: string;
  date: string;
  vehicle: {
    vehicle_number: string;
    make: string;
    model: string;
  };
  vendor: {
    name: string;
  };
  driver?: {
    name: string;
  };
  fuel_type: string;
  fuel_volume: number;
  rate_per_liter: number;
  total_cost: number;
  odometer_reading?: number;
}

export const DirectFuelPurchases = () => {
  const [purchases, setPurchases] = useState<DirectPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentSubsidiary } = useSubsidiary();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchPurchases = async () => {
    if (!currentSubsidiary?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fuel_log')
        .select(`
          id,
          date,
          fuel_type,
          fuel_volume,
          rate_per_liter,
          total_cost,
          odometer_reading,
          vehicles:vehicle_id (
            vehicle_number,
            make,
            model
          ),
          vendors:vendor_id (
            name
          ),
          drivers:driver_id (
            name
          )
        `)
        .eq('subsidiary_id', currentSubsidiary.id)
        .eq('fuel_source_type', 'external_vendor')
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        date: item.date,
        vehicle: item.vehicles,
        vendor: item.vendors,
        driver: item.drivers,
        fuel_type: item.fuel_type,
        fuel_volume: item.fuel_volume,
        rate_per_liter: item.rate_per_liter || 0,
        total_cost: item.total_cost || 0,
        odometer_reading: item.odometer_reading,
      })) || [];

      setPurchases(formattedData);
    } catch (error) {
      console.error('Error fetching direct purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch direct fuel purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [currentSubsidiary?.id]);

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchPurchases();
  };

  const totalPurchases = purchases.length;
  const totalVolume = purchases.reduce((sum, p) => sum + p.fuel_volume, 0);
  const totalCost = purchases.reduce((sum, p) => sum + p.total_cost, 0);

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }: any) => {
        const vehicle = row.getValue("vehicle");
        return vehicle ? `${vehicle.vehicle_number} - ${vehicle.make} ${vehicle.model}` : "N/A";
      },
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => {
        const vendor = row.getValue("vendor");
        return vendor?.name || "N/A";
      },
    },
    {
      accessorKey: "fuel_type",
      header: "Fuel Type",
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {row.getValue("fuel_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "fuel_volume",
      header: "Volume (L)",
      cell: ({ row }: any) => row.getValue("fuel_volume").toFixed(1),
    },
    {
      accessorKey: "rate_per_liter",
      header: "Rate/L (₹)",
      cell: ({ row }: any) => `₹${row.getValue("rate_per_liter").toFixed(2)}`,
    },
    {
      accessorKey: "total_cost",
      header: "Total Cost (₹)",
      cell: ({ row }: any) => `₹${row.getValue("total_cost").toFixed(2)}`,
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }: any) => {
        const driver = row.getValue("driver");
        return driver?.name || "No driver";
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading direct fuel purchases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Direct Fuel Purchases</h1>
          <p className="text-muted-foreground">
            Track fuel purchased directly for vehicles from vendors
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Direct Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Direct Fuel Purchase</DialogTitle>
            </DialogHeader>
            <div className="text-center p-4">
              <p className="text-muted-foreground">Form coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Direct vendor purchases</p>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolume.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Fuel purchased directly</p>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Direct purchase expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase List */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            All direct fuel purchases from external vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No direct purchases</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start by adding your first direct fuel purchase.
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <MobileCard key={purchase.id} title={purchase.vehicle?.vehicle_number || "N/A"}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        {purchase.vehicle?.vehicle_number || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {purchase.vehicle?.make} {purchase.vehicle?.model}
                      </div>
                    </div>
                    <Badge variant="outline">{purchase.fuel_type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(purchase.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      {purchase.fuel_volume.toFixed(1)}L
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      ₹{purchase.total_cost.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {purchase.driver?.name || "No driver"}
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                    Vendor: {purchase.vendor?.name || "N/A"}
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Vehicle</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-left p-2">Fuel Type</th>
                    <th className="text-left p-2">Volume (L)</th>
                    <th className="text-left p-2">Rate/L (₹)</th>
                    <th className="text-left p-2">Total Cost (₹)</th>
                    <th className="text-left p-2">Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b">
                      <td className="p-2">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="p-2">
                        {purchase.vehicle ? `${purchase.vehicle.vehicle_number} - ${purchase.vehicle.make} ${purchase.vehicle.model}` : "N/A"}
                      </td>
                      <td className="p-2">{purchase.vendor?.name || "N/A"}</td>
                      <td className="p-2">
                        <Badge variant="outline">{purchase.fuel_type}</Badge>
                      </td>
                      <td className="p-2">{purchase.fuel_volume.toFixed(1)}</td>
                      <td className="p-2">₹{purchase.rate_per_liter.toFixed(2)}</td>
                      <td className="p-2">₹{purchase.total_cost.toFixed(2)}</td>
                      <td className="p-2">{purchase.driver?.name || "No driver"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectFuelPurchases;