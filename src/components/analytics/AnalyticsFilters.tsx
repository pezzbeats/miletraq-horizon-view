import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
  };
  vehicles: string[];
  drivers: string[];
  categories: string[];
}

interface AnalyticsFiltersProps {
  filters: FilterState;
  vehicles: any[];
  drivers: any[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export const AnalyticsFilters = ({
  filters,
  vehicles,
  drivers,
  onFilterChange,
}: AnalyticsFiltersProps) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const handleDateRangeSelect = (range: { from: Date; to: Date } | undefined) => {
    if (range) {
      onFilterChange({ dateRange: range });
    }
  };

  const handleVehicleToggle = (vehicleId: string, checked: boolean) => {
    const newVehicles = checked
      ? [...filters.vehicles, vehicleId]
      : filters.vehicles.filter(id => id !== vehicleId);
    onFilterChange({ vehicles: newVehicles });
  };

  const handleDriverToggle = (driverId: string, checked: boolean) => {
    const newDrivers = checked
      ? [...filters.drivers, driverId]
      : filters.drivers.filter(id => id !== driverId);
    onFilterChange({ drivers: newDrivers });
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFilterChange({ categories: newCategories });
  };

  const handleQuickDateRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onFilterChange({ dateRange: { from, to } });
  };

  const resetFilters = () => {
    onFilterChange({
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
      vehicles: [],
      drivers: [],
      categories: ['fuel', 'maintenance', 'parts', 'labour'],
    });
  };

  const categories = [
    { id: 'fuel', label: 'Fuel' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'parts', label: 'Parts' },
    { id: 'labour', label: 'Labour' },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Date Range</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(7)}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(30)}
          >
            Last 30 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(90)}
          >
            Last 90 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(365)}
          >
            Last year
          </Button>
          <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Custom range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={{
                  from: filters.dateRange?.from,
                  to: filters.dateRange?.to,
                }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Vehicles Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Vehicles ({filters.vehicles.length} selected)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center space-x-2">
              <Checkbox
                id={vehicle.id}
                checked={filters.vehicles.includes(vehicle.id)}
                onCheckedChange={(checked) =>
                  handleVehicleToggle(vehicle.id, checked as boolean)
                }
              />
              <Label
                htmlFor={vehicle.id}
                className="text-sm font-normal cursor-pointer"
              >
                {vehicle.vehicle_number}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Drivers Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Drivers ({filters.drivers.length} selected)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
          {drivers.map((driver) => (
            <div key={driver.id} className="flex items-center space-x-2">
              <Checkbox
                id={driver.id}
                checked={filters.drivers.includes(driver.id)}
                onCheckedChange={(checked) =>
                  handleDriverToggle(driver.id, checked as boolean)
                }
              />
              <Label
                htmlFor={driver.id}
                className="text-sm font-normal cursor-pointer"
              >
                {driver.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) =>
                  handleCategoryToggle(category.id, checked as boolean)
                }
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-normal cursor-pointer"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};