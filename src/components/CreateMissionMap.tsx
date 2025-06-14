
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

interface CreateMissionMapProps {
  previewPath: Array<{ lat: number; lng: number }>;
}

const CreateMissionMap = ({ previewPath }: CreateMissionMapProps) => {
  if (!previewPath || previewPath.length === 0) {
    return (
      <div className="h-96 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Enter coordinates and generate flight path</p>
          <p className="text-sm mt-2">to see preview here</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [previewPath[0].lat, previewPath[0].lng];

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
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
          positions={previewPath.map(point => [point.lat, point.lng] as [number, number])}
          color="blue"
          weight={3}
          opacity={0.7}
        />
        {previewPath.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default CreateMissionMap;
