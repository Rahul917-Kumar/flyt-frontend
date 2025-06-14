
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Index = () => {
  const { data: drones = [] } = useQuery({
    queryKey: ['drones'],
    queryFn: api.getDrones,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: api.getMissions,
  });

  const missionStats = {
    total: missions.length,
    completed: missions.filter(m => m.status === 'completed').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    aborted: missions.filter(m => m.status === 'aborted').length,
    pending: missions.filter(m => m.status === 'planned').length,
  };

  const droneStats = {
    total: drones.length,
    available: drones.filter(d => d.status === 'available').length,
    inMission: drones.filter(d => d.status === 'in_mission').length,
    maintenance: drones.filter(d => d.status === 'maintenance').length,
  };

  const barData = [
    { name: 'Completed', value: missionStats.completed },
    { name: 'In Progress', value: missionStats.inProgress },
    { name: 'Pending', value: missionStats.pending },
    { name: 'Aborted', value: missionStats.aborted },
  ];

  const pieData = [
    { name: 'Available', value: droneStats.available, color: '#10b981' },
    { name: 'In Mission', value: droneStats.inMission, color: '#3b82f6' },
    { name: 'Maintenance', value: droneStats.maintenance, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mission Control Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your autonomous drone fleet
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{droneStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {droneStats.available} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {missionStats.completed} completed today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-200/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((droneStats.available / droneStats.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fleet availability
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className="h-4 w-4 rounded-full bg-purple-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {missionStats.total > 0 ? Math.round((missionStats.completed / missionStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Mission completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mission Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drone Fleet Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions.slice(0, 5).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={mission.status === 'completed' ? 'default' : 
                           mission.status === 'in_progress' ? 'secondary' : 'destructive'}
                  >
                    {mission.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{mission.id}</p>
                    <p className="text-sm text-muted-foreground">Drone: {mission.drone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Progress value={mission.progress} className="w-24 h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{mission.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
