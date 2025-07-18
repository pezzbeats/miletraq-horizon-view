import { useState } from "react";
import { Search, Filter, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MaintenanceRecord } from "@/pages/Maintenance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MaintenanceTableProps {
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  onEdit: (record: MaintenanceRecord) => void;
  onRefresh: () => void;
}

export const MaintenanceTable = ({
  maintenanceRecords,
  loading,
  onEdit,
  onRefresh,
}: MaintenanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch = 
      record.vehicles?.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === "all" || record.maintenance_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      
      // Delete associated parts first
      const { error: partsError } = await supabase
        .from('maintenance_parts_used')
        .delete()
        .eq('maintenance_id', deleteId);
      
      if (partsError) throw partsError;
      
      // Delete maintenance record
      const { error } = await supabase
        .from('maintenance_log')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: "Error",
        description: "Failed to delete maintenance record",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getMaintenanceTypeBadge = (type: string) => {
    switch (type) {
      case "breakdown":
        return <Badge variant="destructive">Breakdown</Badge>;
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "preventive":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Preventive</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle, description, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="breakdown">Breakdown</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="preventive">Preventive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Cost (₹)</TableHead>
              <TableHead className="hidden lg:table-cell">Vendor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {maintenanceRecords.length === 0 ? (
                      <>
                        <div className="text-lg font-medium mb-2">No maintenance records found</div>
                        <div>Record your first maintenance entry to start tracking vehicle service history</div>
                      </>
                    ) : (
                      "No records match your search criteria"
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    {format(new Date(record.maintenance_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.vehicles?.vehicle_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.vehicles?.make} {record.vehicles?.model}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMaintenanceTypeBadge(record.maintenance_type)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-xs truncate" title={record.description}>
                      {record.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ₹{record.total_cost.toLocaleString('en-IN')}
                    </div>
                    {record.maintenance_parts_used && record.maintenance_parts_used.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        + {record.maintenance_parts_used.length} part{record.maintenance_parts_used.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {record.vendors?.name || "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(record.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance record and all associated parts data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};