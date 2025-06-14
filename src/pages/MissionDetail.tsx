import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Dynamically import the map component
const MissionMap = lazy(() => import("@/components/MissionMap"));

const MissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPosition, setCurrentPosition] = useState(0);

  const { data: mission } = useQuery({
    queryKey: ['mission', id],
    queryFn: () => api.getMission(id!),
    enabled: !!id,
  });

  // Simulate drone movement along flight path
  // useEffect(() => {
  //   if (!mission || mission.status !== 'in_progress') return;

  //   const interval = setInterval(() => {
  //     setCurrentPosition(prev => {
  //       const newPos = Math.min(prev + 1, mission.flightPath.length - 1);
  //       return newPos;
  //     });
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, [mission]);

  if (!mission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Mission not found</div>
      </div>
    );
  }

  const progressData = [
    { time: '00:00', progress: 0 },
    { time: '00:30', progress: 15 },
    { time: '01:00', progress: 35 },
    { time: '01:30', progress: 50 },
    { time: '02:00', progress: mission.progress },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'paused': return 'outline';
      case 'aborted': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mission {mission.id}</h1>
        <p className="text-muted-foreground">
          Real-time mission monitoring and control
        </p>
      </div>

      {/* Mission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(mission.status)} className="text-sm">
              {mission.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={mission.progress} className="h-2" />
              <div className="text-sm font-medium">{mission.progress}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Distance Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mission.distance_covered}km</div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Path Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Flight Path</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          }>
            {/* <MissionMap flightPath={mission.flightPath} currentPosition={currentPosition} /> */}
          </Suspense>
        </CardContent>
      </Card>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Drone ID</label>
                <p className="text-lg font-semibold">{mission.drone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                <p className="text-lg">{new Date(mission.start_time).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Altitude</label>
                <p className="text-lg">{mission.altitude}m</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Flight Path Points</label>
                <p className="text-lg font-semibold">{mission.flight_path.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
                <p className="text-lg">{mission.estimated_time_remaining}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionDetail;
