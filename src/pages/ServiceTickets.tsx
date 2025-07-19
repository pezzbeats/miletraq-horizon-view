import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, Search, Clock, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ServiceTicketDialog } from "@/components/service-tickets/ServiceTicketDialog";
import { ServiceTicketTable } from "@/components/service-tickets/ServiceTicketTable";
import { ApprovalQueue } from "@/components/service-tickets/ApprovalQueue";
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

export default function ServiceTickets() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
  const [activeTab, setActiveTab] = useState("my-tickets");

  const { currentSubsidiary } = useSubsidiary();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentSubsidiary?.id) {
      fetchServiceTickets();
    }
  }, [currentSubsidiary?.id]);

  const fetchServiceTickets = async () => {
    if (!currentSubsidiary?.id) return;

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
        .eq('subsidiary_id', currentSubsidiary.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as any) || []);
    } catch (error) {
      console.error('Error fetching service tickets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch service tickets"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setShowDialog(true);
  };

  const handleEditTicket = (ticket: ServiceTicket) => {
    setEditingTicket(ticket);
    setShowDialog(true);
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/service-tickets/${ticketId}`);
  };

  const handleSuccess = () => {
    fetchServiceTickets();
    setShowDialog(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      submitted: "default",
      approved: "outline",
      rejected: "destructive",
      in_progress: "default",
      completed: "default",
      cancelled: "secondary"
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-gray-100 text-gray-600"
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.replace('_', ' ')}
      </Badge>
    );
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.vehicles.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: tickets.length,
    submitted: tickets.filter(t => t.status === 'submitted').length,
    approved: tickets.filter(t => t.status === 'approved').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    totalCost: tickets
      .filter(t => t.actual_total_cost)
      .reduce((sum, t) => sum + (t.actual_total_cost || 0), 0),
    averageCost: tickets.filter(t => t.actual_total_cost).length > 0
      ? tickets
          .filter(t => t.actual_total_cost)
          .reduce((sum, t) => sum + (t.actual_total_cost || 0), 0) / 
        tickets.filter(t => t.actual_total_cost).length
      : 0
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading service tickets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Tickets</h1>
          <p className="text-muted-foreground">Manage maintenance requests and workflow</p>
        </div>
        <Button onClick={handleCreateTicket}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tickets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₹{stats.totalCost.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search tickets, vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="approval-queue">Approval Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          <ServiceTicketTable
            tickets={filteredTickets}
            loading={loading}
            onEdit={handleEditTicket}
            onView={handleViewTicket}
            onRefresh={fetchServiceTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="approval-queue" className="space-y-4">
          <ApprovalQueue
            subsidiaryId={currentSubsidiary?.id || ''}
            onRefresh={fetchServiceTickets}
          />
        </TabsContent>
      </Tabs>

      {/* Service Ticket Dialog */}
      <ServiceTicketDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        ticket={editingTicket}
        onSuccess={handleSuccess}
      />
    </div>
  );
}