import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { PartDialog } from "@/components/parts/PartDialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ServiceTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any;
  onSuccess: () => void;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface Part {
  id: string;
  name: string;
  part_number?: string;
}

interface SelectedPart {
  partId: string;
  name: string;
  quantity: number;
  estimatedCost: number;
}

export function ServiceTicketDialog({ open, onOpenChange, ticket, onSuccess }: ServiceTicketDialogProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [partSearchStates, setPartSearchStates] = useState<boolean[]>([false]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ticketType: "breakdown" as "breakdown" | "preventive" | "scheduled",
    priority: "medium" as "critical" | "high" | "medium" | "low",
    urgency: "within_week" as "immediate" | "within_24h" | "within_week" | "scheduled",
    vehicleId: "",
    estimatedLaborHours: "",
    estimatedLaborRate: "",
    requestedCompletionDate: "",
    assignedVendorId: ""
  });

  const { currentSubsidiary } = useSubsidiary();

  useEffect(() => {
    if (open) {
      fetchData();
      if (ticket) {
        populateForm();
      } else {
        resetForm();
      }
    }
  }, [open, ticket]);

  const fetchData = async () => {
    if (!currentSubsidiary?.id) {
      console.log('No subsidiary ID found');
      return;
    }

    try {
      console.log('Fetching data for subsidiary:', currentSubsidiary.id);
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, make, model, status')
        .eq('subsidiary_id', currentSubsidiary.id)
        .eq('status', 'active');

      if (vehiclesError) {
        console.error('Vehicles error:', vehiclesError);
        throw vehiclesError;
      }

      console.log('Fetched vehicles:', vehiclesData);

      // Fetch vendors with maintenance capability
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, name, vendor_type')
        .eq('subsidiary_id', currentSubsidiary.id)
        .eq('is_active', true)
        .contains('vendor_type', ['maintenance']);

      if (vendorsError) {
        console.error('Vendors error:', vendorsError);
        throw vendorsError;
      }

      // Fetch parts
      const { data: partsData, error: partsError } = await supabase
        .from('parts_master')
        .select('id, name, part_number')
        .eq('subsidiary_id', currentSubsidiary.id)
        .eq('is_active', true);

      if (partsError) {
        console.error('Parts error:', partsError);
        throw partsError;
      }

      setVehicles(vehiclesData || []);
      setVendors(vendorsData || []);
      setParts(partsData || []);
      
      console.log('Set vehicles:', vehiclesData?.length || 0);
      console.log('Set vendors:', vendorsData?.length || 0);
      console.log('Set parts:', partsData?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch form data"
      });
    }
  };

  const fetchParts = async () => {
    if (!currentSubsidiary?.id) return;

    try {
      const { data: partsData, error: partsError } = await supabase
        .from('parts_master')
        .select('id, name, part_number')
        .eq('subsidiary_id', currentSubsidiary.id)
        .eq('is_active', true);

      if (partsError) throw partsError;
      setParts(partsData || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const populateForm = () => {
    if (!ticket) return;

    setFormData({
      title: ticket.title || "",
      description: ticket.description || "",
      ticketType: ticket.ticket_type || "breakdown",
      priority: ticket.priority || "medium",
      urgency: ticket.urgency || "within_week",
      vehicleId: ticket.vehicle_id || "",
      estimatedLaborHours: ticket.estimated_labor_hours?.toString() || "",
      estimatedLaborRate: ticket.estimated_labor_rate?.toString() || "",
      requestedCompletionDate: ticket.requested_completion_date ? 
        format(new Date(ticket.requested_completion_date), 'yyyy-MM-dd') : "",
      assignedVendorId: ticket.assigned_vendor_id || "none"
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      ticketType: "breakdown",
      priority: "medium",
      urgency: "within_week",
      vehicleId: "",
      estimatedLaborHours: "",
      estimatedLaborRate: "",
      requestedCompletionDate: "",
      assignedVendorId: "none"
    });
    setSelectedParts([]);
    setPartSearchStates([false]);
  };

  const addPart = () => {
    setSelectedParts([...selectedParts, {
      partId: "select-part",
      name: "",
      quantity: 1,
      estimatedCost: 0
    }]);
    setPartSearchStates([...partSearchStates, false]);
  };

  const updatePart = (index: number, field: keyof SelectedPart, value: any) => {
    const updated = [...selectedParts];
    updated[index] = { ...updated[index], [field]: value };
    
    // If partId is updated, find the part name
    if (field === 'partId') {
      const part = parts.find(p => p.id === value);
      if (part) {
        updated[index].name = part.name;
      }
    }
    
    setSelectedParts(updated);
  };

  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
    setPartSearchStates(partSearchStates.filter((_, i) => i !== index));
  };

  const handlePartSelect = (index: number, partId: string) => {
    updatePart(index, 'partId', partId);
    const updatedStates = [...partSearchStates];
    updatedStates[index] = false;
    setPartSearchStates(updatedStates);
  };

  const handlePartDialogSuccess = () => {
    setPartDialogOpen(false);
    fetchParts(); // Refresh parts list
  };

  const calculateCosts = () => {
    const laborCost = parseFloat(formData.estimatedLaborHours) * parseFloat(formData.estimatedLaborRate) || 0;
    const partsCost = selectedParts.reduce((sum, part) => sum + (part.quantity * part.estimatedCost), 0);
    return {
      laborCost,
      partsCost,
      totalCost: laborCost + partsCost
    };
  };

  const generateTicketNumber = async () => {
    const { data, error } = await supabase.rpc('generate_ticket_number');
    if (error) throw error;
    return data;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!currentSubsidiary?.id) return;

    setLoading(true);
    try {
      const costs = calculateCosts();
      const ticketNumber = ticket?.ticket_number || await generateTicketNumber();

      const ticketData = {
        ticket_number: ticketNumber,
        vehicle_id: formData.vehicleId,
        subsidiary_id: currentSubsidiary.id,
        title: formData.title,
        description: formData.description,
        ticket_type: formData.ticketType,
        priority: formData.priority,
        urgency: formData.urgency,
        status: isDraft ? 'draft' : 'submitted',
        estimated_labor_hours: parseFloat(formData.estimatedLaborHours) || null,
        estimated_labor_rate: parseFloat(formData.estimatedLaborRate) || null,
        estimated_labor_cost: costs.laborCost || null,
        estimated_parts_cost: costs.partsCost || null,
        estimated_total_cost: costs.totalCost || null,
        requested_completion_date: formData.requestedCompletionDate || null,
        assigned_vendor_id: formData.assignedVendorId === "none" ? null : formData.assignedVendorId || null,
        submitted_at: !isDraft ? new Date().toISOString() : null
      };

      let ticketId: string;

      if (ticket) {
        // Update existing ticket
        const { error } = await supabase
          .from('service_tickets')
          .update(ticketData as any)
          .eq('id', ticket.id);

        if (error) throw error;
        ticketId = ticket.id;
      } else {
        // Create new ticket
        const { data: newTicket, error } = await supabase
          .from('service_tickets')
          .insert([{ ...ticketData, created_by: (await supabase.auth.getUser()).data.user?.id } as any])
          .select('id')
          .single();

        if (error) throw error;
        ticketId = newTicket.id;
      }

      toast({
        title: "Success",
        description: `Service ticket ${isDraft ? 'saved as draft' : 'submitted'} successfully`
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving service ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save service ticket"
      });
    } finally {
      setLoading(false);
    }
  };

  const costs = calculateCosts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ticket ? `Edit Service Ticket ${ticket.ticket_number}` : 'Create Service Ticket'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the maintenance required"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle *</Label>
                    <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ticket Type</Label>
                    <Select value={formData.ticketType} onValueChange={(value: any) => setFormData({ ...formData, ticketType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakdown">Breakdown</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Urgency</Label>
                    <Select value={formData.urgency} onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="within_24h">Within 24 Hours</SelectItem>
                        <SelectItem value="within_week">Within a Week</SelectItem>
                        <SelectItem value="scheduled">Can be Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimation */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Estimation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborHours">Estimated Labor Hours</Label>
                    <Input
                      id="laborHours"
                      type="number"
                      step="0.5"
                      value={formData.estimatedLaborHours}
                      onChange={(e) => setFormData({ ...formData, estimatedLaborHours: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="laborRate">Labor Rate per Hour (₹)</Label>
                    <Input
                      id="laborRate"
                      type="number"
                      value={formData.estimatedLaborRate}
                      onChange={(e) => setFormData({ ...formData, estimatedLaborRate: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Parts Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Required Parts</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPart}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Part
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {selectedParts.map((part, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Popover open={partSearchStates[index]} onOpenChange={(open) => {
                            const updatedStates = [...partSearchStates];
                            updatedStates[index] = open;
                            setPartSearchStates(updatedStates);
                          }}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={partSearchStates[index]}
                                className="w-full justify-between"
                              >
                                {part.partId && part.partId !== "select-part" ? 
                                  (() => {
                                    const selectedPart = parts.find(p => p.id === part.partId);
                                    return selectedPart ? 
                                      `${selectedPart.name} ${selectedPart.part_number ? `(${selectedPart.part_number})` : ''}` 
                                      : "Select part";
                                  })()
                                  : "Select part"
                                }
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search parts..." />
                                <CommandList>
                                  <CommandEmpty>
                                    <div className="py-2 px-2">
                                      <p className="text-sm text-muted-foreground mb-2">No parts found.</p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setPartDialogOpen(true);
                                          const updatedStates = [...partSearchStates];
                                          updatedStates[index] = false;
                                          setPartSearchStates(updatedStates);
                                        }}
                                        className="w-full"
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Part
                                      </Button>
                                    </div>
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {parts.map((p) => (
                                      <CommandItem
                                        key={p.id}
                                        value={`${p.name} ${p.part_number || ''}`}
                                        onSelect={() => handlePartSelect(index, p.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            part.partId === p.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {p.name} {p.part_number && `(${p.part_number})`}
                                      </CommandItem>
                                    ))}
                                    <CommandItem
                                      onSelect={() => {
                                        setPartDialogOpen(true);
                                        const updatedStates = [...partSearchStates];
                                        updatedStates[index] = false;
                                        setPartSearchStates(updatedStates);
                                      }}
                                      className="border-t"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add New Part
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={part.quantity}
                            onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="Cost"
                            value={part.estimatedCost}
                            onChange={(e) => updatePart(index, 'estimatedCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removePart(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduling & Vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="completionDate">Requested Completion Date</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={formData.requestedCompletionDate}
                      onChange={(e) => setFormData({ ...formData, requestedCompletionDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Preferred Vendor</Label>
                    <Select value={formData.assignedVendorId} onValueChange={(value) => setFormData({ ...formData, assignedVendorId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No preference</SelectItem>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Labor Cost:</span>
                  <span>₹{costs.laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parts Cost:</span>
                  <span>₹{costs.partsCost.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total Estimated:</span>
                  <span>₹{costs.totalCost.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading || !formData.title || !formData.description || !formData.vehicleId}
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      <PartDialog
        open={partDialogOpen}
        onOpenChange={setPartDialogOpen}
        onSuccess={handlePartDialogSuccess}
      />
    </Dialog>
  );
}