import { useState } from 'react';
import { Filter, X, Calendar, Car, User, DollarSign, BarChart3, Download, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export interface FilterState {
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  customDateRange?: DateRange;
  vehicles: string[];
  drivers: string[];
  costCategories: string[];
  status: 'all' | 'active' | 'inactive' | 'maintenance';
  fuelTypes: string[];
  costRange: [number, number];
  mileageRange: [number, number];
  subsidiaries: string[];
  searchQuery?: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  vehicles?: Array<{ id: string; vehicle_number: string; make: string; model: string; }>;
  drivers?: Array<{ id: string; name: string; }>;
  subsidiaries?: Array<{ id: string; subsidiary_name: string; }>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  onExport?: () => void;
  savedFilters?: Array<{ name: string; filters: FilterState; }>;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  onLoadFilter?: (filters: FilterState) => void;
}

const dateRangeOptions = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom', label: 'Custom range' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Under Maintenance' }
];

const fuelTypeOptions = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' }
];

const costCategories = [
  { value: 'fuel', label: 'Fuel Costs' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'permits', label: 'Permits & Licenses' },
  { value: 'repairs', label: 'Repairs' }
];

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  vehicles = [],
  drivers = [],
  subsidiaries = [],
  isOpen,
  onOpenChange,
  className,
  onExport,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter
}: AdvancedFiltersProps) => {
  const [filterName, setFilterName] = useState('');

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: 'last_30_days',
      vehicles: [],
      drivers: [],
      costCategories: [],
      status: 'all',
      fuelTypes: [],
      costRange: [0, 100000],
      mileageRange: [0, 50],
      subsidiaries: [],
      searchQuery: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.vehicles.length > 0) count++;
    if (filters.drivers.length > 0) count++;
    if (filters.costCategories.length > 0) count++;
    if (filters.status !== 'all') count++;
    if (filters.fuelTypes.length > 0) count++;
    if (filters.subsidiaries.length > 0) count++;
    if (filters.dateRange !== 'last_30_days') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  if (!isOpen) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(true)}
          className="h-10 bg-background/50 backdrop-blur-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-10 bg-background/50 backdrop-blur-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('w-full max-w-4xl bg-background/95 backdrop-blur-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Save className="h-4 w-4" />
              Saved Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadFilter?.(saved.filters)}
                  className="h-8"
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              value={filters.dateRange}
              onValueChange={(value: any) => updateFilter('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filters.dateRange === 'custom' && (
              <DatePickerWithRange
                date={filters.customDateRange}
                onDateChange={(range) => updateFilter('customDateRange', range)}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Vehicles and Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles ({filters.vehicles.length} selected)
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vehicle-${vehicle.id}`}
                    checked={filters.vehicles.includes(vehicle.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('vehicles', [...filters.vehicles, vehicle.id]);
                      } else {
                        updateFilter('vehicles', filters.vehicles.filter(v => v !== vehicle.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={`vehicle-${vehicle.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Drivers */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Drivers ({filters.drivers.length} selected)
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
              {drivers.map(driver => (
                <div key={driver.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`driver-${driver.id}`}
                    checked={filters.drivers.includes(driver.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('drivers', [...filters.drivers, driver.id]);
                      } else {
                        updateFilter('drivers', filters.drivers.filter(d => d !== driver.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={`driver-${driver.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {driver.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Status and Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Status</h4>
            <Select
              value={filters.status}
              onValueChange={(value: any) => updateFilter('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Types */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Fuel Types</h4>
            <div className="space-y-2">
              {fuelTypeOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fuel-${option.value}`}
                    checked={filters.fuelTypes.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('fuelTypes', [...filters.fuelTypes, option.value]);
                      } else {
                        updateFilter('fuelTypes', filters.fuelTypes.filter(f => f !== option.value));
                      }
                    }}
                  />
                  <label htmlFor={`fuel-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Cost Categories</h4>
            <div className="space-y-2">
              {costCategories.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cost-${option.value}`}
                    checked={filters.costCategories.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('costCategories', [...filters.costCategories, option.value]);
                      } else {
                        updateFilter('costCategories', filters.costCategories.filter(c => c !== option.value));
                      }
                    }}
                  />
                  <label htmlFor={`cost-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cost Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Range: ₹{filters.costRange[0].toLocaleString()} - ₹{filters.costRange[1].toLocaleString()}
            </h4>
            <Slider
              value={filters.costRange}
              onValueChange={(value) => updateFilter('costRange', value)}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
          </div>

          {/* Mileage Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Mileage Range: {filters.mileageRange[0]} - {filters.mileageRange[1]} km/l
            </h4>
            <Slider
              value={filters.mileageRange}
              onValueChange={(value) => updateFilter('mileageRange', value)}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Save Filter */}
        {onSaveFilter && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <input
              type="text"
              placeholder="Filter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
            />
            <Button
              size="sm"
              onClick={() => {
                if (filterName.trim()) {
                  onSaveFilter(filterName.trim(), filters);
                  setFilterName('');
                }
              }}
              disabled={!filterName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};