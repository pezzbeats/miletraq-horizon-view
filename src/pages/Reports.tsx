import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  FileText, 
  Download,
  Calendar,
  Globe,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubsidiaryComparisonReport } from '@/components/reports/SubsidiaryComparisonReport';
import { SubsidiaryDataValidator } from '@/components/validation/SubsidiaryDataValidator';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Reports() {
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('comparison');

  const reportCards = [
    {
      id: 'comparison',
      title: 'Subsidiary Comparison',
      description: 'Compare performance metrics across all subsidiaries',
      icon: BarChart3,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      features: ['Cost Analysis', 'Performance Metrics', 'Trend Analysis', 'Export Capability']
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Verify data integrity and security across the system',
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      features: ['Data Isolation', 'Permission Testing', 'Security Checks', 'Mobile Validation']
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights and predictive analytics',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      features: ['Predictive Models', 'Anomaly Detection', 'Forecasting', 'AI Insights'],
      comingSoon: true
    },
    {
      id: 'compliance',
      title: 'Compliance Reports',
      description: 'Regulatory compliance and audit trails',
      icon: Building2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      features: ['Audit Trails', 'Compliance Checks', 'Document Status', 'Regulatory Reports'],
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold">Reports & Analytics</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          <p className="text-white/90 text-lg">
            {allSubsidiariesView 
              ? "Comprehensive reporting and analytics across all subsidiaries"
              : currentSubsidiary 
                ? `Reports and analytics for ${currentSubsidiary.subsidiary_name}`
                : "Comprehensive business intelligence and reporting tools"
            }
          </p>
        </div>
      </div>

      {/* Report Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card 
              key={report.id}
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                activeTab === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => !report.comingSoon && setActiveTab(report.id)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                  <IconComponent className={`h-6 w-6 ${report.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{report.title}</h3>
                  {report.comingSoon && (
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>
                <div className="space-y-1">
                  {report.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {!isMobile && 'Comparison'}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {!isMobile && 'Validation'}
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled className="flex items-center gap-2 opacity-50">
            <TrendingUp className="h-4 w-4" />
            {!isMobile && 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="compliance" disabled className="flex items-center gap-2 opacity-50">
            <Building2 className="h-4 w-4" />
            {!isMobile && 'Compliance'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <SubsidiaryComparisonReport />
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <SubsidiaryDataValidator />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Advanced analytics features including predictive models and AI insights are coming soon.
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Compliance Reports</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive compliance reporting and audit trail features are in development.
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Custom Filters
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}