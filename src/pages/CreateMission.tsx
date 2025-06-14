import { useState, lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import PolygonMap from "@/components/Polygon";

// Dynamically import the map component
const CreateMissionMap = lazy(() => import("@/components/CreateMissionMap"));

const CreateMission = () => {
  const navigate = useNavigate();
  const [selectedDrone, setSelectedDrone] = useState("");
  const [altitude, setAltitude] = useState("120");
  const [latitude, setLatitude] = useState("37.7749");
  const [longitude, setLongitude] = useState("-122.4194");
  const [surveyArea, setSurveyArea] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [flightPath, setFlightPath] = useState<
    { lat: number; lng: number }[]
  >([]);

  const { data: drones = [] } = useQuery({
    queryKey: ['drones'],
    queryFn: api.getDrones,
  });

  const availableDrones = drones.filter(d => d.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyArea.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 points to create a flight path",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDrone) {
      toast({
        title: "Error",
        description: "Please select a drone",
        variant: "destructive",
      });
      return;
    }
    const formattedSurveyPath = surveyArea.map((point) => [point.lng, point.lat]);
    const formattedFlightPath = flightPath.map((point) => [point.lng, point.lat]);
    try {
      const mission = await api.createMission({
        drone: selectedDrone,
        altitude: parseInt(altitude),
        survey_area: {
          "type": "Polygon",
          coordinates: formattedSurveyPath,
        },
        flight_path: formattedFlightPath,
      });

      toast({
        title: "Mission Created",
        description: `Mission has been created successfully`,
      });

      navigate('/missions');
    } catch (error) {
      console.log("Error creating mission:", error);
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Mission</h1>
        <p className="text-muted-foreground">
          Configure and deploy a new drone mission
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drone">Select Drone</Label>
                <Select value={selectedDrone} onValueChange={setSelectedDrone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an available drone" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrones.map((drone) => (
                      <SelectItem key={drone.id} value={drone.id}>
                        {drone.id} - Battery: {drone.battery_level}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="altitude">Flight Altitude (meters)</Label>
                <Input
                  id="altitude"
                  type="number"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                  min="30"
                  max="400"
                  placeholder="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={!selectedDrone}>
                Create Mission
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Flight Path Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Create Survey region</CardTitle>
          </CardHeader>
          <CardContent>
            <PolygonMap 
              // onDrawComplete={setCoordinates} 
              onDrawComplete={(coords, type) => {
                if (type === "polygon") {
                  setSurveyArea(coords);
                } else {
                  setFlightPath(coords);
                }
              }}
              latitude={parseFloat(latitude)} 
              longitude={parseFloat(longitude)} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMission;
