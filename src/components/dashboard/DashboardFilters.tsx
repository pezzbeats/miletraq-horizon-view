import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface FilterState {
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  customDateFrom?: Date;
  customDateTo?: Date;
  vehicles: string[];
  drivers: string[];
  costCategories: string[];
  status: 'all' | 'active' | 'inactive' | 'maintenance';
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  vehicles?: Array<{ id: string; vehicle_number: string }>;
  drivers?: Array<{ id: string; name: string }>;
  className?: string;
}

export const DashboardFilters = ({
  filters,
  onFiltersChange,
  vehicles = [],
  drivers = [],
  className = ''
}: DashboardFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const costCategoryOptions = [
    { value: 'fuel', label: 'Fuel' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'parts', label: 'Parts' },
    { value: 'documents', label: 'Documents' },
    { value: 'insurance', label: 'Insurance' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'In Maintenance' }
  ];

  const handleReset = () => {
    onFiltersChange({
      dateRange: 'last_30_days',
      vehicles: [],
      drivers: [],
      costCategories: [],
      status: 'all'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== 'last_30_days') count++;
    if (filters.vehicles.length > 0) count++;
    if (filters.drivers.length > 0) count++;
    if (filters.costCategories.length > 0) count++;
    if (filters.status !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Dashboard Filters</h4>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: value as FilterState['dateRange']
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {filters.customDateFrom ? format(filters.customDateFrom, 'MMM dd') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.customDateFrom}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            customDateFrom: date
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {filters.customDateTo ? format(filters.customDateTo, 'MMM dd') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.customDateTo}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            customDateTo: date
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value as FilterState['status']
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cost Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {costCategoryOptions.map((category) => (
                  <Button
                    key={category.value}
                    variant={filters.costCategories.includes(category.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newCategories = filters.costCategories.includes(category.value)
                        ? filters.costCategories.filter(c => c !== category.value)
                        : [...filters.costCategories, category.value];
                      onFiltersChange({
                        ...filters,
                        costCategories: newCategories
                      });
                    }}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {filters.dateRange !== 'last_30_days' && (
          <Badge variant="secondary" className="text-xs">
            {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
          </Badge>
        )}
        {filters.vehicles.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {filters.vehicles.length} vehicles
          </Badge>
        )}
        {filters.drivers.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {filters.drivers.length} drivers
          </Badge>
        )}
        {filters.costCategories.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {filters.costCategories.length} categories
          </Badge>
        )}
        {filters.status !== 'all' && (
          <Badge variant="secondary" className="text-xs">
            {statusOptions.find(opt => opt.value === filters.status)?.label}
          </Badge>
        )}
      </div>
    </div>
  );
};