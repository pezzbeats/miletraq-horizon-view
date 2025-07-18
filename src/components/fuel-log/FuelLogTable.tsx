import { useState } from "react";
import { format } from "date-fns";
import { Search, Calendar, Filter, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FuelLogEntry {
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

interface FuelLogTableProps {
  fuelEntries: FuelLogEntry[];
  loading: boolean;
  onEdit: (entry: FuelLogEntry) => void;
  onRefresh: () => void;
}

export const FuelLogTable = ({ fuelEntries, loading, onEdit, onRefresh }: FuelLogTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fuelSourceFilter, setFuelSourceFilter] = useState<string>("all");
  const [showAllColumns, setShowAllColumns] = useState(false);

  const filteredEntries = fuelEntries.filter((entry) => {
    const matchesSearch = 
      entry.vehicles?.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.drivers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = fuelSourceFilter === "all" || entry.fuel_source === fuelSourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const handleDelete = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('fuel_log')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fuel entry deleted successfully",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting fuel entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete fuel entry",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading fuel entries...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fuelEntries.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">No fuel entries found</h3>
            <p>Record your first fuel entry to start tracking consumption</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuel Entries</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by vehicle, driver, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={fuelSourceFilter} onValueChange={setFuelSourceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="internal_tank">Internal Tank</SelectItem>
              <SelectItem value="external_pump">External Pump</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowAllColumns(!showAllColumns)}
            className="sm:hidden"
          >
            {showAllColumns ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Volume (L)</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead className={showAllColumns ? "" : "hidden sm:table-cell"}>
                  Mileage (km/L)
                </TableHead>
                <TableHead className={showAllColumns ? "" : "hidden lg:table-cell"}>
                  Vendor
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {entry.vehicles?.vehicle_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.vehicles?.make} {entry.vehicles?.model}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.drivers?.name || "Not assigned"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.fuel_source === "internal_tank" ? "default" : "secondary"}>
                      {entry.fuel_source === "internal_tank" ? "Internal Tank" : "External Pump"}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.fuel_volume.toFixed(1)}</TableCell>
                  <TableCell>
                    {entry.total_cost ? `₹${entry.total_cost.toLocaleString('en-IN')}` : "-"}
                  </TableCell>
                  <TableCell className={showAllColumns ? "" : "hidden sm:table-cell"}>
                    {entry.mileage ? entry.mileage.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className={showAllColumns ? "" : "hidden lg:table-cell"}>
                    {entry.vendors?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Fuel Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this fuel entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredEntries.length === 0 && searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            No entries found matching your search criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};