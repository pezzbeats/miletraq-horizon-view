import React, { useState, useEffect } from "react";
import { TruckIcon, Fuel, Plus, Minus, AlertTriangle, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/ui/mobile-card";

interface Transaction {
  id: string;
  transaction_type: 'purchase' | 'dispensed' | 'adjustment';
  transaction_date: string;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  total_cost?: number;
  level_before: number;
  level_after: number;
  remarks?: string;
  tank: {
    id: string;
    fuel_type: string;
    capacity: number;
  };
  vehicle?: {
    vehicle_number: string;
    make: string;
    model: string;
  };
  vendor?: {
    name: string;
  };
}

export const TankTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    vehicle: '',
  });
  const { currentSubsidiary } = useSubsidiary();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchTransactions = async () => {
    if (!currentSubsidiary?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('internal_tank_transactions')
        .select(`
          id,
          transaction_type,
          transaction_date,
          quantity,
          unit,
          cost_per_unit,
          total_cost,
          level_before,
          level_after,
          remarks,
          fuel_tanks!tank_id (
            id,
            fuel_type,
            capacity
          ),
          vehicles:vehicle_id (
            vehicle_number,
            make,
            model
          ),
          vendors:vendor_id (
            name
          )
        `)
        .eq('subsidiary_id', currentSubsidiary.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        transaction_type: item.transaction_type as 'purchase' | 'dispensed' | 'adjustment',
        transaction_date: item.transaction_date,
        quantity: item.quantity,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        total_cost: item.total_cost,
        level_before: item.level_before,
        level_after: item.level_after,
        remarks: item.remarks,
        tank: item.fuel_tanks,
        vehicle: item.vehicles,
        vendor: item.vendors,
      })) || [];

      setTransactions(formattedData);
      setFilteredTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching tank transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tank transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentSubsidiary?.id]);

  // Filter transactions based on selected filters
  useEffect(() => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter(t => t.transaction_type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.transaction_date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.transaction_date) <= new Date(filters.dateTo));
    }

    if (filters.vehicle) {
      filtered = filtered.filter(t => 
        t.vehicle?.vehicle_number.toLowerCase().includes(filters.vehicle.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TruckIcon className="h-4 w-4" />;
      case 'dispensed':
        return <Fuel className="h-4 w-4" />;
      case 'adjustment':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, any> = {
      purchase: 'default',
      dispensed: 'secondary',
      adjustment: 'outline'
    };
    return <Badge variant={variants[type] || 'outline'}>{type}</Badge>;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600';
      case 'dispensed':
        return 'text-blue-600';
      case 'adjustment':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      dateFrom: '',
      dateTo: '',
      vehicle: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tank transaction history...</div>
      </div>
    );
  }

  const totalPurchases = transactions.filter(t => t.transaction_type === 'purchase').length;
  const totalDispensed = transactions.filter(t => t.transaction_type === 'dispensed').length;
  const totalPurchaseVolume = transactions
    .filter(t => t.transaction_type === 'purchase')
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalDispensedVolume = transactions
    .filter(t => t.transaction_type === 'dispensed')
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tank Transaction History</h1>
          <p className="text-muted-foreground">
            Complete audit trail of all internal tank operations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">{totalPurchaseVolume.toFixed(1)}L purchased</p>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDispensed}</div>
            <p className="text-xs text-muted-foreground">{totalDispensedVolume.toFixed(1)}L dispensed</p>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Volume</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalPurchaseVolume - totalDispensedVolume).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">Purchase - Dispensed</p>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">All tank operations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type-filter">Transaction Type</Label>
              <Select value={filters.type || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="dispensed">Dispensed</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="vehicle-filter">Vehicle</Label>
              <Input
                id="vehicle-filter"
                placeholder="Search vehicle..."
                value={filters.vehicle}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
          <CardDescription>
            Complete history of tank operations ({filteredTransactions.length} transactions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No transactions found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {transactions.length === 0 ? "No tank transactions yet." : "Try adjusting your filters."}
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <MobileCard 
                  key={transaction.id} 
                  title={`${transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)} Transaction`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        <span className="font-medium">
                          {transaction.quantity.toFixed(1)} {transaction.unit}
                        </span>
                      </div>
                      {getTransactionBadge(transaction.transaction_type)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div>{new Date(transaction.transaction_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fuel Type:</span>
                        <div>{transaction.tank?.fuel_type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Before:</span>
                        <div>{transaction.level_before.toFixed(1)}L</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">After:</span>
                        <div>{transaction.level_after.toFixed(1)}L</div>
                      </div>
                    </div>

                    {transaction.vehicle && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <div>{transaction.vehicle.vehicle_number} - {transaction.vehicle.make} {transaction.vehicle.model}</div>
                      </div>
                    )}

                    {transaction.vendor && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Vendor:</span>
                        <div>{transaction.vendor.name}</div>
                      </div>
                    )}

                    {transaction.total_cost && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cost:</span>
                        <div>₹{transaction.total_cost.toFixed(2)}</div>
                      </div>
                    )}

                    {transaction.remarks && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Remarks:</span>
                        <div className="italic">{transaction.remarks}</div>
                      </div>
                    )}
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Fuel Type</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Level Before</th>
                    <th className="text-left p-2">Level After</th>
                    <th className="text-left p-2">Vehicle</th>
                    <th className="text-left p-2">Cost</th>
                    <th className="text-left p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          {getTransactionBadge(transaction.transaction_type)}
                        </div>
                      </td>
                      <td className="p-2">{transaction.tank?.fuel_type}</td>
                      <td className="p-2">
                        <span className={getTransactionColor(transaction.transaction_type)}>
                          {transaction.transaction_type === 'purchase' ? '+' : '-'}
                          {transaction.quantity.toFixed(1)} {transaction.unit}
                        </span>
                      </td>
                      <td className="p-2">{transaction.level_before.toFixed(1)}L</td>
                      <td className="p-2">{transaction.level_after.toFixed(1)}L</td>
                      <td className="p-2">
                        {transaction.vehicle 
                          ? `${transaction.vehicle.vehicle_number} - ${transaction.vehicle.make} ${transaction.vehicle.model}`
                          : transaction.vendor?.name || "N/A"
                        }
                      </td>
                      <td className="p-2">
                        {transaction.total_cost ? `₹${transaction.total_cost.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="p-2 max-w-xs truncate">
                        {transaction.remarks || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TankTransactionHistory;