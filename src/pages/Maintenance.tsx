import { useState, useEffect } from "react";
import { FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { MobileMaintenanceCard } from "@/components/maintenance/MobileMaintenanceCard";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_date: string;
  maintenance_type: "breakdown" | "scheduled" | "preventive";
  description: string;
  odometer_reading?: number;
  labor_cost: number;
  total_cost: number;
  vendor_id?: string;
  photo_url?: string;
  created_at: string;
  vehicles?: {
    vehicle_number: string;
    make: string;
    model: string;
  };
  vendors?: {
    name: string;
  };
  maintenance_parts_used?: {
    id: string;
    part_id: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    parts_master: {
      name: string;
      part_number?: string;
    };
  }[];
}

const Maintenance = () => {
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('maintenance_log')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model
          ),
          vendors (
            name
          ),
          maintenance_parts_used (
            id,
            part_id,
            quantity,
            unit_cost,
            total_cost,
            parts_master (
              name,
              part_number
            )
          )
        `);

      // Apply subsidiary filtering
      if (!allSubsidiariesView && currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      }

      const { data, error } = await query
        .order('maintenance_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [currentSubsidiary, allSubsidiariesView]);

  const handleCreateServiceTicket = () => {
    navigate('/service-tickets');
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchMaintenanceRecords();
    setDialogOpen(false);
    setEditingRecord(null);
  };

  // Calculate summary statistics
  const totalRecords = maintenanceRecords.length;
  const totalCost = maintenanceRecords.reduce((sum, record) => sum + record.total_cost, 0);
  const breakdownCount = maintenanceRecords.filter(r => r.maintenance_type === 'breakdown').length;
  const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Maintenance Log</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {allSubsidiariesView 
              ? "Track vehicle maintenance and service history across all subsidiaries"
              : currentSubsidiary 
                ? `Track maintenance for ${currentSubsidiary.subsidiary_name}`
                : "Track vehicle maintenance and service history"
            }
          </p>
        </div>
        {!isMobile && (
          <Button onClick={handleCreateServiceTicket} variant="outline" className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Create Service Ticket
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breakdowns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{breakdownCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Display - Mobile Cards or Desktop Table */}
      {isMobile ? (
        loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : maintenanceRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No maintenance records</h3>
              <p className="text-muted-foreground mb-4">Create a service ticket to request maintenance work</p>
              <Button onClick={handleCreateServiceTicket} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Create Service Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {maintenanceRecords.map((record) => (
              <MobileMaintenanceCard
                key={record.id}
                record={record}
                onEdit={handleEditRecord}
              />
            ))}
          </div>
        )
      ) : (
        <MaintenanceTable 
          maintenanceRecords={maintenanceRecords}
          loading={loading}
          onEdit={handleEditRecord}
          onRefresh={fetchMaintenanceRecords}
        />
      )}

      <MaintenanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        maintenanceRecord={editingRecord}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB for Service Tickets */}
      {isMobile && (
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
          onClick={handleCreateServiceTicket}
          size="icon"
          variant="outline"
        >
          <FileText className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Maintenance;