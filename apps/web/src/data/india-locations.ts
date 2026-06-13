export const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep','Puducherry','Andaman and Nicobar Islands'
] as const;

export const INDIA_CITIES_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik','Thane','Aurangabad','Solapur','Kolhapur','Amravati','Nanded'],
  'Karnataka': ['Bengaluru','Mysuru','Mangaluru','Hubballi','Belagavi','Davangere','Shivamogga','Tumakuru','Udupi','Ballari'],
  'Delhi': ['New Delhi','Dwarka','Rohini','Saket','Janakpuri','Pitampura','Laxmi Nagar','Kalkaji'],
  'West Bengal': ['Kolkata','Howrah','Siliguri','Durgapur','Asansol','Kharagpur'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Erode'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Khammam','Karimnagar','Secunderabad'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Bhavnagar'],
  'Rajasthan': ['Jaipur','Jodhpur','Kota','Udaipur','Ajmer','Bikaner'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Ghaziabad','Agra','Varanasi','Meerut','Noida'],
  'Kerala': ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Kannur'],
  'Madhya Pradesh': ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar'],
  'Punjab': ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali'],
  'Haryana': ['Gurugram','Faridabad','Panipat','Ambala','Rohtak','Hisar'],
  'Bihar': ['Patna','Gaya','Bhagalpur','Muzaffarpur','Darbhanga','Purnia'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela','Sambalpur','Puri','Balasore'],
  'Assam': ['Guwahati','Silchar','Dibrugarh','Jorhat','Tinsukia','Tezpur'],
  'Jharkhand': ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh'],
  'Chhattisgarh': ['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon'],
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur','Tirupati','Kakinada','Nellore'],
  'Jammu and Kashmir': ['Srinagar','Jammu','Anantnag','Baramulla','Kathua'],
  'Ladakh': ['Leh','Kargil'],
  'Goa': ['Panaji','Margao','Vasco da Gama','Mapusa'],
  'Himachal Pradesh': ['Shimla','Solan','Mandi','Dharamshala','Kullu','Una'],
  'Uttarakhand': ['Dehradun','Haridwar','Rishikesh','Haldwani','Roorkee','Kashipur'],
  'Tripura': ['Agartala','Udaipur','Dharmanagar'],
  'Manipur': ['Imphal','Thoubal','Churachandpur'],
  'Meghalaya': ['Shillong','Tura','Jowai'],
  'Mizoram': ['Aizawl','Lunglei'],
  'Nagaland': ['Kohima','Dimapur'],
  'Sikkim': ['Gangtok','Namchi'],
  'Arunachal Pradesh': ['Itanagar','Naharlagun'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry','Karaikal','Mahe','Yanam'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Silvassa','Daman','Diu'],
  'Lakshadweep': ['Kavaratti']
};

export const getStates = () => [...INDIA_STATES];
export const getCitiesForState = (state: string) => INDIA_CITIES_BY_STATE[state] ?? [];
