-- ═══════════════════════════════════════════════════════════════
-- EcoVerse — Seed 001: India Locations
-- Major Indian cities + comprehensive Hyderabad areas
-- Run AFTER 001_location_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ── STATES ──────────────────────────────────────────────────────
INSERT INTO states (name, code) VALUES
  ('Andhra Pradesh',      'AP'),
  ('Arunachal Pradesh',   'AR'),
  ('Assam',               'AS'),
  ('Bihar',               'BR'),
  ('Chhattisgarh',        'CG'),
  ('Goa',                 'GA'),
  ('Gujarat',             'GJ'),
  ('Haryana',             'HR'),
  ('Himachal Pradesh',    'HP'),
  ('Jharkhand',           'JH'),
  ('Karnataka',           'KA'),
  ('Kerala',              'KL'),
  ('Madhya Pradesh',      'MP'),
  ('Maharashtra',         'MH'),
  ('Manipur',             'MN'),
  ('Meghalaya',           'ML'),
  ('Mizoram',             'MZ'),
  ('Nagaland',            'NL'),
  ('Odisha',              'OD'),
  ('Punjab',              'PB'),
  ('Rajasthan',           'RJ'),
  ('Sikkim',              'SK'),
  ('Tamil Nadu',          'TN'),
  ('Telangana',           'TG'),
  ('Tripura',             'TR'),
  ('Uttar Pradesh',       'UP'),
  ('Uttarakhand',         'UK'),
  ('West Bengal',         'WB'),
  ('Delhi',               'DL'),
  ('Jammu & Kashmir',     'JK'),
  ('Ladakh',              'LA'),
  ('Chandigarh',          'CH'),
  ('Puducherry',          'PY')
ON CONFLICT (code) DO NOTHING;

-- ── CITIES ──────────────────────────────────────────────────────
-- Telangana Cities
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Hyderabad', 'hyderabad', 17.3850, 78.4867
FROM states s WHERE s.code = 'TG'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Warangal', 'warangal', 17.9784, 79.5941
FROM states s WHERE s.code = 'TG'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Nizamabad', 'nizamabad', 18.6725, 78.0941
FROM states s WHERE s.code = 'TG'
ON CONFLICT (slug) DO NOTHING;

-- Maharashtra Cities
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Mumbai', 'mumbai', 19.0760, 72.8777
FROM states s WHERE s.code = 'MH'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Pune', 'pune', 18.5204, 73.8567
FROM states s WHERE s.code = 'MH'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Nagpur', 'nagpur', 21.1458, 79.0882
FROM states s WHERE s.code = 'MH'
ON CONFLICT (slug) DO NOTHING;

-- Karnataka Cities
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Bengaluru', 'bengaluru', 12.9716, 77.5946
FROM states s WHERE s.code = 'KA'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Mysuru', 'mysuru', 12.2958, 76.6394
FROM states s WHERE s.code = 'KA'
ON CONFLICT (slug) DO NOTHING;

-- Delhi
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'New Delhi', 'new-delhi', 28.6139, 77.2090
FROM states s WHERE s.code = 'DL'
ON CONFLICT (slug) DO NOTHING;

-- Tamil Nadu
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Chennai', 'chennai', 13.0827, 80.2707
FROM states s WHERE s.code = 'TN'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Coimbatore', 'coimbatore', 11.0168, 76.9558
FROM states s WHERE s.code = 'TN'
ON CONFLICT (slug) DO NOTHING;

-- West Bengal
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Kolkata', 'kolkata', 22.5726, 88.3639
FROM states s WHERE s.code = 'WB'
ON CONFLICT (slug) DO NOTHING;

-- Rajasthan
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Jaipur', 'jaipur', 26.9124, 75.7873
FROM states s WHERE s.code = 'RJ'
ON CONFLICT (slug) DO NOTHING;

-- Kerala
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Kochi', 'kochi', 9.9312, 76.2673
FROM states s WHERE s.code = 'KL'
ON CONFLICT (slug) DO NOTHING;

-- Gujarat
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Ahmedabad', 'ahmedabad', 23.0225, 72.5714
FROM states s WHERE s.code = 'GJ'
ON CONFLICT (slug) DO NOTHING;

-- Andhra Pradesh
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Visakhapatnam', 'visakhapatnam', 17.6868, 83.2185
FROM states s WHERE s.code = 'AP'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Vijayawada', 'vijayawada', 16.5062, 80.6480
FROM states s WHERE s.code = 'AP'
ON CONFLICT (slug) DO NOTHING;

-- ── HYDERABAD AREAS (Comprehensive) ─────────────────────────────
-- These are the core demo areas showing strict isolation within one city
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT 
  c.id AS city_id, 
  s.id AS state_id,
  area_data.name,
  area_data.pincode,
  area_data.lat,
  area_data.lng,
  area_data.radius_km
FROM cities c
JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Banjara Hills',    '500034', 17.4156, 78.4347, 3.0),
  ('Jubilee Hills',    '500033', 17.4239, 78.4073, 3.0),
  ('Secunderabad',     '500003', 17.4399, 78.4983, 4.0),
  ('Gachibowli',       '500032', 17.4401, 78.3489, 3.5),
  ('HITEC City',       '500081', 17.4478, 78.3696, 3.0),
  ('Madhapur',         '500081', 17.4503, 78.3808, 2.5),
  ('Kondapur',         '500084', 17.4637, 78.3549, 3.0),
  ('Ameerpet',         '500016', 17.4342, 78.4452, 2.5),
  ('Begumpet',         '500016', 17.4438, 78.4637, 2.5),
  ('Kukatpally',       '500072', 17.4849, 78.3996, 3.5),
  ('LB Nagar',         '500074', 17.3469, 78.5482, 3.0),
  ('Dilsukhnagar',     '500060', 17.3688, 78.5267, 3.0),
  ('Mehdipatnam',      '500028', 17.3960, 78.4360, 2.5),
  ('Tolichowki',       '500008', 17.4012, 78.4149, 2.5),
  ('Uppal',            '500039', 17.4007, 78.5592, 3.0),
  ('Abids',            '500001', 17.3850, 78.4734, 2.0),
  ('Nampally',         '500001', 17.3906, 78.4709, 2.0),
  ('Koti',             '500095', 17.3843, 78.4840, 2.0),
  ('Charminar',        '500002', 17.3616, 78.4747, 2.5),
  ('Malakpet',         '500036', 17.3695, 78.5022, 2.5),
  ('Himayatnagar',     '500029', 17.4065, 78.4813, 2.0),
  ('Somajiguda',       '500082', 17.4243, 78.4550, 2.0),
  ('Panjagutta',       '500082', 17.4248, 78.4482, 2.5),
  ('Nanakramguda',     '500032', 17.4270, 78.3681, 3.0),
  ('Miyapur',          '500049', 17.4971, 78.3571, 3.5),
  ('Bachupally',       '500090', 17.5388, 78.3769, 3.5),
  ('Nizampet',         '500090', 17.5138, 78.3808, 3.0),
  ('Chandanagar',      '500050', 17.4912, 78.3237, 3.5),
  ('Manikonda',        '500089', 17.4052, 78.3838, 3.0),
  ('Narsingi',         '500075', 17.3894, 78.3528, 3.5),
  ('Attapur',          '500048', 17.3760, 78.4155, 2.5),
  ('Raidurg',          '500032', 17.4267, 78.3766, 2.5),
  ('Gandi Maisamma',   '500043', 17.5259, 78.4180, 3.5),
  ('Kompally',         '500014', 17.5618, 78.4777, 4.0),
  ('Alwal',            '500010', 17.5003, 78.5170, 3.5),
  ('Malkajgiri',       '500047', 17.4561, 78.5296, 3.5),
  ('Hastinapuram',     '500079', 17.3208, 78.5536, 3.0),
  ('Sainikpuri',       '500062', 17.4793, 78.5555, 3.0),
  ('AS Rao Nagar',     '500062', 17.4860, 78.5629, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km)
WHERE c.slug = 'hyderabad' AND s.code = 'TG'
ON CONFLICT (city_id, name) DO NOTHING;

-- ── MUMBAI AREAS (Sample) ────────────────────────────────────────
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT 
  c.id, s.id,
  area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c
JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Bandra',        '400050', 19.0596, 72.8295, 3.0),
  ('Andheri',       '400053', 19.1136, 72.8697, 4.0),
  ('Borivali',      '400066', 19.2313, 72.8567, 4.0),
  ('Dadar',         '400014', 19.0178, 72.8478, 3.0),
  ('Kurla',         '400070', 19.0726, 72.8784, 3.0),
  ('Chembur',       '400071', 19.0522, 72.9005, 3.0),
  ('Powai',         '400076', 19.1197, 72.9065, 3.5),
  ('Thane',         '400601', 19.2183, 72.9781, 4.0),
  ('Navi Mumbai',   '400703', 19.0330, 73.0297, 5.0),
  ('Colaba',        '400005', 18.9067, 72.8147, 2.5),
  ('Malad',         '400064', 19.1876, 72.8484, 4.0),
  ('Ghatkopar',     '400077', 19.0869, 72.9080, 3.5)
) AS area_data(name, pincode, lat, lng, radius_km)
WHERE c.slug = 'mumbai' AND s.code = 'MH'
ON CONFLICT (city_id, name) DO NOTHING;

-- ── BENGALURU AREAS (Sample) ─────────────────────────────────────
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT 
  c.id, s.id,
  area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c
JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Koramangala',   '560034', 12.9352, 77.6245, 3.0),
  ('Indiranagar',   '560038', 12.9784, 77.6408, 3.0),
  ('Whitefield',    '560066', 12.9698, 77.7499, 4.5),
  ('Electronic City', '560100', 12.8458, 77.6603, 5.0),
  ('HSR Layout',    '560102', 12.9116, 77.6473, 3.5),
  ('Jayanagar',     '560041', 12.9300, 77.5940, 3.0),
  ('JP Nagar',      '560078', 12.9107, 77.5839, 3.5),
  ('Malleshwaram',  '560003', 13.0037, 77.5714, 3.0),
  ('Rajajinagar',   '560010', 12.9902, 77.5516, 3.0),
  ('Hebbal',        '560024', 13.0346, 77.5969, 3.5),
  ('Yelahanka',     '560064', 13.1004, 77.5963, 4.0),
  ('BTM Layout',    '560076', 12.9166, 77.6101, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km)
WHERE c.slug = 'bengaluru' AND s.code = 'KA'
ON CONFLICT (city_id, name) DO NOTHING;

-- ── DELHI AREAS (Sample) ─────────────────────────────────────────
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT 
  c.id, s.id,
  area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c
JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Connaught Place',  '110001', 28.6315, 77.2167, 2.5),
  ('South Extension',  '110049', 28.5672, 77.2195, 3.0),
  ('Lajpat Nagar',     '110024', 28.5706, 77.2434, 3.0),
  ('Hauz Khas',        '110016', 28.5494, 77.2001, 3.0),
  ('Rohini',           '110085', 28.7499, 77.1064, 5.0),
  ('Dwarka',           '110078', 28.5921, 77.0460, 5.0),
  ('Saket',            '110017', 28.5245, 77.2066, 3.5),
  ('Noida Sector 18',  '201301', 28.5682, 77.3257, 4.0),
  ('Gurugram DLF',     '122002', 28.4595, 77.0266, 5.0)
) AS area_data(name, pincode, lat, lng, radius_km)
WHERE c.slug = 'new-delhi' AND s.code = 'DL'
ON CONFLICT (city_id, name) DO NOTHING;

-- ── CHENNAI AREAS (Sample) ───────────────────────────────────────
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT 
  c.id, s.id,
  area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c
JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Anna Nagar',    '600040', 13.0850, 80.2101, 3.5),
  ('T Nagar',       '600017', 13.0418, 80.2341, 3.0),
  ('Adyar',         '600020', 13.0067, 80.2567, 3.0),
  ('Velachery',     '600042', 12.9815, 80.2180, 3.5),
  ('Porur',         '600116', 13.0389, 80.1565, 3.5),
  ('Tambaram',      '600045', 12.9249, 80.1000, 4.0),
  ('Chromepet',     '600044', 12.9516, 80.1462, 3.0),
  ('Perambur',      '600011', 13.1160, 80.2407, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km)
WHERE c.slug = 'chennai' AND s.code = 'TN'
ON CONFLICT (city_id, name) DO NOTHING;

-- ── 31 ADDITIONAL PILOT CITIES ────────────────────────────────────
INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Surat', 'surat', 21.1702, 72.8311 FROM states s WHERE s.code = 'GJ' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Lucknow', 'lucknow', 26.8467, 80.9462 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Kanpur', 'kanpur', 26.4499, 80.3319 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Indore', 'indore', 22.7196, 75.8577 FROM states s WHERE s.code = 'MP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Thane', 'thane', 19.2183, 72.9781 FROM states s WHERE s.code = 'MH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Bhopal', 'bhopal', 23.2599, 77.4126 FROM states s WHERE s.code = 'MP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Patna', 'patna', 25.5941, 85.1376 FROM states s WHERE s.code = 'BR' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Vadodara', 'vadodara', 22.3072, 73.1812 FROM states s WHERE s.code = 'GJ' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Ghaziabad', 'ghaziabad', 28.6692, 77.4538 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Ludhiana', 'ludhiana', 30.9010, 75.8573 FROM states s WHERE s.code = 'PB' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Agra', 'agra', 27.1767, 78.0081 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Nashik', 'nashik', 19.9975, 73.7898 FROM states s WHERE s.code = 'MH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Faridabad', 'faridabad', 28.4089, 77.3178 FROM states s WHERE s.code = 'HR' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Meerut', 'meerut', 28.9845, 77.7064 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Rajkot', 'rajkot', 22.3039, 70.8022 FROM states s WHERE s.code = 'GJ' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Varanasi', 'varanasi', 25.3176, 82.9739 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Srinagar', 'srinagar', 34.0837, 74.7973 FROM states s WHERE s.code = 'JK' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Aurangabad', 'aurangabad', 19.8762, 75.3433 FROM states s WHERE s.code = 'MH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Dhanbad', 'dhanbad', 23.7957, 86.4304 FROM states s WHERE s.code = 'JH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Amritsar', 'amritsar', 31.6340, 74.8723 FROM states s WHERE s.code = 'PB' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Navi Mumbai', 'navi-mumbai', 19.0330, 73.0297 FROM states s WHERE s.code = 'MH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Allahabad', 'allahabad', 25.4358, 81.8463 FROM states s WHERE s.code = 'UP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Ranchi', 'ranchi', 23.3441, 85.3096 FROM states s WHERE s.code = 'JH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Howrah', 'howrah', 22.5785, 88.3178 FROM states s WHERE s.code = 'WB' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Jabalpur', 'jabalpur', 23.1815, 79.9864 FROM states s WHERE s.code = 'MP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Gwalior', 'gwalior', 26.2183, 78.1828 FROM states s WHERE s.code = 'MP' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Jodhpur', 'jodhpur', 26.2389, 73.0243 FROM states s WHERE s.code = 'RJ' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Madurai', 'madurai', 9.9252, 78.1198 FROM states s WHERE s.code = 'TN' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Raipur', 'raipur', 21.2514, 81.6296 FROM states s WHERE s.code = 'CG' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Kota', 'kota', 25.2138, 75.8648 FROM states s WHERE s.code = 'RJ' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Guwahati', 'guwahati', 26.1445, 91.7362 FROM states s WHERE s.code = 'AS' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Chandigarh', 'chandigarh', 30.7333, 76.7794 FROM states s WHERE s.code = 'CH' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Dehradun', 'dehradun', 30.3165, 78.0322 FROM states s WHERE s.code = 'UK' ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (state_id, name, slug, lat, lng) 
SELECT s.id, 'Bhubaneswar', 'bhubaneswar', 20.2961, 85.8245 FROM states s WHERE s.code = 'OD' ON CONFLICT (slug) DO NOTHING;


-- ── AREAS FOR ALL REMAINING CITIES ───────────────────────────────
-- Seeding generic zones (Central, North, South, East, West) for every city 
-- that doesn't have detailed neighborhoods, enabling full cascading location dropdowns.

-- 1. Warangal Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Warangal Central', '506002', 17.9784, 79.5941, 3.5),
  ('Hanamkonda', '506001', 18.0125, 79.5630, 3.5),
  ('Kazipet', '506003', 17.9811, 79.5255, 3.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'warangal' ON CONFLICT (city_id, name) DO NOTHING;

-- 2. Nizamabad Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Nizamabad Central', '503001', 18.6725, 78.0941, 3.5),
  ('Subhash Nagar', '503002', 18.6811, 78.1022, 3.0),
  ('Armoor Zone', '503224', 18.7903, 78.2916, 4.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'nizamabad' ON CONFLICT (city_id, name) DO NOTHING;

-- 3. Pune Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Kothrud', '411038', 18.5074, 73.8077, 3.0),
  ('Shivajinagar', '411005', 18.5314, 73.8446, 3.0),
  ('Kalyani Nagar', '411006', 18.5463, 73.9033, 2.5),
  ('Viman Nagar', '411014', 18.5679, 73.9143, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'pune' ON CONFLICT (city_id, name) DO NOTHING;

-- 4. Nagpur Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Dharampeth', '440010', 21.1438, 79.0577, 3.0),
  ('Sadarpeth', '440001', 21.1633, 79.0805, 3.0),
  ('Manish Nagar', '440015', 21.0921, 79.0822, 3.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'nagpur' ON CONFLICT (city_id, name) DO NOTHING;

-- 5. Mysuru Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Gokulam', '570002', 12.3298, 76.6212, 3.0),
  ('Jayalakshmipuram', '570012', 12.3188, 76.6288, 3.0),
  ('Kuvempunagar', '570023', 12.2892, 76.6255, 3.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'mysuru' ON CONFLICT (city_id, name) DO NOTHING;

-- 6. Coimbatore Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Gandhipuram', '641012', 11.0183, 76.9697, 3.0),
  ('RS Puram', '641002', 11.0069, 76.9499, 3.0),
  ('Peelamedu', '641004', 11.0289, 77.0125, 4.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'coimbatore' ON CONFLICT (city_id, name) DO NOTHING;

-- 7. Kolkata Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Salt Lake City', '700091', 22.5834, 88.4208, 4.0),
  ('Park Street', '700016', 22.5539, 88.3512, 3.0),
  ('New Town', '700156', 22.5804, 88.4682, 4.5),
  ('Gariahat', '700019', 22.5194, 88.3681, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'kolkata' ON CONFLICT (city_id, name) DO NOTHING;

-- 8. Jaipur Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('C Scheme', '302001', 26.9099, 75.8033, 2.5),
  ('Malviya Nagar', '302017', 26.8524, 75.8239, 3.5),
  ('Vaishali Nagar', '302021', 26.9022, 75.7412, 3.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'jaipur' ON CONFLICT (city_id, name) DO NOTHING;

-- 9. Kochi Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Fort Kochi', '682001', 9.9678, 76.2425, 3.0),
  ('Edappally', '682024', 10.0261, 76.3125, 3.5),
  ('Kakkanad', '682030', 10.0125, 76.3533, 4.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'kochi' ON CONFLICT (city_id, name) DO NOTHING;

-- 10. Ahmedabad Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Satellite', '380015', 23.0305, 72.5183, 3.0),
  ('Navrangpura', '380009', 23.0372, 72.5577, 3.0),
  ('Vastrapur', '380015', 23.0358, 72.5273, 2.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'ahmedabad' ON CONFLICT (city_id, name) DO NOTHING;

-- 11. Visakhapatnam Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Gajuwaka', '530026', 17.6903, 83.2091, 4.0),
  ('Madhurawada', '530048', 17.8016, 83.3512, 4.0),
  ('MVP Colony', '530017', 17.7425, 83.3325, 3.0)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'visakhapatnam' ON CONFLICT (city_id, name) DO NOTHING;

-- 12. Vijayawada Areas
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, area_data.lat, area_data.lng, area_data.radius_km
FROM cities c JOIN states s ON c.state_id = s.id CROSS JOIN (VALUES
  ('Benz Circle', '520010', 16.5012, 80.6433, 2.5),
  ('One Town', '520001', 16.5188, 80.6125, 3.0),
  ('Governorpet', '520002', 16.5125, 80.6288, 2.5)
) AS area_data(name, pincode, lat, lng, radius_km) WHERE c.slug = 'vijayawada' ON CONFLICT (city_id, name) DO NOTHING;

-- 13. Generic Area Helper for all remaining 31 cities
-- Inserts 4 regional zones for each of the newly added cities
INSERT INTO areas (city_id, state_id, name, pincode, lat, lng, radius_km)
SELECT c.id, s.id, area_data.name, area_data.pincode, c.lat + area_data.offset_lat, c.lng + area_data.offset_lng, 4.0
FROM cities c JOIN states s ON c.state_id = s.id
CROSS JOIN (VALUES
  ('Central Zone', '000001',  0.00,  0.00),
  ('North Zone',   '000002',  0.03,  0.00),
  ('South Zone',   '000003', -0.03,  0.00),
  ('East Zone',    '000004',  0.00,  0.03),
  ('West Zone',    '000005',  0.00, -0.03)
) AS area_data(name, pincode, offset_lat, offset_lng)
WHERE c.slug IN (
  'surat', 'lucknow', 'kanpur', 'indore', 'thane', 'bhopal', 'patna', 'vadodara', 
  'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 
  'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi-mumbai', 
  'allahabad', 'ranchi', 'howrah', 'jabalpur', 'gwalior', 'jodhpur', 'madurai', 
  'raipur', 'kota', 'guwahati', 'chandigarh', 'dehradun', 'bhubaneswar'
) ON CONFLICT (city_id, name) DO NOTHING;

