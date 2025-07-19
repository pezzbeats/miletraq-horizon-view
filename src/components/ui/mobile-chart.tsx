import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface MobileChartProps {
  title: string;
  data: any[];
  type: 'bar' | 'line' | 'pie';
  dataKeys?: {
    x?: string;
    y?: string | string[];
    colors?: string[];
  };
  height?: number;
  className?: string;
}

export function MobileChart({
  title,
  data,
  type,
  dataKeys = {},
  height = 200,
  className
}: MobileChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderChart = () => {
    const chartHeight = isExpanded ? height * 1.5 : height;
    
    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={dataKeys.x || 'name'} 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key as string} 
                  fill={dataKeys.colors?.[index] || `hsl(var(--primary))`}
                  radius={[2, 2, 0, 0]}
                />
              ))
            ) : (
              <Bar 
                dataKey={(dataKeys.y as string) || 'value'} 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={dataKeys.x || 'name'} 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone"
                  dataKey={key as string} 
                  stroke={dataKeys.colors?.[index] || `hsl(var(--primary))`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))
            ) : (
              <Line 
                type="monotone"
                dataKey={(dataKeys.y as string) || 'value'} 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey={(dataKeys.y as string) || 'value'}
              nameKey={dataKeys.x || 'name'}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={dataKeys.colors?.[index] || `hsl(var(--primary))`} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Card className={cn("mobile-chart touch-target", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 touch-target"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
}

interface MobileChartCarouselProps {
  charts: Array<{
    id: string;
    title: string;
    data: any[];
    type: 'bar' | 'line' | 'pie';
    dataKeys?: {
      x?: string;
      y?: string | string[];
      colors?: string[];
    };
  }>;
  className?: string;
}

export function MobileChartCarousel({ charts, className }: MobileChartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextChart = () => {
    setCurrentIndex((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentIndex((prev) => (prev - 1 + charts.length) % charts.length);
  };

  if (charts.length === 0) return null;

  const currentChart = charts[currentIndex];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 touch-target"
          onClick={prevChart}
          disabled={charts.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-1">
          {charts.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 touch-target"
          onClick={nextChart}
          disabled={charts.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Chart */}
      <MobileChart
        title={currentChart.title}
        data={currentChart.data}
        type={currentChart.type}
        dataKeys={currentChart.dataKeys}
        height={250}
      />

      {/* Chart Title and Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} of {charts.length}
        </p>
      </div>
    </div>
  );
}