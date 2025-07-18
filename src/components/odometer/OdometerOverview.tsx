import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Car, Calendar, TrendingUp } from "lucide-react";

interface OdometerOverviewProps {
  totalReadings: number;
  uniqueVehicles: number;
  lastWeekReadings: number;
  recentDate: string;
}

export const OdometerOverview = ({
  totalReadings,
  uniqueVehicles,
  lastWeekReadings,
  recentDate,
}: OdometerOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReadings.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Odometer entries recorded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracked Vehicles</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueVehicles}</div>
          <p className="text-xs text-muted-foreground">
            Vehicles with readings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastWeekReadings}</div>
          <p className="text-xs text-muted-foreground">
            Recent readings (7 days)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Reading</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {recentDate === "No readings" ? "N/A" : recentDate}
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent entry
          </p>
        </CardContent>
      </Card>
    </div>
  );
};