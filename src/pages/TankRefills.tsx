import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Fuel, Droplets, Zap, Plus, Search, Filter, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FuelTank {
  id: string;
  fuel_type: 'diesel' | 'petrol' | 'cng';
  current_volume: number;
  capacity: number;
  unit: 'liters' | 'kg';
  tank_location: string;
}

interface FuelPurchase {
  id: string;
  purchase_date: string;
  fuel_type: string;
  volume: number;
  unit: string;
  rate_per_liter: number;
  total_cost: number;
  vendor_id: string;
  tank_id: string;
  invoice_number?: string;
  vendors?: {
    name: string;
  };
  fuel_tanks?: {
    tank_location: string;
  };
}

interface Vendor {
  id: string;
  name: string;
  vendor_type: string[];
}

export default function TankRefills() {
  const [tanks, setTanks] = useState<FuelTank[]>([]);
  const [purchases, setPurchases] = useState<FuelPurchase[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuelType, setSelectedFuelType] = useState<'diesel' | 'petrol' | 'cng'>('diesel');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { currentSubsidiary } = useSubsidiary();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    tank_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    volume: '',
    rate_per_liter: '',
    total_cost: '',
    vendor_id: '',
    invoice_number: '',
    remarks: ''
  });

  useEffect(() => {
    if (currentSubsidiary?.id) {
      fetchData();
    }
  }, [currentSubsidiary]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchTanks(),
        fetchPurchases(),
        fetchVendors()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTanks = async () => {
    const { data, error } = await supabase
      .from('fuel_tanks')
      .select('*')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .eq('is_active', true)
      .order('fuel_type');

    if (error) throw error;
    setTanks(data || []);
  };

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('fuel_purchases')
      .select(`
        *,
        vendors!inner(name),
        fuel_tanks!inner(tank_location)
      `)
      .eq('subsidiary_id', currentSubsidiary?.id)
      .order('purchase_date', { ascending: false });

    if (error) throw error;
    setPurchases(data || []);
  };

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, name, vendor_type')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .eq('is_active', true);

    if (error) throw error;
    setVendors(data || []);
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'diesel': return <Fuel className="h-4 w-4 text-blue-600" />;
      case 'petrol': return <Droplets className="h-4 w-4 text-green-600" />;
      case 'cng': return <Zap className="h-4 w-4 text-orange-600" />;
      default: return <Fuel className="h-4 w-4" />;
    }
  };

  const getFuelBadgeColor = (fuelType: string) => {
    switch (fuelType) {
      case 'diesel': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'petrol': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cng': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getUnit = (fuelType: string) => {
    return fuelType === 'cng' ? 'kg' : 'liters';
  };

  const filteredTanks = tanks.filter(tank => tank.fuel_type === selectedFuelType);
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.vendors?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || purchase.purchase_date >= dateFilter;
    const matchesFuelType = purchase.fuel_type === selectedFuelType;
    
    return matchesSearch && matchesDate && matchesFuelType;
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total cost
      if (field === 'volume' || field === 'rate_per_liter') {
        const volume = parseFloat(field === 'volume' ? value : updated.volume);
        const rate = parseFloat(field === 'rate_per_liter' ? value : updated.rate_per_liter);
        if (!isNaN(volume) && !isNaN(rate)) {
          updated.total_cost = (volume * rate).toFixed(2);
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedTank = tanks.find(tank => tank.id === formData.tank_id);
      if (!selectedTank) {
        toast({
          title: "Error",
          description: "Please select a valid tank",
          variant: "destructive"
        });
        return;
      }

      // Check if volume exceeds remaining capacity
      const remainingCapacity = selectedTank.capacity - selectedTank.current_volume;
      const volume = parseFloat(formData.volume);
      
      if (volume > remainingCapacity) {
        toast({
          title: "Volume Exceeds Capacity",
          description: `Tank has only ${remainingCapacity.toFixed(2)} ${selectedTank.unit} remaining capacity`,
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('fuel_purchases')
        .insert([{
          subsidiary_id: currentSubsidiary?.id,
          tank_id: formData.tank_id,
          fuel_type: selectedTank.fuel_type,
          purchase_date: formData.purchase_date,
          volume: parseFloat(formData.volume),
          unit: selectedTank.unit,
          rate_per_liter: parseFloat(formData.rate_per_liter),
          total_cost: parseFloat(formData.total_cost),
          vendor_id: formData.vendor_id,
          invoice_number: formData.invoice_number || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fuel purchase recorded successfully",
      });

      setShowDialog(false);
      setFormData({
        tank_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        volume: '',
        rate_per_liter: '',
        total_cost: '',
        vendor_id: '',
        invoice_number: '',
        remarks: ''
      });
      
      fetchData();
    } catch (error) {
      console.error('Error saving fuel purchase:', error);
      toast({
        title: "Error",
        description: "Failed to record fuel purchase",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tank Refills</h1>
          <p className="text-muted-foreground">Manage fuel purchases and tank refills</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Fuel Purchase</DialogTitle>
              <DialogDescription>
                Add a new fuel purchase to update tank levels
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tank_id">Tank Selection *</Label>
                  <Select value={formData.tank_id} onValueChange={(value) => handleFormChange('tank_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tank" />
                    </SelectTrigger>
                    <SelectContent>
                      {tanks.map((tank) => (
                        <SelectItem key={tank.id} value={tank.id}>
                          <div className="flex items-center space-x-2">
                            {getFuelIcon(tank.fuel_type)}
                            <span>
                              {tank.fuel_type.charAt(0).toUpperCase() + tank.fuel_type.slice(1)} Tank - 
                              Current: {tank.current_volume.toLocaleString()}/{tank.capacity.toLocaleString()} {tank.unit}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="purchase_date">Purchase Date *</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleFormChange('purchase_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor_id">Vendor *</Label>
                  <Select value={formData.vendor_id} onValueChange={(value) => handleFormChange('vendor_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors
                        .filter(vendor => vendor.vendor_type.includes('fuel'))
                        .map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => handleFormChange('invoice_number', e.target.value)}
                    placeholder="INV-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="volume">
                    Volume/Quantity * {formData.tank_id && 
                      `(${getUnit(tanks.find(t => t.id === formData.tank_id)?.fuel_type || 'diesel')})`}
                  </Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.01"
                    value={formData.volume}
                    onChange={(e) => handleFormChange('volume', e.target.value)}
                    placeholder="1000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="rate_per_liter">
                    Cost per Unit *
                  </Label>
                  <Input
                    id="rate_per_liter"
                    type="number"
                    step="0.01"
                    value={formData.rate_per_liter}
                    onChange={(e) => handleFormChange('rate_per_liter', e.target.value)}
                    placeholder="75.50"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="total_cost">Total Cost *</Label>
                  <Input
                    id="total_cost"
                    type="number"
                    step="0.01"
                    value={formData.total_cost}
                    onChange={(e) => handleFormChange('total_cost', e.target.value)}
                    placeholder="Auto-calculated"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Record Purchase
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedFuelType} onValueChange={(value) => setSelectedFuelType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diesel" className="flex items-center space-x-2">
            <Fuel className="h-4 w-4" />
            <span>Diesel</span>
          </TabsTrigger>
          <TabsTrigger value="petrol" className="flex items-center space-x-2">
            <Droplets className="h-4 w-4" />
            <span>Petrol</span>
          </TabsTrigger>
          <TabsTrigger value="cng" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>CNG</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFuelType} className="space-y-6">
          {/* Tank Status for Selected Fuel Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTanks.map((tank) => {
              const percentage = (tank.current_volume / tank.capacity) * 100;
              return (
                <Card key={tank.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getFuelIcon(tank.fuel_type)}
                        <div>
                          <CardTitle className="text-sm">{tank.tank_location}</CardTitle>
                          <CardDescription className="capitalize">{tank.fuel_type} Tank</CardDescription>
                        </div>
                      </div>
                      <Badge variant={percentage > 50 ? "default" : percentage > 20 ? "secondary" : "destructive"}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span>{tank.current_volume.toLocaleString()} {tank.unit}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 {tank.unit}</span>
                        <span>{tank.capacity.toLocaleString()} {tank.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </div>

          {/* Purchase History */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase History - {selectedFuelType.charAt(0).toUpperCase() + selectedFuelType.slice(1)}</CardTitle>
              <CardDescription>Recent fuel purchases and tank refills</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tank</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFuelIcon(purchase.fuel_type)}
                          <span>{purchase.fuel_tanks?.tank_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {purchase.volume.toLocaleString()} {purchase.unit}
                      </TableCell>
                      <TableCell>₹{purchase.rate_per_liter.toFixed(2)}</TableCell>
                      <TableCell>₹{purchase.total_cost.toLocaleString()}</TableCell>
                      <TableCell>{purchase.vendors?.name}</TableCell>
                      <TableCell>
                        {purchase.invoice_number ? (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{purchase.invoice_number}</span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No fuel purchases found for {selectedFuelType}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}