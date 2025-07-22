import { useState } from 'react';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Building, ChevronDown, Construction, Hotel, GraduationCap, Building2, Globe } from 'lucide-react';

const businessTypeIcons = {
  construction: Construction,
  hospitality: Hotel,
  education: GraduationCap,
  other: Building2,
};

const businessTypeColors = {
  construction: 'bg-orange-500',
  hospitality: 'bg-blue-500',
  education: 'bg-green-500',
  other: 'bg-gray-500',
};

const permissionLabels = {
  full_access: 'Full Access',
  operational_access: 'Operational',
  read_only_access: 'Read Only',
  fuel_only_access: 'Fuel Only',
  maintenance_only_access: 'Maintenance Only',
};

const permissionColors = {
  full_access: 'bg-green-500',
  operational_access: 'bg-blue-500',
  read_only_access: 'bg-gray-500',
  fuel_only_access: 'bg-yellow-500',
  maintenance_only_access: 'bg-purple-500',
};

interface SubsidiarySelectorProps {
  compact?: boolean;
}

export function SubsidiarySelector({ compact = false }: SubsidiarySelectorProps) {
  const { 
    subsidiaries, 
    currentSubsidiary, 
    allSubsidiariesView,
    setCurrentSubsidiary, 
    loading,
    hasMultipleSubsidiaries
  } = useSubsidiary();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg"></div>
        {!compact && <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>}
      </div>
    );
  }

  // Handle "All Subsidiaries" view
  if (allSubsidiariesView) {
    if (!hasMultipleSubsidiaries) {
      return null;
    }

    if (compact) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                <Globe className="h-3 w-3 text-white" />
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuItem
              onClick={() => setCurrentSubsidiary(null)}
              className="flex items-center gap-3 p-3 bg-muted/50"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">All Subsidiaries</div>
                <div className="text-sm text-muted-foreground">Consolidated view</div>
              </div>
              <Badge variant="default" className="text-xs">Current</Badge>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {subsidiaries.map((subsidiary) => {
              const SubIcon = businessTypeIcons[subsidiary.business_type];
              return (
                <DropdownMenuItem
                  key={subsidiary.id}
                  onClick={() => setCurrentSubsidiary(subsidiary)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className={`w-8 h-8 ${businessTypeColors[subsidiary.business_type]} rounded-lg flex items-center justify-center`}>
                    <SubIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{subsidiary.subsidiary_name}</div>
                    <div className="text-sm text-muted-foreground">{subsidiary.subsidiary_code}</div>
                  </div>
                  {subsidiary.permission_level && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${permissionColors[subsidiary.permission_level]} text-white border-0`}
                    >
                      {permissionLabels[subsidiary.permission_level]}
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Globe className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm">All Subsidiaries</span>
          <span className="text-xs text-muted-foreground">Consolidated view</span>
        </div>
      </div>
    );
  }

  // Handle single subsidiary view
  if (!currentSubsidiary) {
    return null;
  }

  const Icon = businessTypeIcons[currentSubsidiary.business_type];

  if (!hasMultipleSubsidiaries) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 ${businessTypeColors[currentSubsidiary.business_type]} rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {!compact && (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{currentSubsidiary.subsidiary_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{currentSubsidiary.subsidiary_code}</span>
              {currentSubsidiary.permission_level && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${permissionColors[currentSubsidiary.permission_level]} text-white border-0`}
                >
                  {permissionLabels[currentSubsidiary.permission_level]}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className={`w-6 h-6 ${businessTypeColors[currentSubsidiary.business_type]} rounded flex items-center justify-center`}>
              <Icon className="h-3 w-3 text-white" />
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          {hasMultipleSubsidiaries && (
            <>
              <DropdownMenuItem
                onClick={() => setCurrentSubsidiary(null)}
                className="flex items-center gap-3 p-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">All Subsidiaries</div>
                  <div className="text-sm text-muted-foreground">Consolidated view</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {subsidiaries.map((subsidiary) => {
            const SubIcon = businessTypeIcons[subsidiary.business_type];
            return (
              <DropdownMenuItem
                key={subsidiary.id}
                onClick={() => setCurrentSubsidiary(subsidiary)}
                className="flex items-center gap-3 p-3"
              >
                <div className={`w-8 h-8 ${businessTypeColors[subsidiary.business_type]} rounded-lg flex items-center justify-center`}>
                  <SubIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{subsidiary.subsidiary_name}</div>
                  <div className="text-sm text-muted-foreground">{subsidiary.subsidiary_code}</div>
                </div>
                <div className="flex flex-col gap-1">
                  {subsidiary.id === currentSubsidiary.id && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                  {subsidiary.permission_level && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${permissionColors[subsidiary.permission_level]} text-white border-0`}
                    >
                      {permissionLabels[subsidiary.permission_level]}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full non-compact selector for multiple subsidiaries
  return (
    <Select
      value={currentSubsidiary.id}
      onValueChange={(value) => {
        if (value === "all_subsidiaries") {
          setCurrentSubsidiary(null);
        } else {
          const selected = subsidiaries.find(sub => sub.id === value);
          if (selected) setCurrentSubsidiary(selected);
        }
      }}
    >
      <SelectTrigger className="w-64">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${businessTypeColors[currentSubsidiary.business_type]} rounded flex items-center justify-center`}>
              <Icon className="h-3 w-3 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{currentSubsidiary.subsidiary_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currentSubsidiary.subsidiary_code}</span>
                {currentSubsidiary.permission_level && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${permissionColors[currentSubsidiary.permission_level]} text-white border-0`}
                  >
                    {permissionLabels[currentSubsidiary.permission_level]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {hasMultipleSubsidiaries && (
          <SelectItem value="all_subsidiaries">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                <Globe className="h-3 w-3 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">All Subsidiaries</span>
                <span className="text-xs text-muted-foreground">Consolidated view</span>
              </div>
            </div>
          </SelectItem>
        )}
        
        {subsidiaries.map((subsidiary) => {
          const SubIcon = businessTypeIcons[subsidiary.business_type];
          return (
            <SelectItem key={subsidiary.id} value={subsidiary.id}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${businessTypeColors[subsidiary.business_type]} rounded flex items-center justify-center`}>
                  <SubIcon className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{subsidiary.subsidiary_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{subsidiary.subsidiary_code}</span>
                    {subsidiary.permission_level && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${permissionColors[subsidiary.permission_level]} text-white border-0`}
                      >
                        {permissionLabels[subsidiary.permission_level]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}