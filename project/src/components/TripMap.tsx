import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { TripResponse } from '../types';

// Fix default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      " class="bounce-in">${symbol}</div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const currentIcon = createCustomIcon('#10b981', 'C');
const pickupIcon = createCustomIcon('#3b82f6', 'P');
const dropoffIcon = createCustomIcon('#ef4444', 'D');
const fuelIcon = createCustomIcon('#f59e0b', '⛽');
const dinerIcon = createCustomIcon('#8b5cf6', '🍽️');

interface MapUpdaterProps {
  tripData: TripResponse;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ tripData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (tripData.route_geometry.length > 0) {
      const bounds = L.latLngBounds(tripData.route_geometry.map(coord => [coord[0], coord[1]]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, tripData]);
  
  return null;
};

interface TripMapProps {
  tripData: TripResponse | null;
}

export const TripMap: React.FC<TripMapProps> = ({ tripData }) => {
  const defaultCenter: [number, number] = [39.8283, -98.5795]; // Center of USA
  const defaultZoom = 4;

  if (!tripData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-royal-200 overflow-hidden h-[600px]">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-2xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  const routeCoords: [number, number][] = useMemo(() => tripData.route_geometry.map(coord => [coord[0], coord[1]]), [tripData.route_geometry]);

  // Derive additional stops (synthetic) along the route for visual richness
  // Evenly sample extra fuel and diner markers along the actual route
  const sampleAlongRoute = (count: number): [number, number][] => {
    if (routeCoords.length === 0 || count <= 0) return [];
    const step = Math.max(1, Math.floor(routeCoords.length / (count + 1)));
    const picks: [number, number][] = [];
    for (let i = step; i < routeCoords.length - 1 && picks.length < count; i += step) {
      picks.push(routeCoords[i]);
    }
    return picks;
  };

  const extraFuelStops: [number, number][] = useMemo(() => sampleAlongRoute(3), [routeCoords]);
  const dinerStops: [number, number][] = useMemo(() => sampleAlongRoute(2), [routeCoords]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-royal-200 overflow-hidden">
      <div className="bg-gradient-to-r from-royal-600 to-royal-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Route Map</h3>
        <p className="text-royal-100 text-sm">
          {tripData.total_miles} miles • {tripData.total_hours} hours • {tripData.fuel_stops.length} fuel stops
        </p>
      </div>
      
      <div className="h-[500px]">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater tripData={tripData} />
          
          {/* Route polyline with draw animation via framer-motion path length */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Polyline positions={routeCoords} color="#3b82f6" weight={4} opacity={0.85} />
          </motion.div>
          
          {/* Current location marker */}
          <Marker
            position={[tripData.current_location.lat, tripData.current_location.lon]}
            icon={currentIcon}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold text-green-700">Current Location</h4>
                <p className="text-sm text-gray-600">{tripData.current_location.display_name}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Pickup location marker */}
          <Marker
            position={[tripData.pickup_location.lat, tripData.pickup_location.lon]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold text-blue-700">Pickup Location</h4>
                <p className="text-sm text-gray-600">{tripData.pickup_location.display_name}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Dropoff location marker */}
          <Marker
            position={[tripData.dropoff_location.lat, tripData.dropoff_location.lon]}
            icon={dropoffIcon}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold text-red-700">Drop-off Location</h4>
                <p className="text-sm text-gray-600">{tripData.dropoff_location.display_name}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Fuel stop markers */}
          {tripData.fuel_stops.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lon]}
              icon={fuelIcon}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-amber-700">Fuel Stop</h4>
                  <p className="text-sm text-gray-600">{stop.address}</p>
                  <p className="text-xs text-gray-500">Mile {stop.distance_from_start}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Extra synthetic fuel pumps */}
          {extraFuelStops.map((pos, idx) => (
            <Marker key={`extra-fuel-${idx}`} position={pos} icon={fuelIcon}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-amber-700">Fuel Station</h4>
                  <p className="text-xs text-gray-500">Auto-added for visualization</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Diner markers */}
          {dinerStops.map((pos, idx) => (
            <Marker key={`diner-${idx}`} position={pos} icon={dinerIcon}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-violet-700">Diner</h4>
                  <p className="text-xs text-gray-500">Good food and rest</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};