import { useState, useEffect } from "react";
import { Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendorsTable } from "@/components/vendors/VendorsTable";
import { VendorDialog } from "@/components/vendors/VendorDialog";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { toast } from "@/hooks/use-toast";

export interface Vendor {
  id: string;
  name: string;
  vendor_type: string[];
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  performance_metrics?: {
    fuel_transactions: number;
    maintenance_transactions: number;
    total_transactions: number;
    total_spent: number;
    avg_transaction: number;
    last_transaction?: string;
    performance_score: number;
  };
}

const Vendors = () => {
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors with subsidiary filtering
      let query = supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true);

      // Apply subsidiary filtering
      if (!allSubsidiariesView && currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      }

      const { data: vendorsData, error } = await query.order('name');

      if (error) throw error;

      // Calculate performance metrics for each vendor
      const vendorsWithMetrics = await Promise.all(
        (vendorsData || []).map(async (vendor) => {
          // Get fuel purchase transactions
          const { data: fuelPurchases } = await supabase
            .from('fuel_purchases')
            .select('total_cost, purchase_date')
            .eq('vendor_id', vendor.id);

          // Get maintenance transactions
          const { data: maintenanceTransactions } = await supabase
            .from('maintenance_log')
            .select('total_cost, maintenance_date')
            .eq('vendor_id', vendor.id);

          const fuelCount = fuelPurchases?.length || 0;
          const maintenanceCount = maintenanceTransactions?.length || 0;
          const totalTransactions = fuelCount + maintenanceCount;

          const fuelSpent = fuelPurchases?.reduce((sum, t) => sum + t.total_cost, 0) || 0;
          const maintenanceSpent = maintenanceTransactions?.reduce((sum, t) => sum + t.total_cost, 0) || 0;
          const totalSpent = fuelSpent + maintenanceSpent;

          // Get last transaction date
          const allTransactionDates = [
            ...(fuelPurchases?.map(t => t.purchase_date) || []),
            ...(maintenanceTransactions?.map(t => t.maintenance_date) || [])
          ].sort().reverse();

          const lastTransaction = allTransactionDates[0];
          const avgTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

          // Calculate performance score (0-100) based on transaction frequency and recency
          let performanceScore = 0;
          if (totalTransactions > 0) {
            performanceScore = Math.min(100, (totalTransactions * 10) + 
              (lastTransaction ? Math.max(0, 30 - 
                Math.floor((new Date().getTime() - new Date(lastTransaction).getTime()) / (1000 * 60 * 60 * 24))
              ) : 0));
          }

          return {
            ...vendor,
            performance_metrics: {
              fuel_transactions: fuelCount,
              maintenance_transactions: maintenanceCount,
              total_transactions: totalTransactions,
              total_spent: totalSpent,
              avg_transaction: avgTransaction,
              last_transaction: lastTransaction,
              performance_score: performanceScore,
            },
          };
        })
      );

      setVendors(vendorsWithMetrics);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [currentSubsidiary, allSubsidiariesView]);

  const handleAddVendor = () => {
    setEditingVendor(null);
    setDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchVendors();
    setDialogOpen(false);
    setEditingVendor(null);
  };

  // Calculate summary statistics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.is_active).length;
  const totalSpent = vendors.reduce((sum, v) => sum + (v.performance_metrics?.total_spent || 0), 0);
  const totalTransactions = vendors.reduce((sum, v) => sum + (v.performance_metrics?.total_transactions || 0), 0);
  const avgPerVendor = totalVendors > 0 ? totalSpent / totalVendors : 0;

  // Get top performing vendor
  const topVendor = vendors.reduce((top, vendor) => 
    (vendor.performance_metrics?.performance_score || 0) > (top.performance_metrics?.performance_score || 0) 
      ? vendor : top, 
    vendors[0]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Vendors</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {allSubsidiariesView 
              ? "Manage supplier relationships and performance across all subsidiaries"
              : currentSubsidiary 
                ? `Manage suppliers for ${currentSubsidiary.subsidiary_name}`
                : "Manage supplier relationships and performance"
            }
          </p>
        </div>
        <Button onClick={handleAddVendor} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <div className="text-xs text-muted-foreground">
              {activeVendors} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <div className="text-xs text-muted-foreground">total orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg per Vendor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgPerVendor.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={topVendor?.name}>
              {topVendor?.name || "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {topVendor?.performance_metrics?.performance_score || 0}/100 score
            </div>
          </CardContent>
        </Card>
      </div>

      <VendorsTable 
        vendors={vendors}
        loading={loading}
        onEdit={handleEditVendor}
        onRefresh={fetchVendors}
      />

      <VendorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={editingVendor}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-32 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-50 bg-primary hover:bg-primary/90"
        onClick={handleAddVendor}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Vendors;