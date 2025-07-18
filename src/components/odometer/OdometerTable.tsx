import { useState } from "react";
import { Search, Filter, Edit, Trash2, MoreHorizontal, Car, Calendar, MapPin } from "lucide-react";
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
  DropdownMenuSeparator,
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
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface OdometerTableProps {
  readings: OdometerReading[];
  loading: boolean;
  onEdit: (reading: OdometerReading) => void;
  onRefresh: () => void;
}

export const OdometerTable = ({
  readings,
  loading,
  onEdit,
  onRefresh,
}: OdometerTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Calculate distance covered for each reading
  const readingsWithDistance = readings.map((reading, index) => {
    // Find previous reading for same vehicle
    const previousReading = readings
      .filter(r => 
        r.vehicle_id === reading.vehicle_id && 
        new Date(r.reading_date) < new Date(reading.reading_date)
      )
      .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())[0];

    const distanceCovered = previousReading 
      ? reading.odometer_reading - previousReading.odometer_reading 
      : 0;

    return {
      ...reading,
      previous_reading: previousReading?.odometer_reading || 0,
      distance_covered: distanceCovered,
    };
  });

  const filteredAndSortedReadings = readingsWithDistance
    .filter((reading) => {
      const matchesSearch = 
        reading.vehicles.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.vehicles.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.vehicles.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.current_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesVehicle = vehicleFilter === "all" || reading.vehicle_id === vehicleFilter;
        
      return matchesSearch && matchesVehicle;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "vehicle":
          return a.vehicles.vehicle_number.localeCompare(b.vehicles.vehicle_number);
        case "reading":
          return b.odometer_reading - a.odometer_reading;
        case "distance":
          return b.distance_covered - a.distance_covered;
        case "date":
        default:
          return new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime();
      }
    });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('odometer_readings')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Odometer reading deleted successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast({
        title: "Error",
        description: "Failed to delete odometer reading",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Get unique vehicles for filter
  const uniqueVehicles = Array.from(
    new Map(readings.map(r => [r.vehicle_id, r.vehicles])).values()
  );

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
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
    <div className="space-y-4 p-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle, location, or recorded by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {uniqueVehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="reading">Odometer</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
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
              <TableHead className="text-right">Reading (km)</TableHead>
              <TableHead className="text-right hidden md:table-cell">Previous</TableHead>
              <TableHead className="text-right hidden md:table-cell">Distance</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="hidden lg:table-cell">Recorded By</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedReadings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {readings.length === 0 ? (
                      <>
                        <div className="text-lg font-medium mb-2">No odometer readings found</div>
                        <div>Record your first reading to start tracking vehicle utilization</div>
                      </>
                    ) : (
                      "No readings match your search criteria"
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedReadings.map((reading) => (
                <TableRow key={reading.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(reading.reading_date), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(reading.created_at), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{reading.vehicles.vehicle_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {reading.vehicles.make} {reading.vehicles.model}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono font-semibold">
                      {reading.odometer_reading.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <div className="font-mono text-muted-foreground">
                      {reading.previous_reading > 0 ? reading.previous_reading.toLocaleString() : "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <div className="font-mono">
                      {reading.distance_covered > 0 ? (
                        <Badge variant={reading.distance_covered > 1000 ? "destructive" : "secondary"}>
                          {reading.distance_covered.toLocaleString()} km
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {reading.current_location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]" title={reading.current_location}>
                          {reading.current_location}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">{reading.profiles.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(reading)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(reading.id)}
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
              This action cannot be undone. This will permanently delete the odometer reading.
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