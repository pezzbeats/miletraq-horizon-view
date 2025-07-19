import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServiceTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  ticket_type: 'breakdown' | 'preventive' | 'scheduled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'scheduled';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  estimated_total_cost: number;
  actual_total_cost?: number;
  created_at: string;
  submitted_at?: string;
  approved_at?: string;
  completed_at?: string;
  vehicles: {
    vehicle_number: string;
    make: string;
    model: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
  vendors?: {
    name: string;
  } | null;
}

interface ServiceTicketTableProps {
  tickets: ServiceTicket[];
  loading: boolean;
  onEdit: (ticket: ServiceTicket) => void;
  onView: (ticketId: string) => void;
  onRefresh: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
}

export function ServiceTicketTable({ 
  tickets, 
  loading, 
  onEdit, 
  onView, 
  onRefresh,
  getStatusBadge,
  getPriorityBadge 
}: ServiceTicketTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('service_tickets')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service ticket deleted successfully"
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting service ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service ticket"
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading service tickets...</div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No service tickets found. Create your first ticket to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{ticket.ticket_number}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.title}</p>
                </div>
                <div className="flex gap-1">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                <p>Vehicle: {ticket.vehicles?.vehicle_number} - {ticket.vehicles?.make} {ticket.vehicles?.model}</p>
                <p>Created: {format(new Date(ticket.created_at), 'dd/MM/yyyy')}</p>
                <p>Estimated Cost: ₹{ticket.estimated_total_cost?.toLocaleString() || 'N/A'}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(ticket.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {(ticket.status === 'draft' || ticket.status === 'rejected') && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(ticket)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {ticket.status === 'draft' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(ticket.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service Ticket</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this service ticket? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                          {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Estimated Cost</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.vehicles ? (
                    <div>
                      <div className="font-medium">{ticket.vehicles.vehicle_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.vehicles.make} {ticket.vehicles.model}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unknown Vehicle</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{ticket.ticket_type.replace('_', ' ')}</span>
                </TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>₹{ticket.estimated_total_cost?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>{format(new Date(ticket.created_at), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(ticket.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(ticket.status === 'draft' || ticket.status === 'rejected') && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(ticket)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {ticket.status === 'draft' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(ticket.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Service Ticket</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this service ticket? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                              {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}