// ─────────────────────────────────────────────────────────────
// EcoVerse — Static Client-Side Location Lookup Module
// Cascading data provider for States, Cities, and Areas
// ─────────────────────────────────────────────────────────────

import type { State, City, Area } from '@/types/location';

// Deterministic stable UUID generator matching db.ts
function generateStableUUID(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part1 = hex.substring(0, 8);
  const part2 = seed.length.toString(16).padStart(4, '0');
  const part3 = (seed.charCodeAt(0) || 0).toString(16).padStart(4, '0');
  const part4 = (seed.charCodeAt(seed.length - 1) || 97).toString(16).padStart(4, '0');
  const part5 = '1234567890abcdef'.substring(0, 12);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

const STATIC_STATES_RAW = [
  { name: 'Andhra Pradesh',      code: 'AP' },
  { name: 'Arunachal Pradesh',   code: 'AR' },
  { name: 'Assam',               code: 'AS' },
  { name: 'Bihar',               code: 'BR' },
  { name: 'Chhattisgarh',        code: 'CG' },
  { name: 'Goa',                 code: 'GA' },
  { name: 'Gujarat',             code: 'GJ' },
  { name: 'Haryana',             code: 'HR' },
  { name: 'Himachal Pradesh',    code: 'HP' },
  { name: 'Jharkhand',           code: 'JH' },
  { name: 'Karnataka',           code: 'KA' },
  { name: 'Kerala',              code: 'KL' },
  { name: 'Madhya Pradesh',      code: 'MP' },
  { name: 'Maharashtra',         code: 'MH' },
  { name: 'Manipur',             code: 'MN' },
  { name: 'Meghalaya',           code: 'ML' },
  { name: 'Mizoram',             code: 'MZ' },
  { name: 'Nagaland',            code: 'NL' },
  { name: 'Odisha',              code: 'OD' },
  { name: 'Punjab',              code: 'PB' },
  { name: 'Rajasthan',           code: 'RJ' },
  { name: 'Sikkim',              code: 'SK' },
  { name: 'Tamil Nadu',          code: 'TN' },
  { name: 'Telangana',           code: 'TG' },
  { name: 'Tripura',             code: 'TR' },
  { name: 'Uttar Pradesh',       code: 'UP' },
  { name: 'Uttarakhand',         code: 'UK' },
  { name: 'West Bengal',         code: 'WB' },
  { name: 'Delhi',               code: 'DL' },
  { name: 'Jammu & Kashmir',     code: 'JK' },
  { name: 'Ladakh',              code: 'LA' },
  { name: 'Chandigarh',          code: 'CH' },
  { name: 'Puducherry',          code: 'PY' }
];

const STATIC_CITIES_RAW = [
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { id: "delhi", name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { id: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { id: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { id: "thane", name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { id: "patna", name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { id: "vadodara", name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573 },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { id: "nashik", name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { id: "faridabad", name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { id: "meerut", name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064 },
  { id: "rajkot", name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { id: "srinagar", name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { id: "aurangabad", name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { id: "dhanbad", name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304 },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
  { id: "navi-mumbai", name: "Navi Mumbai", state: "Maharashtra", lat: 19.0330, lng: 73.0297 },
  { id: "allahabad", name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { id: "howrah", name: "Howrah", state: "West Bengal", lat: 22.5785, lng: 88.3178 },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { id: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  { id: "gwalior", name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { id: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { id: "kota", name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
  { id: "guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { id: "kochi", name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 }
];

const DETAILED_AREAS_RAW: Record<string, { name: string; pincode: string; lat: number; lng: number; radius: number }[]> = {
  hyderabad: [
    { name: 'Banjara Hills', pincode: '500034', lat: 17.4156, lng: 78.4347, radius: 3.0 },
    { name: 'Jubilee Hills', pincode: '500033', lat: 17.4239, lng: 78.4073, radius: 3.0 },
    { name: 'Secunderabad', pincode: '500003', lat: 17.4399, lng: 78.4983, radius: 4.0 },
    { name: 'Gachibowli', pincode: '500032', lat: 17.4401, lng: 78.3489, radius: 3.5 },
    { name: 'HITEC City', pincode: '500081', lat: 17.4478, lng: 78.3696, radius: 3.0 },
    { name: 'Madhapur', pincode: '500081', lat: 17.4503, lng: 78.3808, radius: 2.5 },
    { name: 'Kondapur', pincode: '500084', lat: 17.4637, lng: 78.3549, radius: 3.0 }
  ],
  mumbai: [
    { name: 'Bandra', pincode: '400050', lat: 19.0596, lng: 72.8295, radius: 3.0 },
    { name: 'Andheri', pincode: '400053', lat: 19.1136, lng: 72.8697, radius: 4.0 },
    { name: 'Borivali', pincode: '400066', lat: 19.2313, lng: 72.8567, radius: 4.0 },
    { name: 'Dadar', pincode: '400014', lat: 19.0178, lng: 72.8478, radius: 3.0 }
  ],
  bengaluru: [
    { name: 'Koramangala', pincode: '560034', lat: 12.9352, lng: 77.6245, radius: 3.0 },
    { name: 'Indiranagar', pincode: '560038', lat: 12.9784, lng: 77.6408, radius: 3.0 },
    { name: 'Whitefield', pincode: '560066', lat: 12.9698, lng: 77.7499, radius: 4.5 },
    { name: 'HSR Layout', pincode: '560102', lat: 12.9116, lng: 77.6473, radius: 3.5 }
  ],
  delhi: [
    { name: 'Connaught Place', pincode: '110001', lat: 28.6315, lng: 77.2167, radius: 2.5 },
    { name: 'South Extension', pincode: '110049', lat: 28.5672, lng: 77.2195, radius: 3.0 },
    { name: 'Lajpat Nagar', pincode: '110024', lat: 28.5706, lng: 77.2434, radius: 3.0 },
    { name: 'Hauz Khas', pincode: '110016', lat: 28.5494, lng: 77.2001, radius: 3.0 }
  ],
  chennai: [
    { name: 'Anna Nagar', pincode: '600040', lat: 13.0850, lng: 80.2101, radius: 3.5 },
    { name: 'T Nagar', pincode: '600017', lat: 13.0418, lng: 80.2341, radius: 3.0 },
    { name: 'Adyar', pincode: '600020', lat: 13.0067, lng: 80.2567, radius: 3.0 },
    { name: 'Velachery', pincode: '600042', lat: 12.9815, lng: 80.2180, radius: 3.5 }
  ]
};

// ── Generated structured locations ───────────────────────────
export const states: State[] = STATIC_STATES_RAW.map((state) => ({
  id: generateStableUUID(`state_${state.code}`),
  name: state.name,
  code: state.code,
}));

export const cities: City[] = STATIC_CITIES_RAW.map((city) => {
  const stateObj = states.find((s) => s.name === city.state || s.code === city.state);
  const stateId = stateObj ? stateObj.id : generateStableUUID(`state_${city.state}`);
  return {
    id: generateStableUUID(`city_${city.id}`),
    state_id: stateId,
    name: city.name,
    slug: city.id,
    lat: city.lat,
    lng: city.lng,
  };
});

export const areas: Area[] = [];

// Populate areas
STATIC_CITIES_RAW.forEach((city) => {
  const cityId = generateStableUUID(`city_${city.id}`);
  const stateObj = states.find((s) => s.name === city.state || s.code === city.state);
  const stateId = stateObj ? stateObj.id : generateStableUUID(`state_${city.state}`);

  const detailed = DETAILED_AREAS_RAW[city.id];
  if (detailed) {
    detailed.forEach((area) => {
      areas.push({
        id: generateStableUUID(`area_${city.id}_${area.name}`),
        city_id: cityId,
        state_id: stateId,
        name: area.name,
        pincode: area.pincode,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius,
      });
    });
  } else {
    // Generate standard zones for cities without detailed area config
    const zones = ['Central', 'North', 'South', 'East', 'West'];
    zones.forEach((zone, index) => {
      const offsetLat = (index - 2) * 0.03;
      const offsetLng = ((index % 2) - 0.5) * 0.03;
      areas.push({
        id: generateStableUUID(`area_${city.id}_${zone}`),
        city_id: cityId,
        state_id: stateId,
        name: `${city.name} ${zone}`,
        pincode: `00000${index + 1}`,
        lat: city.lat + offsetLat,
        lng: city.lng + offsetLng,
        radius_km: 4.0,
      });
    });
  }
});

// ── Client Lookup Helpers ────────────────────────────────────

export function getStatesClient(): State[] {
  return [...states].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCitiesByStateClient(stateId: string): City[] {
  return cities
    .filter((c) => c.state_id === stateId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAreasByCityClient(cityId: string): Area[] {
  return areas
    .filter((a) => a.city_id === cityId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildDisplayZoneClient(areaId: string) {
  const area = areas.find((a) => a.id === areaId);
  if (!area) return null;
  const city = cities.find((c) => c.id === area.city_id);
  const state = states.find((s) => s.id === area.state_id);
  return {
    area: area.name,
    city: city ? city.name : 'Unknown City',
    state: state ? state.name : 'Unknown State',
    areaName: `${area.name}, ${city ? city.name : 'Unknown City'}`,
    displayZone: `${area.name}, ${city ? city.name : 'Unknown City'}, ${state ? state.name : 'Unknown State'}`,
  };
}
