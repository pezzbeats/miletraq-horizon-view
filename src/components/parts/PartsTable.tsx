import { useState } from "react";
import { Search, Filter, Edit, Trash2, MoreHorizontal, Package, TrendingUp } from "lucide-react";
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
import { Part } from "@/pages/PartsMaster";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";

interface PartsTableProps {
  parts: Part[];
  loading: boolean;
  onEdit: (part: Part) => void;
  onRefresh: () => void;
}

export const PartsTable = ({
  parts,
  loading,
  onEdit,
  onRefresh,
}: PartsTableProps) => {
  const { currentSubsidiary } = useSubsidiary();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [partToDelete, setPartToDelete] = useState<Part | null>(null);

  const categories = Array.from(
    new Set(parts.map(part => part.maintenance_categories?.name).filter(Boolean))
  ).sort();

  const filteredAndSortedParts = parts
    .filter((part) => {
      const matchesSearch = 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.maintenance_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = categoryFilter === "all" || 
        part.maintenance_categories?.name === categoryFilter;
        
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "category":
          return (a.maintenance_categories?.name || "").localeCompare(b.maintenance_categories?.name || "");
        case "usage":
          return (b.usage_count || 0) - (a.usage_count || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleDelete = async () => {
    if (!deleteId || !partToDelete) return;

    // Check if part has been used in maintenance
    if (partToDelete.usage_count && partToDelete.usage_count > 0) {
      toast({
        title: "Cannot Delete Part",
        description: `This part has been used ${partToDelete.usage_count} time${partToDelete.usage_count !== 1 ? 's' : ''} in maintenance records. Parts with usage history cannot be deleted.`,
        variant: "destructive",
      });
      setDeleteId(null);
      setPartToDelete(null);
      return;
    }
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('parts_master')
        .update({ is_active: false })
        .eq('id', deleteId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setPartToDelete(null);
    }
  };

  const initiateDelete = (part: Part) => {
    setDeleteId(part.id);
    setPartToDelete(part);
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="usage">Usage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {parts.length === 0 ? (
                      <>
                        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-lg font-medium mb-2">No parts found</div>
                        <div>Add your first part to start building inventory catalog</div>
                      </>
                    ) : (
                      "No parts match your search criteria"
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedParts.map((part) => (
                <TableRow key={part.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{part.name}</div>
                      {part.part_number && (
                        <div className="text-sm text-muted-foreground">#{part.part_number}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {part.maintenance_categories?.name ? (
                      <Badge variant="secondary">{part.maintenance_categories.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="max-w-xs truncate" title={part.description}>
                      {part.description || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(part.usage_count || 0) > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                      <span className={`font-medium ${(part.usage_count || 0) > 5 ? 'text-green-600' : ''}`}>
                        {part.usage_count || 0}
                      </span>
                      <span className="text-muted-foreground text-sm">times</span>
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
                        <DropdownMenuItem onClick={() => onEdit(part)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => initiateDelete(part)}
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
        setPartToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {partToDelete?.usage_count && partToDelete.usage_count > 0 ? (
                `This part has been used ${partToDelete.usage_count} time${partToDelete.usage_count !== 1 ? 's' : ''} in maintenance records. Parts with usage history cannot be deleted for audit trail purposes.`
              ) : (
                "This action cannot be undone. This will permanently delete the part from inventory."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || (partToDelete?.usage_count && partToDelete.usage_count > 0)}
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