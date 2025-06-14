
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, Mission } from "@/lib/api";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Play, Pause, Square } from "lucide-react";

const Missions = () => {
  const { data: missions = [], refetch } = useQuery({
    queryKey: ['missions'],
    queryFn: api.getMissions,
  });

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'paused': return 'outline';
      case 'planned': return 'secondary';
      case 'aborted': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: Mission['status']) => {
    switch (status) {
      case 'in_progress': return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'completed': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'paused': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'aborted': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const handleMissionPause = async (missionId: string, action: 'pause' ) => {
    try {
      await api.PauseMission(missionId, action);
      await refetch();
      toast({
        title: "Mission Updated",
        description: `Mission ${missionId} has been ${action}d`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} mission`,
        variant: "destructive",
      });
    }
  };

  const handleMissionAbort = async (missionId: string, action:  'abort') => {
    try {
      await api.AbortMission(missionId, action);
      await refetch();
      toast({
        title: "Mission Updated",
        description: `Mission ${missionId} has been ${action}d`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} mission`,
        variant: "destructive",
      });
    }
  };

  const handleMissionResume = async (missionId: string, action: 'resume' ) => {
    try {
      await api.ResumeMission(missionId, action);
      await refetch();
      toast({
        title: "Mission Updated",
        description: `Mission ${missionId} has been ${action}d`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} mission`,
        variant: "destructive",
      });
    }
  };

  const missionStats = {
    total: missions.length,
    active: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
    pending: missions.filter(m => m.status === 'planned').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground">
          Monitor and control drone missions in real-time
        </p>
      </div>

      {/* Mission Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{missionStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{missionStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{missionStats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Missions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Missions</CardTitle>
          <Link to="/create-mission">
            <Button>Create New Mission</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission ID</TableHead>
                <TableHead>Drone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Altitude</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">
                    <Link to={`/missions/${mission.id}`} className="hover:underline text-blue-600">
                      {mission.id}
                    </Link>
                  </TableCell>
                  <TableCell>{mission.drone}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(mission.status)}
                      <Badge variant={getStatusColor(mission.status)}>
                        {mission.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={mission.progress} className="w-16 h-2" />
                      <span className="text-sm font-medium">{mission.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{mission.distance_covered.toFixed(1)} km</TableCell>
                  <TableCell>{mission.altitude}m</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {mission.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMissionPause(mission.id, 'pause')}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {mission.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMissionResume(mission.id, 'resume')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {(mission.status === 'in_progress' || mission.status === 'paused') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMissionAbort(mission.id, 'abort')}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

export default Missions;
