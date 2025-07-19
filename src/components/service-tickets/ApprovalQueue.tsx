import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, MessageSquare, AlertTriangle, Eye, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PendingTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'scheduled';
  estimated_total_cost: number;
  requested_completion_date?: string;
  created_at: string;
  submitted_at: string;
  vehicles: {
    vehicle_number: string;
    make: string;
    model: string;
  };
  profiles: {
    full_name: string;
  };
  vendors?: {
    name: string;
  };
}

interface ApprovalQueueProps {
  subsidiaryId: string;
  onRefresh: () => void;
}

export function ApprovalQueue({ subsidiaryId, onRefresh }: ApprovalQueueProps) {
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<PendingTicket | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    action: '' as 'approve' | 'approve_with_modifications' | 'request_info' | 'reject',
    comments: '',
    modifications: '',
    modifiedLaborCostLimit: '',
    modifiedPartsCostLimit: '',
    modifiedTotalCostLimit: '',
    modifiedCompletionDate: '',
    modifiedVendorId: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (subsidiaryId) {
      fetchPendingTickets();
    }
  }, [subsidiaryId]);

  const fetchPendingTickets = async () => {
    if (!subsidiaryId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_tickets')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model
          ),
          profiles (
            full_name
          ),
          vendors (
            name
          )
        `)
        .eq('subsidiary_id', subsidiaryId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setPendingTickets((data as any) || []);
    } catch (error) {
      console.error('Error fetching pending tickets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pending tickets"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedTicket || !approvalForm.action) return;

    setApproving(selectedTicket.id);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Create approval record
      const approvalData = {
        ticket_id: selectedTicket.id,
        approver_id: user.data.user.id,
        subsidiary_id: subsidiaryId,
        action: approvalForm.action,
        comments: approvalForm.comments || null,
        modifications: approvalForm.modifications || null,
        modified_labor_cost_limit: parseFloat(approvalForm.modifiedLaborCostLimit) || null,
        modified_parts_cost_limit: parseFloat(approvalForm.modifiedPartsCostLimit) || null,
        modified_total_cost_limit: parseFloat(approvalForm.modifiedTotalCostLimit) || null,
        modified_completion_date: approvalForm.modifiedCompletionDate || null,
        modified_vendor_id: approvalForm.modifiedVendorId || null
      };

      const { error: approvalError } = await supabase
        .from('service_ticket_approvals')
        .insert([approvalData]);

      if (approvalError) throw approvalError;

      // Update ticket status
      const newStatus = approvalForm.action === 'approve' || approvalForm.action === 'approve_with_modifications' 
        ? 'approved' 
        : approvalForm.action === 'reject' 
        ? 'rejected' 
        : 'submitted'; // For request_info, keep as submitted

      const ticketUpdate = {
        status: newStatus as 'approved' | 'rejected' | 'submitted',
        approved_at: (newStatus === 'approved') ? new Date().toISOString() : null
      };

      const { error: updateError } = await supabase
        .from('service_tickets')
        .update(ticketUpdate)
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Ticket ${approvalForm.action.replace('_', ' ')} successfully`
      });

      // Reset form and close dialog
      setApprovalForm({
        action: '' as any,
        comments: '',
        modifications: '',
        modifiedLaborCostLimit: '',
        modifiedPartsCostLimit: '',
        modifiedTotalCostLimit: '',
        modifiedCompletionDate: '',
        modifiedVendorId: ''
      });
      setSelectedTicket(null);
      
      // Refresh data
      fetchPendingTickets();
      onRefresh();
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process approval"
      });
    } finally {
      setApproving(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-white",
      low: "bg-green-500 text-white"
    } as const;

    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    );
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'within_24h':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'within_week':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading approval queue...</div>
        </CardContent>
      </Card>
    );
  }

  if (pendingTickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No tickets pending approval.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {pendingTickets.length} ticket(s) pending approval
      </div>

      {pendingTickets.map((ticket) => (
        <Card key={ticket.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {ticket.ticket_number}
                  {getPriorityBadge(ticket.priority)}
                  {getUrgencyIcon(ticket.urgency)}
                </CardTitle>
                <CardDescription>{ticket.title}</CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Submitted: {format(new Date(ticket.submitted_at), 'dd/MM/yyyy HH:mm')}</div>
                <div>By: {ticket.profiles.full_name}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Vehicle Details</h4>
                <p className="text-sm">
                  {ticket.vehicles.vehicle_number} - {ticket.vehicles.make} {ticket.vehicles.model}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Cost Estimate</h4>
                <p className="text-sm flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ₹{ticket.estimated_total_cost?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>

            {ticket.requested_completion_date && (
              <div>
                <h4 className="font-medium mb-2">Requested Completion</h4>
                <p className="text-sm">{format(new Date(ticket.requested_completion_date), 'dd/MM/yyyy')}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Dialog open={selectedTicket?.id === ticket.id} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Review & Approve Ticket {ticket.ticket_number}</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Action</Label>
                      <Select value={approvalForm.action} onValueChange={(value: any) => setApprovalForm({ ...approvalForm, action: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve as submitted</SelectItem>
                          <SelectItem value="approve_with_modifications">Approve with modifications</SelectItem>
                          <SelectItem value="request_info">Request more information</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {approvalForm.action === 'approve_with_modifications' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Modifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Max Labor Cost (₹)</Label>
                              <Input
                                type="number"
                                value={approvalForm.modifiedLaborCostLimit}
                                onChange={(e) => setApprovalForm({ ...approvalForm, modifiedLaborCostLimit: e.target.value })}
                                placeholder="Optional limit"
                              />
                            </div>
                            <div>
                              <Label>Max Parts Cost (₹)</Label>
                              <Input
                                type="number"
                                value={approvalForm.modifiedPartsCostLimit}
                                onChange={(e) => setApprovalForm({ ...approvalForm, modifiedPartsCostLimit: e.target.value })}
                                placeholder="Optional limit"
                              />
                            </div>
                            <div>
                              <Label>Max Total Cost (₹)</Label>
                              <Input
                                type="number"
                                value={approvalForm.modifiedTotalCostLimit}
                                onChange={(e) => setApprovalForm({ ...approvalForm, modifiedTotalCostLimit: e.target.value })}
                                placeholder="Optional limit"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Modified Completion Date</Label>
                            <Input
                              type="date"
                              value={approvalForm.modifiedCompletionDate}
                              onChange={(e) => setApprovalForm({ ...approvalForm, modifiedCompletionDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Modification Notes</Label>
                            <Textarea
                              value={approvalForm.modifications}
                              onChange={(e) => setApprovalForm({ ...approvalForm, modifications: e.target.value })}
                              placeholder="Describe the modifications made..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <Label>Comments</Label>
                      <Textarea
                        value={approvalForm.comments}
                        onChange={(e) => setApprovalForm({ ...approvalForm, comments: e.target.value })}
                        placeholder="Add comments for the requestor..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleApproval}
                        disabled={!approvalForm.action || approving === ticket.id}
                      >
                        {approving === ticket.id ? 'Processing...' : 'Submit Decision'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTicket(ticket);
                  setApprovalForm({ ...approvalForm, action: 'request_info' });
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Request Info
              </Button>

              <Button 
                variant="destructive" 
                onClick={() => {
                  setSelectedTicket(ticket);
                  setApprovalForm({ ...approvalForm, action: 'reject' });
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}