
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Drone } from "@/lib/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DroneMapProps {
  drones: Drone[];
}

const getStatusColor = (status: Drone['status']) => {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'in_mission': return 'bg-blue-500';
    case 'maintenance': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const DroneMap = ({ drones }: DroneMapProps) => {
  if (!drones || drones.length === 0) {
    return (
      <div className="h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No drones available</p>
      </div>
    );
  }

  const center: [number, number] = drones.length > 0 
    ? [drones[0].location.lat, drones[0].location.lng]
    : [40.7128, -74.0060];

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {drones.map((drone) => (
          <Marker
            key={drone.id}
            position={[drone.location.lat, drone.location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{drone.id}</h3>
                <p className="text-sm">Status: 
                  <span className={`ml-1 px-2 py-1 rounded text-xs text-white ${getStatusColor(drone.status)}`}>
                    {drone.status}
                  </span>
                </p>
                <p className="text-sm">Battery: {drone.battery_level}%</p>
                <p className="text-sm">Last Update: {new Date(drone.updated_at).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DroneMap;
