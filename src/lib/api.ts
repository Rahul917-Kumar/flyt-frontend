import axios from 'axios';

// Mock API data and functions

const base_url = "http://127.0.0.1:8000/api";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: Array<Array<Number>>; // Array of rings, each ring is an array of [lng, lat] pairs
};

export interface Drone {
  id: string;
  status: 'available' | 'in_mission' | 'maintenance';
  battery_level: number;
  location: {
    lat: number;
    lng: number;
  };
  updated_at: string;
}

export interface Mission {
  id: string;
  drone: string;
  status: 'planned' | 'in_progress' | 'completed' | 'aborted' | 'paused';
  progress: number;
  distance_covered: number;
  altitude: number;
  start_time: string;
  end_time:string;
  estimated_time_remaining: number;
  flight_path: Array<Array<Number>>;
  survey_area: GeoJsonPolygon; // Assuming survey_area is a polygon with coordinates
}

// Mock data
export const mockDrones: Drone[] = [
  {
    id: "DRN-001",
    status: "in_mission",
    battery_level: 85,
    location: { lat: 40.7128, lng: -74.0060 },
    updated_at: new Date().toISOString(),
  },
  {
    id: "DRN-002",
    status: "available",
    battery_level: 92,
    location: { lat: 40.7589, lng: -73.9851 },
    updated_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "DRN-003",
    status: "maintenance",
    battery_level: 45,
    location: { lat: 40.7505, lng: -73.9934 },
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "DRN-004",
    status: "available",
    battery_level: 78,
    location: { lat: 40.7282, lng: -73.7949 },
    updated_at: new Date(Date.now() - 600000).toISOString(),
  },
];

// Mock API functions
export const api = {
  getDrones: async () => {
    const result = await axios.get(`${base_url}/drones`);
    console.log("result", result.data.data)
    return result.data.data
  },

  getMissions: async (): Promise<Mission[]> => {
    const result = await axios.get(`${base_url}/missions`);
    // console.log("result", result.data.data)
    return result.data.data
  },

  getMission: async (id: string): Promise<Mission | null> => {
    const result = await axios.get(`${base_url}/missions/${id}`);
    // console.log("result", result.data.data)
    return result.data.data
  },

  updateDroneStatus: async (id: string, newStatus:string)=> {
    const body = {
      "status": newStatus
    }
    await axios.patch(`${base_url}/drones/${id}`, body);
    return 
  },

  PauseMission: async (id: string, action: 'pause'): Promise<void> => {
    await axios.post(`${base_url}/missions/${id}/pause`);
  },
  AbortMission: async (id: string, action: 'abort'): Promise<void> => {
    await axios.post(`${base_url}/missions/${id}/abort`);
  },
  ResumeMission: async (id: string, action: 'resume'): Promise<void> => {
    await axios.post(`${base_url}/missions/${id}/resume`);
  },

  createMission: async (missionData: Partial<Mission>): Promise<void> => {
    const newMission = {
      drone: missionData.drone || '',
      status: 'planned',
      altitude: missionData.altitude || 100,
      survey_area: missionData.survey_area || [],
      flight_path: missionData.flight_path || [],
    };
    const result = await axios.post(`${base_url}/missions`, newMission);
    console.log("result", result.data.errors)
    return 
  },
};
