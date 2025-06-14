
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MissionMapProps {
  flightPath: Array<{ lat: number; lng: number }>;
  currentPosition: number;
}

const MissionMap = ({ flightPath, currentPosition }: MissionMapProps) => {
  if (!flightPath || flightPath.length === 0) {
    return (
      <div className="h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No flight path available</p>
      </div>
    );
  }

  const center: [number, number] = [flightPath[0].lat, flightPath[0].lng];

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline
          positions={flightPath.map(point => [point.lat, point.lng] as [number, number])}
          color="blue"
          weight={3}
          opacity={0.7}
        />
        {flightPath[currentPosition] && (
          <Marker
            position={[
              flightPath[currentPosition].lat,
              flightPath[currentPosition].lng
            ]}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MissionMap;
