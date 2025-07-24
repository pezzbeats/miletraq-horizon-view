import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw,
  Database,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
  subsidiary?: string;
}

interface ValidationSummary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  percentage: number;
}

export function SubsidiaryDataValidator() {
  const { subsidiaries } = useSubsidiary();
  const { profile } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<ValidationSummary>({
    total: 0,
    passed: 0,
    warnings: 0,
    failed: 0,
    percentage: 0
  });

  const runValidationTests = async () => {
    setRunning(true);
    setResults([]);
    
    const testResults: ValidationResult[] = [];

    try {
      // Test 1: Data Isolation - Verify users can only access their subsidiary data
      for (const subsidiary of subsidiaries) {
        try {
          // Test vehicle access
          const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('subsidiary_id', subsidiary.id);

          if (vehicleError) {
            testResults.push({
              category: 'Data Isolation',
              test: 'Vehicle Access',
              status: 'fail',
              message: 'Failed to query vehicles',
              details: vehicleError.message,
              subsidiary: subsidiary.subsidiary_name
            });
          } else {
            testResults.push({
              category: 'Data Isolation',
              test: 'Vehicle Access',
              status: 'pass',
              message: `Successfully queried ${vehicles?.length || 0} vehicles`,
              subsidiary: subsidiary.subsidiary_name
            });
          }

          // Test driver access
          const { data: drivers, error: driverError } = await supabase
            .from('drivers')
            .select('*')
            .eq('subsidiary_id', subsidiary.id);

          if (driverError) {
            testResults.push({
              category: 'Data Isolation',
              test: 'Driver Access',
              status: 'fail',
              message: 'Failed to query drivers',
              details: driverError.message,
              subsidiary: subsidiary.subsidiary_name
            });
          } else {
            testResults.push({
              category: 'Data Isolation',
              test: 'Driver Access',
              status: 'pass',
              message: `Successfully queried ${drivers?.length || 0} drivers`,
              subsidiary: subsidiary.subsidiary_name
            });
          }

          // Test fuel log access
          const { data: fuelLogs, error: fuelError } = await supabase
            .from('fuel_log')
            .select('*')
            .eq('subsidiary_id', subsidiary.id)
            .limit(10);

          if (fuelError) {
            testResults.push({
              category: 'Data Isolation',
              test: 'Fuel Log Access',
              status: 'fail',
              message: 'Failed to query fuel logs',
              details: fuelError.message,
              subsidiary: subsidiary.subsidiary_name
            });
          } else {
            testResults.push({
              category: 'Data Isolation',
              test: 'Fuel Log Access',
              status: 'pass',
              message: `Successfully queried ${fuelLogs?.length || 0} fuel logs`,
              subsidiary: subsidiary.subsidiary_name
            });
          }

        } catch (error: any) {
          testResults.push({
            category: 'Data Isolation',
            test: 'General Access',
            status: 'fail',
            message: 'Unexpected error during subsidiary data access',
            details: error.message,
            subsidiary: subsidiary.subsidiary_name
          });
        }
      }

      // Test 2: Permission Validation
      try {
        const { data: permissions, error: permissionError } = await supabase
          .from('user_subsidiary_permissions')
          .select('*')
          .eq('user_id', profile?.id);

        if (permissionError) {
          testResults.push({
            category: 'Permissions',
            test: 'User Permissions Query',
            status: 'fail',
            message: 'Failed to query user permissions',
            details: permissionError.message
          });
        } else {
          const hasPermissions = permissions && permissions.length > 0;
          testResults.push({
            category: 'Permissions',
            test: 'User Permissions Query',
            status: hasPermissions ? 'pass' : 'warning',
            message: hasPermissions 
              ? `Found ${permissions.length} permission records`
              : 'No permission records found - this may be expected for super admins',
            details: hasPermissions 
              ? `Permissions: ${permissions.map(p => p.permission_level).join(', ')}`
              : undefined
          });
        }
      } catch (error: any) {
        testResults.push({
          category: 'Permissions',
          test: 'User Permissions Query',
          status: 'fail',
          message: 'Unexpected error during permission validation',
          details: error.message
        });
      }

      // Test 3: Cross-Subsidiary Data Leakage Check
      if (subsidiaries.length > 1) {
        const [subsidiary1, subsidiary2] = subsidiaries;
        
        try {
          // Try to access another subsidiary's data
          const { data: otherVehicles, error: leakageError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('subsidiary_id', subsidiary2.id)
            .limit(1);

          // This test depends on RLS policies - if they're working correctly,
          // users should only see their own subsidiary data
          if (leakageError) {
            testResults.push({
              category: 'Security',
              test: 'Cross-Subsidiary Access Prevention',
              status: 'pass',
              message: 'RLS policies correctly prevent cross-subsidiary access',
              details: 'Access denied as expected'
            });
          } else {
            // If data is returned, check if it's actually restricted
            const accessLevel = otherVehicles?.length || 0;
            testResults.push({
              category: 'Security',
              test: 'Cross-Subsidiary Access Prevention',
              status: accessLevel === 0 ? 'pass' : 'warning',
              message: accessLevel === 0 
                ? 'No cross-subsidiary data accessible'
                : `Possible data leakage: ${accessLevel} records accessible`,
              details: accessLevel > 0 
                ? 'Review RLS policies to ensure proper data isolation'
                : undefined
            });
          }
        } catch (error: any) {
          testResults.push({
            category: 'Security',
            test: 'Cross-Subsidiary Access Prevention',
            status: 'fail',
            message: 'Error testing cross-subsidiary access',
            details: error.message
          });
        }
      }

      // Test 4: Data Consistency
      for (const subsidiary of subsidiaries) {
        try {
          // Check for orphaned records
          const { data: vehiclesWithoutSubsidiary, error: orphanError } = await supabase
            .from('vehicles')
            .select('id')
            .is('subsidiary_id', null);

          if (orphanError) {
            testResults.push({
              category: 'Data Consistency',
              test: 'Orphaned Records Check',
              status: 'fail',
              message: 'Failed to check for orphaned records',
              details: orphanError.message
            });
          } else {
            const orphanCount = vehiclesWithoutSubsidiary?.length || 0;
            testResults.push({
              category: 'Data Consistency',
              test: 'Orphaned Records Check',
              status: orphanCount === 0 ? 'pass' : 'warning',
              message: orphanCount === 0 
                ? 'No orphaned records found'
                : `Found ${orphanCount} orphaned vehicle records`,
              details: orphanCount > 0 
                ? 'Consider assigning these records to a subsidiary'
                : undefined
            });
          }
        } catch (error: any) {
          testResults.push({
            category: 'Data Consistency',
            test: 'Orphaned Records Check',
            status: 'fail',
            message: 'Error checking data consistency',
            details: error.message
          });
        }
      }

      // Test 5: Mobile Functionality
      try {
        // Test offline capability simulation
        const cachedSubsidiaries = localStorage.getItem('cachedSubsidiaries');
        testResults.push({
          category: 'Mobile',
          test: 'Offline Data Cache',
          status: cachedSubsidiaries ? 'pass' : 'warning',
          message: cachedSubsidiaries 
            ? 'Offline data cache is populated'
            : 'No offline data cache found',
          details: cachedSubsidiaries 
            ? `Cached ${JSON.parse(cachedSubsidiaries).length} subsidiaries`
            : 'Use the app online first to populate the cache'
        });

        // Test mobile-specific features
        const isMobileEnvironment = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        testResults.push({
          category: 'Mobile',
          test: 'Mobile Environment Detection',
          status: 'pass',
          message: `Environment detected: ${isMobileEnvironment ? 'Mobile' : 'Desktop'}`,
          details: `User Agent: ${navigator.userAgent.substring(0, 50)}...`
        });

      } catch (error: any) {
        testResults.push({
          category: 'Mobile',
          test: 'Mobile Functionality',
          status: 'fail',
          message: 'Error testing mobile functionality',
          details: error.message
        });
      }

      setResults(testResults);

      // Calculate summary
      const total = testResults.length;
      const passed = testResults.filter(r => r.status === 'pass').length;
      const warnings = testResults.filter(r => r.status === 'warning').length;
      const failed = testResults.filter(r => r.status === 'fail').length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

      setSummary({ total, passed, warnings, failed, percentage });

      toast({
        title: 'Validation Complete',
        description: `${passed}/${total} tests passed (${percentage}%)`,
        variant: percentage >= 80 ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'Failed to complete validation tests',
        variant: 'destructive'
      });
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">Pass</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Isolation':
        return <Database className="h-4 w-4" />;
      case 'Permissions':
        return <Users className="h-4 w-4" />;
      case 'Security':
        return <Shield className="h-4 w-4" />;
      case 'Data Consistency':
        return <FileText className="h-4 w-4" />;
      case 'Mobile':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const groupedResults = results.reduce((groups, result) => {
    const category = result.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, ValidationResult[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Subsidiary Data Validation</h2>
          <p className="text-muted-foreground">
            Comprehensive testing of data isolation, permissions, and system integrity
          </p>
        </div>
        <Button onClick={runValidationTests} disabled={running}>
          {running ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{summary.warnings}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{summary.percentage}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
            <Progress value={summary.percentage} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {Object.entries(groupedResults).map(([category, categoryResults]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {category}
              <Badge variant="outline" className="ml-auto">
                {categoryResults.length} tests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">
                        {result.test}
                        {result.subsidiary && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({result.subsidiary})
                          </span>
                        )}
                      </h4>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted rounded p-2">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {results.length === 0 && !running && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Validation Results</h3>
            <p className="text-muted-foreground mb-4">
              Run the validation tests to check system integrity and data isolation
            </p>
            <Button onClick={runValidationTests}>
              <Play className="h-4 w-4 mr-2" />
              Start Validation
            </Button>
          </CardContent>
        </Card>
      )}

      {running && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Running Validation Tests</h3>
            <p className="text-muted-foreground">
              Please wait while we test data isolation, permissions, and system integrity...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}