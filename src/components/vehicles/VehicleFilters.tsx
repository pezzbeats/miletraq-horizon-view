import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type Subsidiary = Tables<'subsidiaries'>;

interface Filters {
  subsidiary: string;
  status: string;
  fuelType: string;
  make: string;
}

interface VehicleFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  vehicles: Vehicle[];
  subsidiaries: Subsidiary[];
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFiltersChange,
  vehicles,
  subsidiaries,
}) => {
  const uniqueMakes = Array.from(new Set(vehicles.map(v => v.make))).sort();
  const uniqueStatuses = Array.from(new Set(vehicles.map(v => v.status || 'active'))).sort();
  const uniqueFuelTypes = Array.from(new Set(vehicles.map(v => v.fuel_type))).sort();

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilter = (key: keyof Filters) => {
    onFiltersChange({
      ...filters,
      [key]: '',
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      subsidiary: '',
      status: '',
      fuelType: '',
      make: '',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-2"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Subsidiary Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subsidiary</label>
              <Select
                value={filters.subsidiary || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, subsidiary: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subsidiaries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subsidiaries</SelectItem>
                  {subsidiaries.map((subsidiary) => (
                    <SelectItem key={subsidiary.id} value={subsidiary.id}>
                      {subsidiary.subsidiary_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fuel Type</label>
              <Select
                value={filters.fuelType || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, fuelType: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All fuel types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fuel types</SelectItem>
                  {uniqueFuelTypes.map((fuelType) => (
                    <SelectItem key={fuelType} value={fuelType}>
                      {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Make Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Make</label>
              <Select
                value={filters.make || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, make: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.subsidiary && (
            <Badge variant="secondary" className="gap-1">
              Subsidiary: {subsidiaries.find(s => s.id === filters.subsidiary)?.subsidiary_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter('subsidiary')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter('status')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.fuelType && (
            <Badge variant="secondary" className="gap-1">
              Fuel: {filters.fuelType}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter('fuelType')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.make && (
            <Badge variant="secondary" className="gap-1">
              Make: {filters.make}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter('make')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};