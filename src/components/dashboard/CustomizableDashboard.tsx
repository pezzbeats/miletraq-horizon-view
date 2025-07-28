import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  X, 
  Move, 
  RotateCcw, 
  Save, 
  Layout,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'map' | 'alerts' | 'activity' | 'custom';
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  defaultSize: { w: number; h: number; minW?: number; minH?: number; };
  category?: string;
  description?: string;
  isVisible?: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  layouts: any;
  widgets: string[];
  isDefault?: boolean;
}

interface CustomizableDashboardProps {
  widgets: DashboardWidget[];
  onLayoutChange?: (layouts: any, widgets: string[]) => void;
  onSaveLayout?: (layout: DashboardLayout) => void;
  savedLayouts?: DashboardLayout[];
  className?: string;
  editMode?: boolean;
  onEditModeChange?: (editMode: boolean) => void;
}

export const CustomizableDashboard = ({
  widgets,
  onLayoutChange,
  onSaveLayout,
  savedLayouts = [],
  className,
  editMode = false,
  onEditModeChange
}: CustomizableDashboardProps) => {
  const [layouts, setLayouts] = useState<any>({
    lg: widgets.filter(w => w.isVisible !== false).map((widget, index) => ({
      i: widget.id,
      x: (index % 4) * 3,
      y: Math.floor(index / 4) * 2,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
      minW: widget.defaultSize.minW || 2,
      minH: widget.defaultSize.minH || 2
    }))
  });
  
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    widgets.filter(w => w.isVisible !== false).map(w => w.id)
  );
  
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const handleLayoutChange = useCallback((layout: any, layouts: any) => {
    setLayouts(layouts);
    onLayoutChange?.(layouts, visibleWidgets);
  }, [visibleWidgets, onLayoutChange]);

  const addWidget = (widgetId: string) => {
    if (!visibleWidgets.includes(widgetId)) {
      const widget = widgets.find(w => w.id === widgetId);
      if (widget) {
        const newLayout = {
          i: widgetId,
          x: 0,
          y: 0,
          w: widget.defaultSize.w,
          h: widget.defaultSize.h,
          minW: widget.defaultSize.minW || 2,
          minH: widget.defaultSize.minH || 2
        };

        setLayouts(prev => ({
          ...prev,
          lg: [...(prev.lg || []), newLayout]
        }));
        
        setVisibleWidgets(prev => [...prev, widgetId]);
      }
    }
    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    setLayouts(prev => ({
      ...prev,
      lg: prev.lg?.filter((item: any) => item.i !== widgetId) || []
    }));
    setVisibleWidgets(prev => prev.filter(id => id !== widgetId));
  };

  const resetLayout = () => {
    const defaultLayouts = {
      lg: widgets.filter(w => w.isVisible !== false).map((widget, index) => ({
        i: widget.id,
        x: (index % 4) * 3,
        y: Math.floor(index / 4) * 2,
        w: widget.defaultSize.w,
        h: widget.defaultSize.h,
        minW: widget.defaultSize.minW || 2,
        minH: widget.defaultSize.minH || 2
      }))
    };
    setLayouts(defaultLayouts);
    setVisibleWidgets(widgets.filter(w => w.isVisible !== false).map(w => w.id));
  };

  const saveLayout = () => {
    if (layoutName.trim() && onSaveLayout) {
      const newLayout: DashboardLayout = {
        id: Date.now().toString(),
        name: layoutName.trim(),
        layouts,
        widgets: visibleWidgets
      };
      onSaveLayout(newLayout);
      setLayoutName('');
    }
  };

  const loadLayout = (layout: DashboardLayout) => {
    setLayouts(layout.layouts);
    setVisibleWidgets(layout.widgets);
  };

  const getVisibleWidgets = () => {
    return widgets.filter(widget => visibleWidgets.includes(widget.id));
  };

  const getAvailableWidgets = () => {
    return widgets.filter(widget => !visibleWidgets.includes(widget.id));
  };

  // Group widgets by category
  const widgetsByCategory = widgets.reduce((acc, widget) => {
    const category = widget.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, DashboardWidget[]>);

  return (
    <div className={cn('w-full', className)}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card/50 backdrop-blur-sm border rounded-lg">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard
            {editMode && <Badge variant="outline">Edit Mode</Badge>}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{visibleWidgets.length} widgets</span>
            <span>•</span>
            <span>{Object.keys(layouts).length} layouts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Saved Layouts */}
          {savedLayouts.length > 0 && (
            <div className="flex items-center gap-1">
              {savedLayouts.slice(0, 3).map((layout) => (
                <Button
                  key={layout.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadLayout(layout)}
                  className="h-8 text-xs"
                >
                  {layout.name}
                </Button>
              ))}
            </div>
          )}

          {/* Edit Mode Toggle */}
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => onEditModeChange?.(!editMode)}
            className="h-8"
          >
            <Settings className="h-4 w-4 mr-2" />
            {editMode ? 'Exit Edit' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Edit Mode Controls */}
      {editMode && (
        <div className="mb-6 p-4 bg-muted/50 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Customize Layout</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetSelector(!showWidgetSelector)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Widget Selector */}
          {showWidgetSelector && (
            <div className="space-y-4 p-4 bg-background border rounded-lg">
              <h4 className="font-medium text-sm">Available Widgets</h4>
              {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                <div key={category}>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">{category}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categoryWidgets
                      .filter(widget => !visibleWidgets.includes(widget.id))
                      .map((widget) => (
                        <Card
                          key={widget.id}
                          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                          onClick={() => addWidget(widget.id)}
                        >
                          <CardContent className="p-3">
                            <h6 className="font-medium text-sm">{widget.title}</h6>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {widget.description}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {widget.type}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Layout */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Layout name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-background max-w-48"
            />
            <Button
              size="sm"
              onClick={saveLayout}
              disabled={!layoutName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Layout
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={breakpoints}
        cols={cols}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        rowHeight={120}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
      >
        {getVisibleWidgets().map((widget) => {
          const WidgetComponent = widget.component;
          
          return (
            <div key={widget.id} className="dashboard-widget">
              <Card className="h-full relative group">
                {/* Widget Controls (Edit Mode) */}
                {editMode && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                      className="h-6 w-6 p-0 bg-background/90"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="cursor-move p-1 bg-background/90 rounded border">
                      <Move className="h-3 w-3" />
                    </div>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{widget.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {widget.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-3 pt-0 h-full overflow-hidden">
                  <div className="h-full w-full">
                    <WidgetComponent {...(widget.props || {})} />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No widgets displayed</h3>
          <p className="text-muted-foreground mb-4">
            Add widgets to customize your dashboard
          </p>
          <Button
            onClick={() => setShowWidgetSelector(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}
    </div>
  );
};