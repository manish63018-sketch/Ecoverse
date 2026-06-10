// ─────────────────────────────────────────────────────────────
// EcoVerse — PostgreSQL Connection Pool with Robust In-Memory Mock Fallback
// Singleton pattern for Next.js (avoids connection exhaustion)
// ─────────────────────────────────────────────────────────────
import { Pool } from 'pg';

declare global {
  // Prevent multiple pool instances in Next.js hot-reload dev mode
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgMockDb: any | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[EcoVerse DB] DATABASE_URL is not set. PostgreSQL features will use Simulation Fallback. ' +
    'Copy .env.example to apps/web/.env.local and set DATABASE_URL to use a real database.'
  );
}

function createPool(): Pool {
  return new Pool({
    connectionString,
    max: 10,               // max pool connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  });
}

// In development, reuse the pool across hot-reloads
const pool: Pool =
  process.env.NODE_ENV === 'development'
    ? (global.__pgPool ?? (global.__pgPool = createPool()))
    : createPool();

export default pool;

// ── Deterministic Stable UUID Generator ────────────────────────
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

// ── In-Memory Simulation Seed Data ─────────────────────────────
const INDIAN_STATES = [
  { name: 'Andhra Pradesh',      code: 'AP' },
  { name: 'Arunachal Pradesh',   code: 'AR' },
  { name: 'Assam',               code: 'AS' },
  { name: 'Bihar',               code: 'BR' },
  { name: 'Chhattisgarh',        'code': 'CG' },
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

const SEED_CITIES = [
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

const DETAILED_AREAS: Record<string, { name: string; pincode: string; lat: number; lng: number; radius: number }[]> = {
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

function initializeMockDatabase() {
  const dbInstance: any = {
    states: [],
    cities: [],
    areas: [],
    ngos: [],
    rescueCases: [],
    notifications: [],
    escalations: [],
    userLocations: new Map(),
  };

  // 1. Setup States
  INDIAN_STATES.forEach((state) => {
    dbInstance.states.push({
      id: generateStableUUID(`state_${state.code}`),
      name: state.name,
      code: state.code,
      created_at: new Date().toISOString(),
    });
  });

  // 2. Setup Cities
  SEED_CITIES.forEach((city) => {
    const stateObj = dbInstance.states.find((s: any) => s.name === city.state || s.code === city.state);
    const stateId = stateObj ? stateObj.id : generateStableUUID(`state_${city.state}`);
    const cityId = generateStableUUID(`city_${city.id}`);
    
    dbInstance.cities.push({
      id: cityId,
      state_id: stateId,
      name: city.name,
      slug: city.id,
      lat: city.lat,
      lng: city.lng,
      created_at: new Date().toISOString(),
    });

    // 3. Setup Areas for this city
    const detailed = DETAILED_AREAS[city.id];
    if (detailed) {
      detailed.forEach((area) => {
        dbInstance.areas.push({
          id: generateStableUUID(`area_${city.id}_${area.name}`),
          city_id: cityId,
          state_id: stateId,
          name: area.name,
          pincode: area.pincode,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius,
          created_at: new Date().toISOString(),
        });
      });
    } else {
      // Generate standard areas for the city
      const zones = ['Central', 'North', 'South', 'East', 'West'];
      zones.forEach((zone, index) => {
        const offsetLat = (index - 2) * 0.03;
        const offsetLng = ((index % 2) - 0.5) * 0.03;
        dbInstance.areas.push({
          id: generateStableUUID(`area_${city.id}_${zone}`),
          city_id: cityId,
          state_id: stateId,
          name: `${city.name} ${zone}`,
          pincode: `00000${index + 1}`,
          lat: city.lat + offsetLat,
          lng: city.lng + offsetLng,
          radius_km: 4.0,
          created_at: new Date().toISOString(),
        });
      });
    }

    // 4. Setup NGO for this city
    dbInstance.ngos.push({
      id: generateStableUUID(`ngo_${city.id}`),
      name: `${city.name} Animal Welfare NGO`,
      city_id: cityId,
      state_id: stateId,
      contact_email: `contact@${city.id}welfare.org`,
      emergency_contact: '9876543210',
      fcm_token: `fcm_token_ngo_${city.id}`,
      lat: city.lat + 0.01,
      lng: city.lng - 0.01,
      created_at: new Date().toISOString(),
    });
  });

  return dbInstance;
}

// Global initialization
if (process.env.NODE_ENV === 'development') {
  if (!global.__pgMockDb) {
    global.__pgMockDb = initializeMockDatabase();
  }
} else {
  if (!global.__pgMockDb) {
    global.__pgMockDb = initializeMockDatabase();
  }
}

const mockDb = global.__pgMockDb || initializeMockDatabase();

// ── In-Memory SQL Query Simulation Logic ──────────────────────
async function simulateQuery(sql: string, params: any[] = []): Promise<any[]> {
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT states
  if (lowerSql.includes('select id, name, code, created_at from states')) {
    return [...mockDb.states].sort((a, b) => a.name.localeCompare(b.name));
  }

  // 2. SELECT cities by state
  if (lowerSql.includes('from cities') && lowerSql.includes('where state_id = $1')) {
    const stateId = params[0];
    return mockDb.cities
      .filter((c: any) => c.state_id === stateId)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  // 3. SELECT areas by city
  if (lowerSql.includes('from areas') && lowerSql.includes('where city_id = $1')) {
    const cityId = params[0];
    return mockDb.areas
      .filter((a: any) => a.city_id === cityId)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  // 4. Validate location hierarchy
  if (lowerSql.includes('select a.id from areas a join cities c') && lowerSql.includes('a.id = $1 and c.id = $2 and s.id = $3')) {
    const areaId = params[0];
    const cityId = params[1];
    const stateId = params[2];
    const area = mockDb.areas.find((a: any) => a.id === areaId && a.city_id === cityId && a.state_id === stateId);
    return area ? [{ id: area.id }] : [];
  }

  // 5. Build display zone / area info
  if (lowerSql.includes('select a.name as area, c.name as city, s.name as state') && lowerSql.includes('where a.id = $1')) {
    const areaId = params[0];
    const area = mockDb.areas.find((a: any) => a.id === areaId);
    if (!area) return [];
    const city = mockDb.cities.find((c: any) => c.id === area.city_id);
    const state = mockDb.states.find((s: any) => s.id === area.state_id);
    return [{
      area: area.name,
      city: city ? city.name : 'Unknown City',
      state: state ? state.name : 'Unknown State',
    }];
  }

  // 6. Get area details by ID
  if (lowerSql.includes('from areas') && lowerSql.includes('where id = $1')) {
    const areaId = params[0];
    const area = mockDb.areas.find((a: any) => a.id === areaId);
    return area ? [area] : [];
  }

  // 7. Get user's location profile
  if (lowerSql.includes('select ul.state_id') && lowerSql.includes('where ul.firebase_uid = $1')) {
    const firebaseUid = params[0];
    const userLoc = mockDb.userLocations.get(firebaseUid);
    if (!userLoc) return [];
    const area = mockDb.areas.find((a: any) => a.id === userLoc.area_id);
    const city = mockDb.cities.find((c: any) => c.id === userLoc.city_id);
    const state = mockDb.states.find((s: any) => s.id === userLoc.state_id);

    return [{
      state_id: userLoc.state_id,
      city_id: userLoc.city_id,
      area_id: userLoc.area_id,
      area_name: area ? area.name : null,
      city_name: city ? city.name : null,
      state_name: state ? state.name : null,
    }];
  }

  // 8. Upsert user location profile
  if (lowerSql.includes('insert into user_locations') && lowerSql.includes('on conflict (firebase_uid) do update')) {
    const firebaseUid = params[0];
    const stateId = params[1];
    const cityId = params[2];
    const areaId = params[3];
    const fcmToken = params[4];
    const availableNow = params[5];
    const volunteerLat = params[6];
    const volunteerLng = params[7];
    const verificationStatus = params[8];

    const existing = mockDb.userLocations.get(firebaseUid) || {};
    mockDb.userLocations.set(firebaseUid, {
      ...existing,
      firebase_uid: firebaseUid,
      state_id: stateId,
      city_id: cityId,
      area_id: areaId,
      fcm_token: fcmToken !== null ? fcmToken : existing.fcm_token,
      available_now: availableNow !== null ? availableNow : existing.available_now,
      volunteer_lat: volunteerLat !== null ? volunteerLat : existing.volunteer_lat,
      volunteer_lng: volunteerLng !== null ? volunteerLng : existing.volunteer_lng,
      verification_status: verificationStatus !== null ? verificationStatus : (existing.verification_status || 'verified'),
      updated_at: new Date().toISOString()
    });
    return [];
  }

  // 9. Count endpoints for stats
  if (lowerSql.startsWith('select count(*)')) {
    if (lowerSql.includes('from states')) return [{ count: String(mockDb.states.length) }];
    if (lowerSql.includes('from cities')) return [{ count: String(mockDb.cities.length) }];
    if (lowerSql.includes('from areas')) return [{ count: String(mockDb.areas.length) }];
    if (lowerSql.includes('from user_locations')) return [{ count: String(mockDb.userLocations.size) }];
    if (lowerSql.includes('from ngos')) return [{ count: String(mockDb.ngos.length) }];
    if (lowerSql.includes('from rescue_cases')) {
      if (lowerSql.includes("where status = 'resolved'")) {
        const count = mockDb.rescueCases.filter((c: any) => c.status === 'resolved').length;
        return [{ count: String(count) }];
      }
      return [{ count: String(mockDb.rescueCases.length) }];
    }
  }

  // 10. Insert rescue case
  if (lowerSql.includes('insert into rescue_cases') && lowerSql.includes('returning')) {
    const reporterUserId = params[0];
    const stateId = params[1];
    const cityId = params[2];
    const areaId = params[3];
    const exactLat = params[4];
    const exactLng = params[5];
    const areaName = params[6];
    const displayZone = params[7];
    const animalType = params[8];
    const conditionSummary = params[9];
    const emergencyLevel = params[10];
    const description = params[11];

    const newCase = {
      id: generateStableUUID(`rescue_${mockDb.rescueCases.length}_${Date.now()}`),
      reporter_user_id: reporterUserId,
      state_id: stateId,
      city_id: cityId,
      area_id: areaId,
      exact_lat: exactLat,
      exact_lng: exactLng,
      area_name: areaName,
      display_zone: displayZone,
      animal_type: animalType,
      condition_summary: conditionSummary,
      emergency_level: emergencyLevel,
      description: description,
      status: 'open',
      assigned_volunteer_id: null,
      assigned_ngo_id: null,
      created_at: new Date().toISOString(),
      assigned_at: null,
      escalated_at: null,
      resolved_at: null,
    };

    mockDb.rescueCases.push(newCase);
    return [newCase];
  }

  // 11. Retrieve rescue cases with Joins
  if (lowerSql.includes('select rc.id') && lowerSql.includes('from rescue_cases rc')) {
    let filteredCases = [...mockDb.rescueCases];

    // Filter by status if specified in query structure or if the status matches the list
    if (cleanSql.includes("rc.status IN ('open', 'assigned', 'in_progress', 'escalated')")) {
      filteredCases = filteredCases.filter((c: any) => ['open', 'assigned', 'in_progress', 'escalated'].includes(c.status));
    }

    // Parameters matching
    if (cleanSql.includes('rc.area_id = $1') || cleanSql.includes('rc.area_id = $2')) {
      const areaVal = params[0];
      filteredCases = filteredCases.filter((c: any) => c.area_id === areaVal);
    } else if (cleanSql.includes('rc.city_id = $1') || cleanSql.includes('rc.city_id = $2')) {
      const cityVal = params[0];
      filteredCases = filteredCases.filter((c: any) => c.city_id === cityVal);
    } else if (cleanSql.includes('rc.state_id = $1') || cleanSql.includes('rc.state_id = $2')) {
      const stateVal = params[0];
      filteredCases = filteredCases.filter((c: any) => c.state_id === stateVal);
    }

    // Additional status filter via params
    if (cleanSql.includes('rc.status = $1') || cleanSql.includes('rc.status = $2') || cleanSql.includes('rc.status = $3')) {
      const statusParam = params[params.length - 1];
      if (typeof statusParam === 'string' && ['open', 'assigned', 'in_progress', 'resolved', 'escalated'].includes(statusParam)) {
        filteredCases = filteredCases.filter((c: any) => c.status === statusParam);
      }
    }

    // Join display elements and map sorted values
    return filteredCases.map((c: any) => {
      const city = mockDb.cities.find((ct: any) => ct.id === c.city_id);
      const state = mockDb.states.find((st: any) => st.id === c.state_id);
      return {
        ...c,
        city_name: city ? city.name : 'Unknown City',
        state_name: state ? state.name : 'Unknown State',
      };
    }).sort((a: any, b: any) => {
      const levelWeight: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
      const weightA = levelWeight[a.emergency_level] || 3;
      const weightB = levelWeight[b.emergency_level] || 3;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // 12. Update rescue notifications response
  if (lowerSql.includes('update rescue_notifications') && lowerSql.includes('response_type = $1')) {
    const responseType = params[0];
    const rescueCaseId = params[1];
    const volunteerId = params[2];

    const notif = mockDb.notifications.find((n: any) => n.rescue_case_id === rescueCaseId && n.volunteer_id === volunteerId && n.response_type === null);
    if (notif) {
      notif.response_type = responseType;
      notif.responded_at = new Date().toISOString();
    }
    return [];
  }

  // 13. Update rescue case assignment
  if (lowerSql.includes('update rescue_cases') && lowerSql.includes('assigned_volunteer_id = $1')) {
    const volunteerId = params[0];
    const caseId = params[1];
    const caseObj = mockDb.rescueCases.find((c: any) => c.id === caseId);
    if (caseObj) {
      caseObj.assigned_volunteer_id = volunteerId;
      caseObj.status = 'assigned';
      caseObj.assigned_at = new Date().toISOString();
    }
    return [];
  }

  // 14. Update rescue status (e.g. mark resolved)
  if (lowerSql.includes('update rescue_cases') && lowerSql.includes('status = $1') && params.length === 2) {
    const newStatus = params[0];
    const caseId = params[1];
    const caseObj = mockDb.rescueCases.find((c: any) => c.id === caseId);
    if (caseObj) {
      caseObj.status = newStatus;
      if (newStatus === 'resolved') caseObj.resolved_at = new Date().toISOString();
    }
    return [];
  }

  // 15. Insert rescue notifications
  if (lowerSql.includes('insert into rescue_notifications')) {
    const caseId = params[0];
    const volunteerId = params[1];
    const level = params[2];
    mockDb.notifications.push({
      id: generateStableUUID(`notif_${caseId}_${volunteerId}_${Date.now()}`),
      rescue_case_id: caseId,
      volunteer_id: volunteerId,
      notification_level: level,
      sent_at: new Date().toISOString(),
      responded_at: null,
      response_type: null,
    });
    return [];
  }

  // 16. Insert escalation log
  if (lowerSql.includes('insert into escalation_log')) {
    const caseId = params[0];
    const fromLevel = params[1];
    const toLevel = params[2];
    const reason = params[3];
    mockDb.escalations.push({
      id: generateStableUUID(`escalate_${caseId}_${Date.now()}`),
      rescue_case_id: caseId,
      from_level: fromLevel,
      to_level: toLevel,
      reason: reason,
      escalated_at: new Date().toISOString()
    });

    if (toLevel === 'ngo') {
      const caseObj = mockDb.rescueCases.find((c: any) => c.id === caseId);
      if (caseObj) {
        caseObj.status = 'escalated';
        caseObj.escalated_at = new Date().toISOString();
      }
    }
    return [];
  }

  // 17. Alert engine: find volunteers in same area
  if (lowerSql.includes('from user_locations ul') && lowerSql.includes('ul.area_id = $1') && lowerSql.includes('ul.available_now = true')) {
    const areaId = params[0];
    const list: any[] = [];
    mockDb.userLocations.forEach((ul: any) => {
      if (ul.area_id === areaId && ul.available_now === true && ul.verification_status === 'verified') {
        list.push({ firebase_uid: ul.firebase_uid, fcm_token: ul.fcm_token });
      }
    });
    return list;
  }

  // 18. Alert engine: find volunteers in other areas of same city
  if (lowerSql.includes('from user_locations ul') && lowerSql.includes('ul.city_id = $1') && lowerSql.includes('ul.area_id != $2')) {
    const cityId = params[0];
    const areaId = params[1];
    const list: any[] = [];
    mockDb.userLocations.forEach((ul: any) => {
      if (ul.city_id === cityId && ul.area_id !== areaId && ul.available_now === true && ul.verification_status === 'verified') {
        list.push({ firebase_uid: ul.firebase_uid, fcm_token: ul.fcm_token });
      }
    });
    return list;
  }

  // 19. Alert engine: find volunteers in other cities of same state
  if (lowerSql.includes('from user_locations ul') && lowerSql.includes('ul.state_id = $1') && lowerSql.includes('ul.city_id != $2')) {
    const stateId = params[0];
    const cityId = params[1];
    const list: any[] = [];
    mockDb.userLocations.forEach((ul: any) => {
      if (ul.state_id === stateId && ul.city_id !== cityId && ul.available_now === true) {
        list.push({ firebase_uid: ul.firebase_uid, fcm_token: ul.fcm_token });
      }
    });
    return list;
  }

  // 20. Alert engine: find NGOs in same city
  if (lowerSql.includes('from ngos') && lowerSql.includes('where city_id = $1')) {
    const cityId = params[0];
    return mockDb.ngos
      .filter((n: any) => n.city_id === cityId)
      .slice(0, 3);
  }

  // 21. Count accepted notifications
  if (lowerSql.includes('select count(*) as count from rescue_notifications') && lowerSql.includes("response_type = 'accepted'")) {
    const caseId = params[0];
    const level = params[1];
    const count = mockDb.notifications.filter((n: any) => n.rescue_case_id === caseId && n.notification_level === level && n.response_type === 'accepted').length;
    return [{ count: String(count) }];
  }

  // 22. Case status
  if (lowerSql.includes('select status from rescue_cases where id = $1')) {
    const caseId = params[0];
    const caseObj = mockDb.rescueCases.find((c: any) => c.id === caseId);
    return caseObj ? [{ status: caseObj.status }] : [];
  }

  console.warn(`[EcoVerse Simulation] Unhandled query pattern: "${cleanSql.substring(0, 60)}..."`);
  return [];
}

// Helper: typed query with automatic error logging and fallback simulation
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const queryParams = params ?? [];
  
  if (!connectionString) {
    // No connection string at all, run simulation silently
    return simulateQuery(sql, queryParams) as Promise<T[]>;
  }

  try {
    const result = await pool.query(sql, queryParams);
    return result.rows as T[];
  } catch (err: any) {
    // If the error indicates a connection failure (ECONNREFUSED) or missing tables, run simulation
    if (err.code === 'ECONNREFUSED' || err.message?.includes('does not exist') || err.message?.includes('relation')) {
      console.warn(
        `[EcoVerse DB Fallback] Database connection failed (${err.code || err.message}). ` +
        `Switching to local In-Memory Simulation for this query.`
      );
      return simulateQuery(sql, queryParams) as Promise<T[]>;
    }
    
    // Reraise other syntax or programming errors so developers notice them
    console.error('[EcoVerse DB] Query execution failed:', err);
    throw err;
  }
}
