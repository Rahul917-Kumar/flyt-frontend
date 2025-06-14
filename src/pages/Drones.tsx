
import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Drone } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Dynamically import the map component
const DroneMap = lazy(() => import("@/components/DroneMap"));

const Drones = () => {
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [newStatus, setNewStatus] = useState<Drone['status']>('available');

  const { data: drones = [], refetch } = useQuery({
    queryKey: ['drones'],
    queryFn: api.getDrones,
  });

  console.log(drones);

  const getStatusColor = (status: Drone['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_mission': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 70) return 'text-green-600';
    if (battery > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusUpdate = async () => {
    if (!selectedDrone) return;
    try {
      console.log("newstatus", newStatus)
      await api.updateDroneStatus(selectedDrone.id, newStatus);
      await refetch();
      toast({
        title: "Status Updated",
        description: `Drone ${selectedDrone.id} status updated to ${newStatus}`,
      });
      setSelectedDrone(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update drone status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Drone Fleet</h1>
        <p className="text-muted-foreground">
          Monitor and manage your drone fleet status and locations
        </p>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Drones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {drones.filter(d => d.status === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {drones.filter(d => d.status === 'in_mission').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {drones.filter(d => d.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Drone Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          }>
            {/* <DroneMap drones={drones} /> */}
          </Suspense>
        </CardContent>
      </Card>

      {/* Drone Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drone Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drone ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drones.map((drone) => (
                <TableRow key={drone.id}>
                  <TableCell className="font-medium">{drone.id}</TableCell>
                  <TableCell>
                    <Badge variant={drone.status === 'available' ? 'default' : 
                                 drone.status === 'in_mission' ? 'secondary' : 'destructive'}>
                      {drone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={drone.battery_level} className="w-16 h-2" />
                      <span className={`text-sm font-medium ${getBatteryColor(drone.battery_level)}`}>
                        {drone.battery_level}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(drone.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDrone(drone)}
                        >
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Drone Status - {selectedDrone?.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">New Status</label>
                            <Select value={newStatus} onValueChange={(value: Drone['status']) => setNewStatus(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="in_mission">In Mission</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleStatusUpdate} className="w-full">
                            Update Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drones;
