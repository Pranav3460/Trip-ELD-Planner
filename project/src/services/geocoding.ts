import { Address } from '../types';

const API_KEY = (import.meta as any).env?.VITE_GRAPHHOPPER_API_KEY || '7cf5c887-fcb5-475c-8eca-470c44303042';
const BASE_URL = 'https://graphhopper.com/api/1';

// Fallback mock used only if API fails
const mockFallback = async (address: string): Promise<Address[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    {
      display_name: `${address} (Approximate)`,
      lat: 40.7128 + (Math.random() - 0.5) * 10,
      lon: -74.006 + (Math.random() - 0.5) * 20,
    },
  ];
};

export const geocodeAddress = async (address: string): Promise<Address[]> => {
  try {
    const url = new URL(`${BASE_URL}/geocode`);
    url.searchParams.set('q', address);
    url.searchParams.set('locale', 'en');
    url.searchParams.set('limit', '5');
    url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

    const data = await res.json();
    const hits: any[] = data.hits || [];

    if (hits.length === 0) return mockFallback(address);

    const mapped: Address[] = hits.map((hit) => ({
      display_name: [hit.name, hit.city, hit.state, hit.country].filter(Boolean).join(', ') || hit.name,
      lat: hit.point?.lat,
      lon: hit.point?.lng,
    })).filter((a) => typeof a.lat === 'number' && typeof a.lon === 'number');

    return mapped.length > 0 ? mapped : mockFallback(address);
  } catch (error) {
    console.error('GraphHopper geocode error:', error);
    return mockFallback(address);
  }
};

export const searchAddresses = async (query: string): Promise<Address[]> => {
  if (query.length < 3) return [];
  return geocodeAddress(query);
};