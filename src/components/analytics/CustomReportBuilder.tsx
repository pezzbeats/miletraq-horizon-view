import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Save, 
  Play, 
  Settings, 
  BarChart3, 
  PieChart, 
  LineChart as LineChartIcon,
  Table,
  Calendar,
  Filter,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom Node Types for Report Builder
const DataSourceNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-4 w-4 text-blue-600" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
      <Badge variant="outline" className="text-xs">{data.type}</Badge>
      <div className="flex justify-end mt-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
};

const FilterNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800 min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-purple-600" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{data.filterType}</div>
      <div className="flex justify-between items-center">
        <div className="w-3 h-3 bg-purple-500 rounded-full" />
        <div className="w-3 h-3 bg-purple-500 rounded-full" />
      </div>
    </div>
  );
};

const ChartNode = ({ data }: { data: any }) => {
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'line': return LineChartIcon;
      case 'table': return Table;
      default: return BarChart3;
    }
  };

  const ChartIcon = getChartIcon(data.chartType);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <ChartIcon className="h-4 w-4 text-green-600" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{data.chartType} chart</div>
      <div className="flex justify-start">
        <div className="w-3 h-3 bg-green-500 rounded-full" />
      </div>
    </div>
  );
};

const ProcessorNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-2 border-orange-200 dark:border-orange-800 min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-orange-600" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{data.operation}</div>
      <div className="flex justify-between items-center">
        <div className="w-3 h-3 bg-orange-500 rounded-full" />
        <div className="w-3 h-3 bg-orange-500 rounded-full" />
      </div>
    </div>
  );
};

const nodeTypes = {
  dataSource: DataSourceNode,
  filter: FilterNode,
  chart: ChartNode,
  processor: ProcessorNode,
};

interface CustomReportBuilderProps {
  onSaveReport?: (reportConfig: any) => void;
  onExportReport?: (format: string) => void;
  className?: string;
}

export const CustomReportBuilder = ({
  onSaveReport,
  onExportReport,
  className
}: CustomReportBuilderProps) => {
  const [reportName, setReportName] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  // Initial nodes and edges
  const initialNodes: Node[] = [
    {
      id: 'datasource-1',
      type: 'dataSource',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Vehicle Data',
        description: 'Fleet vehicle information',
        type: 'Primary Source'
      }
    },
    {
      id: 'datasource-2',
      type: 'dataSource',
      position: { x: 100, y: 250 },
      data: { 
        label: 'Fuel Logs',
        description: 'Fuel consumption data',
        type: 'Transaction Data'
      }
    },
    {
      id: 'filter-1',
      type: 'filter',
      position: { x: 350, y: 150 },
      data: { 
        label: 'Date Range',
        filterType: 'Time Filter'
      }
    },
    {
      id: 'processor-1',
      type: 'processor',
      position: { x: 550, y: 200 },
      data: { 
        label: 'Aggregator',
        operation: 'Group & Sum'
      }
    },
    {
      id: 'chart-1',
      type: 'chart',
      position: { x: 750, y: 150 },
      data: { 
        label: 'Cost Analysis',
        chartType: 'bar'
      }
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e1-3',
      source: 'datasource-1',
      target: 'filter-1',
      animated: true
    },
    {
      id: 'e2-3',
      source: 'datasource-2',
      target: 'filter-1',
      animated: true
    },
    {
      id: 'e3-4',
      source: 'filter-1',
      target: 'processor-1',
      animated: true
    },
    {
      id: 'e4-5',
      source: 'processor-1',
      target: 'chart-1',
      animated: true
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Component palette
  const componentPalette = [
    {
      type: 'dataSource',
      label: 'Data Sources',
      items: [
        { label: 'Vehicles', description: 'Vehicle master data', type: 'Master Data' },
        { label: 'Drivers', description: 'Driver information', type: 'Master Data' },
        { label: 'Fuel Logs', description: 'Fuel consumption records', type: 'Transaction Data' },
        { label: 'Maintenance', description: 'Maintenance records', type: 'Transaction Data' },
        { label: 'Budget', description: 'Budget allocations', type: 'Financial Data' }
      ]
    },
    {
      type: 'filter',
      label: 'Filters',
      items: [
        { label: 'Date Range', filterType: 'Time Filter' },
        { label: 'Vehicle Filter', filterType: 'Category Filter' },
        { label: 'Cost Range', filterType: 'Number Filter' },
        { label: 'Status Filter', filterType: 'Boolean Filter' }
      ]
    },
    {
      type: 'processor',
      label: 'Processors',
      items: [
        { label: 'Aggregator', operation: 'Group & Sum' },
        { label: 'Calculator', operation: 'Mathematical Operations' },
        { label: 'Joiner', operation: 'Data Joining' },
        { label: 'Sorter', operation: 'Data Sorting' }
      ]
    },
    {
      type: 'chart',
      label: 'Visualizations',
      items: [
        { label: 'Bar Chart', chartType: 'bar' },
        { label: 'Line Chart', chartType: 'line' },
        { label: 'Pie Chart', chartType: 'pie' },
        { label: 'Data Table', chartType: 'table' }
      ]
    }
  ];

  const addNodeToCanvas = (item: any, type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: item
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const generateReport = async () => {
    setIsBuilding(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBuilding(false);
  };

  const saveReport = () => {
    const reportConfig = {
      name: reportName,
      nodes,
      edges,
      createdAt: new Date().toISOString()
    };
    onSaveReport?.(reportConfig);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Custom Report Builder
          </h2>
          <Input
            placeholder="Report name..."
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-48"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generateReport} disabled={isBuilding}>
            <Play className={cn('h-4 w-4 mr-2', isBuilding && 'animate-spin')} />
            {isBuilding ? 'Building...' : 'Generate'}
          </Button>
          <Button variant="outline" onClick={saveReport} disabled={!reportName}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={() => onExportReport?.('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Component Palette */}
        <div className="w-64 border-r bg-muted/20 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Components</h3>
          <div className="space-y-4">
            {componentPalette.map((category) => (
              <div key={category.type}>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  {category.label}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-background border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200"
                      draggable
                      onClick={() => addNodeToCanvas(item, category.type)}
                    >
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description || item.filterType || item.operation || item.chartType}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ backgroundColor: '#f8fafc' }}
            className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950"
          >
            <MiniMap 
              zoomable 
              pannable 
              className="bg-background border rounded-lg"
            />
            <Controls className="bg-background border rounded-lg" />
            <Background />
          </ReactFlow>

          {/* Floating Info Panel */}
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
            <h4 className="font-semibold mb-2">Report Flow</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <Badge variant="outline">{nodes.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <Badge variant="outline">{edges.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={nodes.length > 0 ? 'default' : 'secondary'}>
                  {nodes.length > 0 ? 'Ready' : 'Empty'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="h-32 border-t bg-muted/20 p-4">
        <h4 className="font-semibold mb-2">Report Preview</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Data flow: {edges.length} connections configured</span>
          <span>•</span>
          <span>Output: {nodes.filter(n => n.type === 'chart').length} visualizations</span>
          <span>•</span>
          <span>Filters: {nodes.filter(n => n.type === 'filter').length} applied</span>
        </div>
      </div>
    </div>
  );
};