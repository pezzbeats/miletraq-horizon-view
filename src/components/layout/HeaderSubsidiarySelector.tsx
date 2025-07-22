import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Building2, Globe, ChevronDown, Info } from 'lucide-react';

export function HeaderSubsidiarySelector() {
  const { 
    subsidiaries, 
    currentSubsidiary, 
    allSubsidiariesView,
    hasMultipleSubsidiaries,
    setCurrentSubsidiary 
  } = useSubsidiary();

  if (!hasMultipleSubsidiaries) {
    return <SubsidiarySelector compact />;
  }

  return (
    <div className="flex items-center gap-2">
      <SubsidiarySelector compact />
      
      {/* Info popover for multi-subsidiary users */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Info className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Subsidiary Context
              </h4>
              <p className="text-sm text-muted-foreground">
                You have access to {subsidiaries.length} subsidiaries. Your current view determines which data you see.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Current View:</h5>
                {allSubsidiariesView ? (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">All Subsidiaries</span>
                    <Badge variant="secondary" className="text-xs">Consolidated</Badge>
                  </div>
                ) : currentSubsidiary ? (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Building2 className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{currentSubsidiary.subsidiary_name}</div>
                      <div className="text-xs text-muted-foreground">{currentSubsidiary.subsidiary_code}</div>
                    </div>
                    {currentSubsidiary.permission_level && (
                      <Badge variant="outline" className="text-xs">
                        {currentSubsidiary.permission_level.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">Available Subsidiaries:</h5>
                <div className="space-y-1">
                  {subsidiaries.map((subsidiary) => (
                    <div 
                      key={subsidiary.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer text-sm"
                      onClick={() => setCurrentSubsidiary(subsidiary)}
                    >
                      <Building2 className="h-3 w-3" />
                      <span className="flex-1">{subsidiary.subsidiary_name}</span>
                      {subsidiary.permission_level && (
                        <Badge variant="outline" className="text-xs">
                          {subsidiary.permission_level.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {hasMultipleSubsidiaries && (
                <>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setCurrentSubsidiary(null)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Switch to All Subsidiaries View
                  </Button>
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}