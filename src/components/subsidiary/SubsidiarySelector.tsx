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
} from '@/components/ui/dropdown-menu';
import { Building, ChevronDown, Construction, Hotel, GraduationCap, Building2 } from 'lucide-react';

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

interface SubsidiarySelectorProps {
  compact?: boolean;
}

export function SubsidiarySelector({ compact = false }: SubsidiarySelectorProps) {
  const { subsidiaries, currentSubsidiary, setCurrentSubsidiary, loading } = useSubsidiary();

  if (loading || !currentSubsidiary) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg"></div>
        {!compact && <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>}
      </div>
    );
  }

  const Icon = businessTypeIcons[currentSubsidiary.business_type];

  if (subsidiaries.length <= 1) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 ${businessTypeColors[currentSubsidiary.business_type]} rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {!compact && (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{currentSubsidiary.subsidiary_name}</span>
            <span className="text-xs text-muted-foreground">{currentSubsidiary.subsidiary_code}</span>
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
        <DropdownMenuContent align="end" className="w-64">
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
                {subsidiary.id === currentSubsidiary.id && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}