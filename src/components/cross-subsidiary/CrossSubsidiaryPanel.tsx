import React from 'react';
import { Building2, ArrowRightLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleTransferDialog } from '@/components/cross-subsidiary/VehicleTransferDialog';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';

interface CrossSubsidiaryPanelProps {
  onVehicleTransfer?: (vehicle: any) => void;
}

export function CrossSubsidiaryPanel({ onVehicleTransfer }: CrossSubsidiaryPanelProps) {
  const { subsidiaries, allSubsidiariesView } = useSubsidiary();

  if (!allSubsidiariesView || subsidiaries.length < 2) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Cross-Subsidiary Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              // Would open vehicle transfer selector
              console.log('Open vehicle transfer');
            }}
          >
            <Building2 className="h-6 w-6" />
            <span className="text-sm">Transfer Vehicle</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              // Would open budget transfer dialog
              console.log('Open budget transfer');
            }}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Transfer Budget</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              // Would open shared resources
              console.log('Open shared resources');
            }}
          >
            <ArrowRightLeft className="h-6 w-6" />
            <span className="text-sm">Shared Resources</span>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Manage resources and operations across {subsidiaries.length} subsidiaries
        </p>
      </CardContent>
    </Card>
  );
}