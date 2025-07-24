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
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey={dataKeys.x || 'name'} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
              tickLine={{ stroke: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
              tickLine={{ stroke: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--primary))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--card-foreground))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px', 
                color: 'hsl(var(--foreground))' 
              }} 
            />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key as string} 
                  fill={dataKeys.colors?.[index] || `hsl(221.2 83.2% ${53 + index * 10}%)`}
                  radius={[4, 4, 0, 0]}
                  stroke={dataKeys.colors?.[index] || `hsl(221.2 83.2% ${43 + index * 10}%)`}
                  strokeWidth={1}
                />
              ))
            ) : (
              <Bar 
                dataKey={(dataKeys.y as string) || 'value'} 
                fill="hsl(221.2 83.2% 53%)"
                radius={[4, 4, 0, 0]}
                stroke="hsl(221.2 83.2% 43%)"
                strokeWidth={1}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey={dataKeys.x || 'name'} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
              tickLine={{ stroke: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
              tickLine={{ stroke: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--primary))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--card-foreground))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px', 
                color: 'hsl(var(--foreground))' 
              }} 
            />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone"
                  dataKey={key as string} 
                  stroke={dataKeys.colors?.[index] || `hsl(221.2 83.2% ${53 + index * 10}%)`}
                  strokeWidth={3}
                  dot={{ r: 4, fill: dataKeys.colors?.[index] || `hsl(221.2 83.2% ${53 + index * 10}%)`, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: dataKeys.colors?.[index] || `hsl(221.2 83.2% ${53 + index * 10}%)` }}
                />
              ))
            ) : (
              <Line 
                type="monotone"
                dataKey={(dataKeys.y as string) || 'value'} 
                stroke="hsl(221.2 83.2% 53%)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'hsl(221.2 83.2% 53%)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: 'hsl(221.2 83.2% 53%)' }}
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
              innerRadius={30}
              outerRadius={90}
              dataKey={(dataKeys.y as string) || 'value'}
              nameKey={dataKeys.x || 'name'}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={dataKeys.colors?.[index] || `hsl(${120 + index * 60} 70% 50%)`} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--primary))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--card-foreground))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px', 
                color: 'hsl(var(--foreground))' 
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Card className={cn("mobile-chart touch-target border-2 hover:shadow-lg transition-all duration-200", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 touch-target hover:bg-primary/20 border border-primary/30"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 bg-card">
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
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0 touch-target border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
          onClick={prevChart}
          disabled={charts.length <= 1}
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </Button>
        
        <div className="flex space-x-2">
          {charts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 border-2",
                index === currentIndex 
                  ? "bg-primary border-primary w-8 shadow-lg" 
                  : "bg-muted-foreground/30 border-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0 touch-target border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
          onClick={nextChart}
          disabled={charts.length <= 1}
        >
          <ChevronRight className="h-5 w-5 text-primary" />
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
      <div className="text-center bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-3 border">
        <p className="text-sm font-semibold text-foreground">
          {currentChart.title} - {currentIndex + 1} of {charts.length}
        </p>
      </div>
    </div>
  );
}