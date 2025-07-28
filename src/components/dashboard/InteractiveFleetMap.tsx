import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sphere, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  MapPin, 
  Fuel, 
  Clock, 
  AlertTriangle, 
  Navigation,
  Zap,
  Route,
  Maximize2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  speed: number;
  fuelLevel: number;
  driver?: {
    name: string;
    phone?: string;
  };
  lastUpdated: string;
  route?: {
    destination: string;
    eta: string;
    progress: number;
  };
}

interface FleetMapProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
  onRouteOptimize?: (vehicleIds: string[]) => void;
  className?: string;
  show3D?: boolean;
}

// 3D Vehicle Marker Component
const VehicleMarker = ({ vehicle, position, onClick }: {
  vehicle: Vehicle;
  position: [number, number, number];
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'idle': return '#f59e0b'; // yellow
      case 'maintenance': return '#ef4444'; // red
      case 'offline': return '#6b7280'; // gray
      default: return '#3b82f6'; // blue
    }
  };

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.5, 0.2, 1]}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial color={getStatusColor(vehicle.status)} />
      </Box>
      
      {/* Vehicle Info Popup */}
      {hovered && (
        <Html center>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-48">
            <h4 className="font-semibold text-sm mb-2">{vehicle.vehicleNumber}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant={
                  vehicle.status === 'active' ? 'default' :
                  vehicle.status === 'idle' ? 'secondary' :
                  vehicle.status === 'maintenance' ? 'destructive' : 'outline'
                }>
                  {vehicle.status}
                </Badge>
                <span>{vehicle.speed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-3 w-3" />
                <span>Fuel: {vehicle.fuelLevel}%</span>
              </div>
              {vehicle.driver && (
                <div className="flex items-center gap-2">
                  <Car className="h-3 w-3" />
                  <span>{vehicle.driver.name}</span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Scene Component
const FleetScene = ({ vehicles, onVehicleClick }: {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
}) => {
  // Convert lat/lng to 3D coordinates (simplified projection)
  const convertToPosition = (lat: number, lng: number): [number, number, number] => {
    const x = (lng - 77.5946) * 100; // Centered around Delhi
    const z = (lat - 28.7041) * 100;
    return [x, 0, z];
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Ground Grid */}
      <gridHelper args={[20, 20, '#444444', '#222222']} />
      
      {/* Vehicles */}
      {vehicles.map((vehicle) => (
        <VehicleMarker
          key={vehicle.id}
          vehicle={vehicle}
          position={convertToPosition(vehicle.location.lat, vehicle.location.lng)}
          onClick={() => onVehicleClick?.(vehicle)}
        />
      ))}
      
      {/* Title */}
      <Text
        position={[0, 5, -8]}
        fontSize={1}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
      >
        Fleet Overview
      </Text>
    </>
  );
};

// 2D Map View Component (fallback)
const FleetMapView = ({ vehicles, onVehicleClick }: {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
}) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-green-200 dark:from-slate-700 dark:to-slate-600" />
        {/* Simulated roads */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 transform -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 transform -translate-x-1/2" />
      </div>

      {/* Vehicle Markers */}
      {vehicles.map((vehicle, index) => {
        const x = 20 + (index % 5) * 15; // Distribute across width
        const y = 20 + Math.floor(index / 5) * 15; // Distribute across height
        
        return (
          <div
            key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onVehicleClick?.(vehicle)}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-150',
              vehicle.status === 'active' ? 'bg-green-500' :
              vehicle.status === 'idle' ? 'bg-yellow-500' :
              vehicle.status === 'maintenance' ? 'bg-red-500' :
              'bg-gray-500'
            )}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-75" 
                   style={{ backgroundColor: 
                     vehicle.status === 'active' ? '#10b981' :
                     vehicle.status === 'idle' ? '#f59e0b' :
                     vehicle.status === 'maintenance' ? '#ef4444' :
                     '#6b7280'
                   }} />
            </div>
            
            {/* Vehicle Info Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg min-w-40">
                <h4 className="font-semibold text-xs mb-1">{vehicle.vehicleNumber}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={
                      vehicle.status === 'active' ? 'default' :
                      vehicle.status === 'idle' ? 'secondary' :
                      'destructive'
                    } className="text-xs">
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Speed:</span>
                    <span>{vehicle.speed} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fuel:</span>
                    <span className={cn(
                      vehicle.fuelLevel < 20 ? 'text-red-500' :
                      vehicle.fuelLevel < 50 ? 'text-yellow-500' :
                      'text-green-500'
                    )}>
                      {vehicle.fuelLevel}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3">
        <h4 className="font-semibold text-sm mb-2">Vehicle Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Active ({vehicles.filter(v => v.status === 'active').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Idle ({vehicles.filter(v => v.status === 'idle').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Maintenance ({vehicles.filter(v => v.status === 'maintenance').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Offline ({vehicles.filter(v => v.status === 'offline').length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractiveFleetMap = ({
  vehicles,
  onVehicleClick,
  onRouteOptimize,
  className,
  show3D = false
}: FleetMapProps) => {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [view3D, setView3D] = useState(show3D);
  const [showFilters, setShowFilters] = useState(false);

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const lowFuelVehicles = vehicles.filter(v => v.fuelLevel < 20).length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Fleet Map
            <Badge variant="outline">
              {vehicles.length} vehicles
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView3D(!view3D)}
              className="h-8"
            >
              {view3D ? '2D' : '3D'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-lg font-bold text-green-600">{activeVehicles}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="text-lg font-bold text-red-600">{lowFuelVehicles}</div>
            <div className="text-xs text-muted-foreground">Low Fuel</div>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{maintenanceVehicles}</div>
            <div className="text-xs text-muted-foreground">Maintenance</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {view3D ? (
          <div className="w-full h-96 rounded-lg overflow-hidden bg-slate-900">
            <Canvas camera={{ position: [0, 10, 10], fov: 60 }}>
              <Suspense fallback={
                <Html center>
                  <div className="text-white">Loading 3D Fleet View...</div>
                </Html>
              }>
                <FleetScene vehicles={vehicles} onVehicleClick={onVehicleClick} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Suspense>
            </Canvas>
          </div>
        ) : (
          <FleetMapView vehicles={vehicles} onVehicleClick={onVehicleClick} />
        )}

        {/* Route Optimization Panel */}
        {selectedVehicles.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{selectedVehicles.length} vehicles selected</span>
                <span className="text-muted-foreground ml-2">for route optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVehicles([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRouteOptimize?.(selectedVehicles)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  <Route className="h-4 w-4 mr-2" />
                  Optimize Routes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        {(lowFuelVehicles > 0 || maintenanceVehicles > 0) && (
          <div className="mt-4 space-y-2">
            {lowFuelVehicles > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 dark:text-red-400">
                  {lowFuelVehicles} vehicle{lowFuelVehicles > 1 ? 's' : ''} with low fuel levels
                </span>
              </div>
            )}
            {maintenanceVehicles > 0 && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-700 dark:text-orange-400">
                  {maintenanceVehicles} vehicle{maintenanceVehicles > 1 ? 's' : ''} under maintenance
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};