import { useState } from "react";
import { Search, Filter, Edit, Trash2, MoreHorizontal, Phone, Mail, MapPin, Star, TrendingUp } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Vendor } from "@/pages/Vendors";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface VendorsTableProps {
  vendors: Vendor[];
  loading: boolean;
  onEdit: (vendor: Vendor) => void;
  onRefresh: () => void;
}

export const VendorsTable = ({
  vendors,
  loading,
  onEdit,
  onRefresh,
}: VendorsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [sortBy, setSortBy] = useState<string>("name");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const filteredAndSortedVendors = vendors
    .filter((vendor) => {
      const matchesSearch = 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = typeFilter === "all" || 
        vendor.vendor_type.includes(typeFilter);
        
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && vendor.is_active) ||
        (statusFilter === "inactive" && !vendor.is_active);
        
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "type":
          return a.vendor_type.join(", ").localeCompare(b.vendor_type.join(", "));
        case "performance":
          return (b.performance_metrics?.performance_score || 0) - (a.performance_metrics?.performance_score || 0);
        case "transactions":
          return (b.performance_metrics?.total_transactions || 0) - (a.performance_metrics?.total_transactions || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleDelete = async () => {
    if (!deleteId || !vendorToDelete) return;

    // Check if vendor has transaction history
    if (vendorToDelete.performance_metrics?.total_transactions && vendorToDelete.performance_metrics.total_transactions > 0) {
      toast({
        title: "Cannot Delete Vendor",
        description: `This vendor has ${vendorToDelete.performance_metrics.total_transactions} transaction${vendorToDelete.performance_metrics.total_transactions !== 1 ? 's' : ''} in the system. Vendors with transaction history cannot be deleted.`,
        variant: "destructive",
      });
      setDeleteId(null);
      setVendorToDelete(null);
      return;
    }
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: false })
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setVendorToDelete(null);
    }
  };

  const initiateDelete = (vendor: Vendor) => {
    setDeleteId(vendor.id);
    setVendorToDelete(vendor);
  };

  const getVendorTypeBadge = (types: string[]) => {
    if (types.includes('parts_labour')) {
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Parts & Labour</Badge>;
    }
    if (types.includes('fuel')) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Fuel</Badge>;
    }
    if (types.includes('parts')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Parts</Badge>;
    }
    if (types.includes('labour')) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Labour</Badge>;
    }
    return <Badge variant="outline">{types.join(", ")}</Badge>;
  };

  const getPerformanceStars = (score: number) => {
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{score}</span>
      </div>
    );
  };

  const handleContact = (type: 'phone' | 'email', value: string) => {
    if (type === 'phone') {
      window.open(`tel:${value}`);
    } else {
      window.open(`mailto:${value}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
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
    <TooltipProvider>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="parts">Parts</SelectItem>
              <SelectItem value="labour">Labour</SelectItem>
              <SelectItem value="parts_labour">Parts & Labour</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Performance</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-muted-foreground">
                      {vendors.length === 0 ? (
                        <>
                          <div className="text-lg font-medium mb-2">No vendors found</div>
                          <div>Add your first vendor to start managing suppliers</div>
                        </>
                      ) : (
                        "No vendors match your search criteria"
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {vendor.name}
                          {!vendor.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.contact_person && (
                            <div>{vendor.contact_person}</div>
                          )}
                          {vendor.address && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[200px]" title={vendor.address}>
                                {vendor.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVendorTypeBadge(vendor.vendor_type)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {vendor.phone && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleContact('phone', vendor.phone!)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {vendor.phone}
                            </Button>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleContact('email', vendor.email!)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              {vendor.email}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        {getPerformanceStars(vendor.performance_metrics?.performance_score || 0)}
                        {vendor.performance_metrics?.last_transaction && (
                          <div className="text-xs text-muted-foreground">
                            Last: {format(new Date(vendor.performance_metrics.last_transaction), "MMM d")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-600" />
                          <span className="font-medium">{vendor.performance_metrics?.total_transactions || 0}</span>
                        </div>
                        {vendor.performance_metrics?.total_spent && vendor.performance_metrics.total_spent > 0 && (
                          <div className="text-xs text-muted-foreground">
                            ₹{vendor.performance_metrics.total_spent.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(vendor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {vendor.phone && (
                            <DropdownMenuItem onClick={() => handleContact('phone', vendor.phone!)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </DropdownMenuItem>
                          )}
                          {vendor.email && (
                            <DropdownMenuItem onClick={() => handleContact('email', vendor.email!)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => initiateDelete(vendor)}
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
        <AlertDialog open={!!deleteId} onOpenChange={() => {
          setDeleteId(null);
          setVendorToDelete(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {vendorToDelete?.performance_metrics?.total_transactions && vendorToDelete.performance_metrics.total_transactions > 0 ? (
                  `This vendor has ${vendorToDelete.performance_metrics.total_transactions} transaction${vendorToDelete.performance_metrics.total_transactions !== 1 ? 's' : ''} in the system. Vendors with transaction history cannot be deleted for audit trail purposes.`
                ) : (
                  "This action cannot be undone. This will permanently delete the vendor."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting || (vendorToDelete?.performance_metrics?.total_transactions && vendorToDelete.performance_metrics.total_transactions > 0)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};