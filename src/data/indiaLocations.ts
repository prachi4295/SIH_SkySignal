/* ═══════════════════════════════════════════════════════
   SkySignal — Comprehensive Indian States & Cities Dataset
   Structured with automatic City -> State resolution & GPS coords.
   ═══════════════════════════════════════════════════════ */

export interface CityData {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export const INDIAN_STATES_AND_UTS: string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const ALL_INDIAN_CITIES: CityData[] = [
  // ── Gujarat ──
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { city: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lon: 72.1519 },
  { city: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lon: 70.0577 },
  { city: 'Gandhinagar', state: 'Gujarat', lat: 23.2156, lon: 72.6369 },
  { city: 'Junagadh', state: 'Gujarat', lat: 21.5222, lon: 70.4579 },
  { city: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289 },
  { city: 'Navsari', state: 'Gujarat', lat: 20.9467, lon: 72.9520 },
  { city: 'Morbi', state: 'Gujarat', lat: 22.8173, lon: 70.8370 },
  { city: 'Bharuch', state: 'Gujarat', lat: 21.7051, lon: 72.9959 },
  { city: 'Porbandar', state: 'Gujarat', lat: 21.6417, lon: 69.6293 },
  { city: 'Godhra', state: 'Gujarat', lat: 22.7758, lon: 73.6149 },
  { city: 'Vapi', state: 'Gujarat', lat: 20.3713, lon: 72.9048 },
  { city: 'Valsad', state: 'Gujarat', lat: 20.6104, lon: 72.9268 },
  { city: 'Veraval', state: 'Gujarat', lat: 20.9077, lon: 70.3678 },
  { city: 'Bhuj', state: 'Gujarat', lat: 23.2420, lon: 69.6669 },
  { city: 'Surendranagar', state: 'Gujarat', lat: 22.7284, lon: 71.6371 },
  { city: 'Gandhidham', state: 'Gujarat', lat: 23.0753, lon: 70.1337 },
  { city: 'Mehsana', state: 'Gujarat', lat: 23.5880, lon: 72.3693 },
  { city: 'Patan', state: 'Gujarat', lat: 23.8493, lon: 72.1266 },
  { city: 'Palanpur', state: 'Gujarat', lat: 24.1724, lon: 72.4346 },
  { city: 'Dahod', state: 'Gujarat', lat: 22.8358, lon: 74.2552 },
  { city: 'Amreli', state: 'Gujarat', lat: 21.6032, lon: 71.2221 },
  { city: 'Botad', state: 'Gujarat', lat: 22.1706, lon: 71.6663 },
  { city: 'Ankleshwar', state: 'Gujarat', lat: 21.6264, lon: 73.0022 },
  { city: 'Himmatnagar', state: 'Gujarat', lat: 23.5977, lon: 72.9698 },
  { city: 'Nadiad', state: 'Gujarat', lat: 22.6916, lon: 72.8634 },
  { city: 'Gondal', state: 'Gujarat', lat: 21.9619, lon: 70.7984 },
  { city: 'Dwarka', state: 'Gujarat', lat: 22.2442, lon: 68.9685 },
  { city: 'Damnagar', state: 'Gujarat', lat: 21.7011, lon: 71.5173 },
  { city: 'Lathi', state: 'Gujarat', lat: 21.7247, lon: 71.3900 },
  { city: 'Babra', state: 'Gujarat', lat: 21.8519, lon: 71.3025 },
  { city: 'Savarkundla', state: 'Gujarat', lat: 21.3328, lon: 71.3086 },
  { city: 'Dhari', state: 'Gujarat', lat: 21.3255, lon: 71.0234 },
  { city: 'Rajula', state: 'Gujarat', lat: 20.9997, lon: 71.4397 },
  { city: 'Mahuva', state: 'Gujarat', lat: 21.0914, lon: 71.7634 },
  { city: 'Palitana', state: 'Gujarat', lat: 21.5230, lon: 71.8291 },
  { city: 'Keshod', state: 'Gujarat', lat: 21.3039, lon: 70.2520 },
  { city: 'Una', state: 'Gujarat', lat: 20.8256, lon: 71.0389 },
  { city: 'Bardoli', state: 'Gujarat', lat: 21.1215, lon: 73.1118 },
  { city: 'Mandvi', state: 'Gujarat', lat: 22.8333, lon: 69.3556 },
  { city: 'Deesa', state: 'Gujarat', lat: 24.2584, lon: 72.1797 },
  { city: 'Modasa', state: 'Gujarat', lat: 23.4639, lon: 73.3037 },

  // ── Maharashtra ──
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { city: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },
  { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { city: 'Chhatrapati Sambhajinagar (Aurangabad)', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { city: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
  { city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lon: 73.0297 },
  { city: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
  { city: 'Amravati', state: 'Maharashtra', lat: 20.9320, lon: 77.7523 },
  { city: 'Nanded', state: 'Maharashtra', lat: 19.1383, lon: 77.3210 },
  { city: 'Sangli', state: 'Maharashtra', lat: 16.8524, lon: 74.5815 },
  { city: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lon: 75.5626 },
  { city: 'Akola', state: 'Maharashtra', lat: 20.7002, lon: 77.0082 },
  { city: 'Latur', state: 'Maharashtra', lat: 18.4088, lon: 76.5604 },
  { city: 'Dhule', state: 'Maharashtra', lat: 20.9042, lon: 74.7749 },
  { city: 'Ahmednagar', state: 'Maharashtra', lat: 19.0948, lon: 74.7480 },
  { city: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lon: 79.2961 },
  { city: 'Parbhani', state: 'Maharashtra', lat: 19.2686, lon: 76.7708 },
  { city: 'Jalna', state: 'Maharashtra', lat: 19.8410, lon: 75.8864 },
  { city: 'Panvel', state: 'Maharashtra', lat: 18.9894, lon: 73.1175 },
  { city: 'Satara', state: 'Maharashtra', lat: 17.6805, lon: 73.9935 },
  { city: 'Ratnagiri', state: 'Maharashtra', lat: 16.9902, lon: 73.3120 },
  { city: 'Kalyan-Dombivli', state: 'Maharashtra', lat: 19.2403, lon: 73.1305 },
  { city: 'Vasai-Virar', state: 'Maharashtra', lat: 19.3919, lon: 72.8397 },
  { city: 'Mira-Bhayandar', state: 'Maharashtra', lat: 19.2812, lon: 72.8561 },
  { city: 'Wardha', state: 'Maharashtra', lat: 20.7453, lon: 78.6022 },
  { city: 'Yavatmal', state: 'Maharashtra', lat: 20.3888, lon: 78.1204 },
  { city: 'Beed', state: 'Maharashtra', lat: 18.9891, lon: 75.7601 },
  { city: 'Gondia', state: 'Maharashtra', lat: 21.4598, lon: 80.1961 },
  { city: 'Alibag', state: 'Maharashtra', lat: 18.6414, lon: 72.8722 },
  { city: 'Shirdi', state: 'Maharashtra', lat: 19.7645, lon: 74.4762 },

  // ── Delhi (NCT) ──
  { city: 'New Delhi', state: 'Delhi (NCT)', lat: 28.6139, lon: 77.2090 },
  { city: 'Central Delhi', state: 'Delhi (NCT)', lat: 28.6507, lon: 77.2334 },
  { city: 'South Delhi', state: 'Delhi (NCT)', lat: 28.5355, lon: 77.1990 },
  { city: 'North Delhi', state: 'Delhi (NCT)', lat: 28.7180, lon: 77.1680 },
  { city: 'East Delhi', state: 'Delhi (NCT)', lat: 28.6277, lon: 77.2785 },
  { city: 'West Delhi', state: 'Delhi (NCT)', lat: 28.6369, lon: 77.0878 },
  { city: 'Dwarka', state: 'Delhi (NCT)', lat: 28.5921, lon: 77.0460 },
  { city: 'Rohini', state: 'Delhi (NCT)', lat: 28.7159, lon: 77.1171 },
  { city: 'Connaught Place', state: 'Delhi (NCT)', lat: 28.6315, lon: 77.2167 },
  { city: 'Saket', state: 'Delhi (NCT)', lat: 28.5244, lon: 77.2167 },
  { city: 'Karol Bagh', state: 'Delhi (NCT)', lat: 28.6517, lon: 77.1906 },
  { city: 'Lajpat Nagar', state: 'Delhi (NCT)', lat: 28.5700, lon: 77.2400 },

  // ── Karnataka ──
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { city: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { city: 'Hubballi-Dharwad', state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  { city: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { city: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { city: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lon: 76.8343 },
  { city: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218 },
  { city: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { city: 'Vijayapura', state: 'Karnataka', lat: 16.8302, lon: 75.7100 },
  { city: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681 },
  { city: 'Tumakuru', state: 'Karnataka', lat: 13.3409, lon: 77.1010 },
  { city: 'Udupi', state: 'Karnataka', lat: 13.3409, lon: 74.7421 },
  { city: 'Hassan', state: 'Karnataka', lat: 13.0072, lon: 76.0962 },
  { city: 'Bidar', state: 'Karnataka', lat: 17.9104, lon: 77.5199 },
  { city: 'Raichur', state: 'Karnataka', lat: 16.2120, lon: 77.3439 },
  { city: 'Chikkamagaluru', state: 'Karnataka', lat: 13.3161, lon: 75.7720 },
  { city: 'Madikeri (Coorg)', state: 'Karnataka', lat: 12.4244, lon: 75.7382 },

  // ── Tamil Nadu ──
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { city: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { city: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
  { city: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411 },
  { city: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325 },
  { city: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  { city: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lon: 78.1348 },
  { city: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  { city: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lon: 76.6950 },
  { city: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036 },
  { city: 'Hosur', state: 'Tamil Nadu', lat: 12.7409, lon: 77.8253 },
  { city: 'Dindigul', state: 'Tamil Nadu', lat: 10.3673, lon: 77.9803 },
  { city: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7480, lon: 79.7714 },
  { city: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lon: 77.5385 },
  { city: 'Nagercoil', state: 'Tamil Nadu', lat: 8.1833, lon: 77.4119 },
  { city: 'Kumbakonam', state: 'Tamil Nadu', lat: 10.9602, lon: 79.3845 },
  { city: 'Rameswaram', state: 'Tamil Nadu', lat: 9.2876, lon: 79.3129 },

  // ── Uttar Pradesh ──
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { city: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { city: 'Greater Noida', state: 'Uttar Pradesh', lat: 28.4744, lon: 77.5040 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  { city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064 },
  { city: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lon: 79.4304 },
  { city: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880 },
  { city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lon: 78.7733 },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732 },
  { city: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lon: 78.5685 },
  { city: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737 },
  { city: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lon: 82.1998 },
  { city: 'Saharanpur', state: 'Uttar Pradesh', lat: 29.9671, lon: 77.5452 },
  { city: 'Firozabad', state: 'Uttar Pradesh', lat: 27.1591, lon: 78.3957 },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh', lat: 29.4727, lon: 77.7085 },
  { city: 'Shahjahanpur', state: 'Uttar Pradesh', lat: 27.8805, lon: 79.9122 },
  { city: 'Rampur', state: 'Uttar Pradesh', lat: 28.8154, lon: 79.0250 },
  { city: 'Mirzapur', state: 'Uttar Pradesh', lat: 25.1337, lon: 82.5644 },
  { city: 'Raebareli', state: 'Uttar Pradesh', lat: 26.2303, lon: 81.2409 },

  // ── Rajasthan ──
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { city: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
  { city: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119 },
  { city: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lon: 74.6399 },
  { city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
  { city: 'Bhilwara', state: 'Rajasthan', lat: 25.3407, lon: 74.6313 },
  { city: 'Alwar', state: 'Rajasthan', lat: 27.5530, lon: 76.6346 },
  { city: 'Bharatpur', state: 'Rajasthan', lat: 27.2152, lon: 77.5030 },
  { city: 'Sikar', state: 'Rajasthan', lat: 27.6094, lon: 75.1398 },
  { city: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lon: 70.9083 },
  { city: 'Mount Abu', state: 'Rajasthan', lat: 24.5926, lon: 72.7156 },
  { city: 'Pali', state: 'Rajasthan', lat: 25.7713, lon: 73.3237 },
  { city: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9038, lon: 73.8772 },
  { city: 'Hanumangarh', state: 'Rajasthan', lat: 29.5816, lon: 74.3294 },
  { city: 'Tonk', state: 'Rajasthan', lat: 26.1627, lon: 75.7895 },
  { city: 'Chittorgarh', state: 'Rajasthan', lat: 24.8887, lon: 74.6269 },
  { city: 'Barmer', state: 'Rajasthan', lat: 25.7521, lon: 71.3967 },
  { city: 'Nagaur', state: 'Rajasthan', lat: 27.2021, lon: 73.7439 },

  // ── West Bengal ──
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { city: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636 },
  { city: 'Durgapur', state: 'West Bengal', lat: 23.5204, lon: 87.3119 },
  { city: 'Asansol', state: 'West Bengal', lat: 23.6739, lon: 86.9524 },
  { city: 'Siliguri', state: 'West Bengal', lat: 26.7271, lon: 88.3953 },
  { city: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lon: 88.2663 },
  { city: 'Kharagpur', state: 'West Bengal', lat: 22.3460, lon: 87.2320 },
  { city: 'Haldia', state: 'West Bengal', lat: 22.0620, lon: 88.0820 },
  { city: 'Bardhaman', state: 'West Bengal', lat: 23.2324, lon: 87.8615 },
  { city: 'Malda', state: 'West Bengal', lat: 25.0108, lon: 88.1411 },
  { city: 'Baharampur', state: 'West Bengal', lat: 24.0988, lon: 88.2685 },
  { city: 'Kalimpong', state: 'West Bengal', lat: 27.0594, lon: 88.4695 },
  { city: 'Digha', state: 'West Bengal', lat: 21.6266, lon: 87.5074 },

  // ── Madhya Pradesh ──
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  { city: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885 },
  { city: 'Sagar', state: 'Madhya Pradesh', lat: 23.8388, lon: 78.7378 },
  { city: 'Dewas', state: 'Madhya Pradesh', lat: 22.9676, lon: 76.0534 },
  { city: 'Satna', state: 'Madhya Pradesh', lat: 24.5802, lon: 80.8322 },
  { city: 'Ratlam', state: 'Madhya Pradesh', lat: 23.3315, lon: 75.0367 },
  { city: 'Rewa', state: 'Madhya Pradesh', lat: 24.5373, lon: 81.3042 },
  { city: 'Singrauli', state: 'Madhya Pradesh', lat: 24.1998, lon: 82.6645 },
  { city: 'Burhanpur', state: 'Madhya Pradesh', lat: 21.3109, lon: 76.2299 },
  { city: 'Khandwa', state: 'Madhya Pradesh', lat: 21.8314, lon: 76.3498 },
  { city: 'Morena', state: 'Madhya Pradesh', lat: 26.4947, lon: 77.9940 },
  { city: 'Bhind', state: 'Madhya Pradesh', lat: 26.5652, lon: 78.7889 },
  { city: 'Chhindwara', state: 'Madhya Pradesh', lat: 22.0574, lon: 78.9382 },
  { city: 'Guna', state: 'Madhya Pradesh', lat: 24.6467, lon: 77.3117 },
  { city: 'Shivpuri', state: 'Madhya Pradesh', lat: 25.4320, lon: 77.6625 },
  { city: 'Vidisha', state: 'Madhya Pradesh', lat: 23.5251, lon: 77.8081 },
  { city: 'Damoh', state: 'Madhya Pradesh', lat: 23.8323, lon: 79.4422 },
  { city: 'Mandsaur', state: 'Madhya Pradesh', lat: 24.0722, lon: 75.0688 },
  { city: 'Neemuch', state: 'Madhya Pradesh', lat: 24.4754, lon: 74.8711 },

  // ── Telangana ──
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { city: 'Secunderabad', state: 'Telangana', lat: 17.4399, lon: 78.4983 },
  { city: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  { city: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  { city: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
  { city: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514 },
  { city: 'Ramagundam', state: 'Telangana', lat: 18.7551, lon: 79.5134 },
  { city: 'Mahbubnagar', state: 'Telangana', lat: 16.7488, lon: 77.9856 },
  { city: 'Nalgonda', state: 'Telangana', lat: 17.0544, lon: 79.2684 },
  { city: 'Adilabad', state: 'Telangana', lat: 19.6641, lon: 78.5320 },
  { city: 'Siddipet', state: 'Telangana', lat: 18.1018, lon: 78.8520 },

  // ── Andhra Pradesh ──
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { city: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
  { city: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { city: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lon: 82.2475 },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040 },
  { city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { city: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lon: 78.8242 },
  { city: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  { city: 'Eluru', state: 'Andhra Pradesh', lat: 16.7107, lon: 81.0952 },
  { city: 'Ongole', state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499 },
  { city: 'Vizianagaram', state: 'Andhra Pradesh', lat: 18.1133, lon: 83.3956 },
  { city: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.1875, lon: 81.1389 },
  { city: 'Srikakulam', state: 'Andhra Pradesh', lat: 18.2949, lon: 83.8938 },

  // ── Kerala ──
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
  { city: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804 },
  { city: 'Kollam', state: 'Kerala', lat: 8.8932, lon: 76.6141 },
  { city: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144 },
  { city: 'Kannur', state: 'Kerala', lat: 11.8745, lon: 75.3704 },
  { city: 'Alappuzha', state: 'Kerala', lat: 9.4981, lon: 76.3388 },
  { city: 'Palakkad', state: 'Kerala', lat: 10.7867, lon: 76.6548 },
  { city: 'Munnar', state: 'Kerala', lat: 10.0889, lon: 77.0595 },
  { city: 'Kottayam', state: 'Kerala', lat: 9.5916, lon: 76.5222 },
  { city: 'Malappuram', state: 'Kerala', lat: 11.0732, lon: 76.0740 },
  { city: 'Kasaragod', state: 'Kerala', lat: 12.5102, lon: 74.9852 },
  { city: 'Wayanad (Kalpetta)', state: 'Kerala', lat: 11.6103, lon: 76.0827 },

  // ── Punjab ──
  { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { city: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
  { city: 'Jalandhar', state: 'Punjab', lat: 31.3260, lon: 75.5762 },
  { city: 'Patiala', state: 'Punjab', lat: 30.3398, lon: 76.3869 },
  { city: 'Bathinda', state: 'Punjab', lat: 30.2110, lon: 74.9455 },
  { city: 'Mohali (SAS Nagar)', state: 'Punjab', lat: 30.7046, lon: 76.7179 },
  { city: 'Pathankot', state: 'Punjab', lat: 32.2689, lon: 75.6499 },
  { city: 'Hoshiarpur', state: 'Punjab', lat: 31.5273, lon: 75.9149 },
  { city: 'Moga', state: 'Punjab', lat: 30.8165, lon: 75.1717 },
  { city: 'Batala', state: 'Punjab', lat: 31.8186, lon: 75.2028 },
  { city: 'Abohar', state: 'Punjab', lat: 30.1445, lon: 74.1955 },

  // ── Haryana ──
  { city: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
  { city: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178 },
  { city: 'Panipat', state: 'Haryana', lat: 29.3909, lon: 76.9635 },
  { city: 'Ambala', state: 'Haryana', lat: 30.3782, lon: 76.7767 },
  { city: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
  { city: 'Rohtak', state: 'Haryana', lat: 28.8955, lon: 76.6066 },
  { city: 'Hisar', state: 'Haryana', lat: 29.1492, lon: 75.7217 },
  { city: 'Panchkula', state: 'Haryana', lat: 30.6942, lon: 76.8606 },
  { city: 'Sonipat', state: 'Haryana', lat: 28.9931, lon: 77.0151 },
  { city: 'Yamunanagar', state: 'Haryana', lat: 30.1290, lon: 77.2674 },
  { city: 'Bhiwani', state: 'Haryana', lat: 28.7932, lon: 76.1390 },
  { city: 'Sirsa', state: 'Haryana', lat: 29.5349, lon: 75.0287 },
  { city: 'Bahadurgarh', state: 'Haryana', lat: 28.6924, lon: 76.9240 },
  { city: 'Rewari', state: 'Haryana', lat: 28.1837, lon: 76.6186 },
  { city: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lon: 76.8783 },

  // ── Bihar ──
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { city: 'Gaya', state: 'Bihar', lat: 24.7914, lon: 85.0002 },
  { city: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lon: 86.9842 },
  { city: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647 },
  { city: 'Purnia', state: 'Bihar', lat: 25.7771, lon: 87.4753 },
  { city: 'Darbhanga', state: 'Bihar', lat: 26.1542, lon: 85.8918 },
  { city: 'Bihar Sharif', state: 'Bihar', lat: 25.1982, lon: 85.5149 },
  { city: 'Arrah', state: 'Bihar', lat: 25.5541, lon: 84.6637 },
  { city: 'Begusarai', state: 'Bihar', lat: 25.4182, lon: 86.1272 },
  { city: 'Katihar', state: 'Bihar', lat: 25.5541, lon: 87.5722 },
  { city: 'Munger', state: 'Bihar', lat: 25.3757, lon: 86.4744 },
  { city: 'Chhapra', state: 'Bihar', lat: 25.7848, lon: 84.7274 },
  { city: 'Motihari', state: 'Bihar', lat: 26.6469, lon: 84.9089 },
  { city: 'Sasaram', state: 'Bihar', lat: 24.9536, lon: 84.0317 },
  { city: 'Dehri', state: 'Bihar', lat: 24.9079, lon: 84.1837 },
  { city: 'Bettiah', state: 'Bihar', lat: 26.8024, lon: 84.5028 },
  { city: 'Siwan', state: 'Bihar', lat: 26.2196, lon: 84.3567 },
  { city: 'Samastipur', state: 'Bihar', lat: 25.8630, lon: 85.7810 },
  { city: 'Piro', state: 'Bihar', lat: 25.3300, lon: 84.4100 },

  // ── Odisha ──
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
  { city: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8828 },
  { city: 'Rourkela', state: 'Odisha', lat: 22.2604, lon: 84.8536 },
  { city: 'Berhampur', state: 'Odisha', lat: 19.3150, lon: 84.7941 },
  { city: 'Sambalpur', state: 'Odisha', lat: 21.4669, lon: 83.9812 },
  { city: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312 },
  { city: 'Balasore', state: 'Odisha', lat: 21.4934, lon: 86.9135 },
  { city: 'Bhadrak', state: 'Odisha', lat: 21.0574, lon: 86.4957 },
  { city: 'Baripada', state: 'Odisha', lat: 21.9347, lon: 86.7237 },
  { city: 'Jharsuguda', state: 'Odisha', lat: 21.8554, lon: 84.0062 },

  // ── Assam ──
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  { city: 'Silchar', state: 'Assam', lat: 24.8333, lon: 92.7789 },
  { city: 'Dibrugarh', state: 'Assam', lat: 27.4728, lon: 94.9120 },
  { city: 'Jorhat', state: 'Assam', lat: 26.7509, lon: 94.2037 },
  { city: 'Nagaon', state: 'Assam', lat: 26.3463, lon: 92.6840 },
  { city: 'Tezpur', state: 'Assam', lat: 26.6528, lon: 92.7926 },
  { city: 'Tinsukia', state: 'Assam', lat: 27.4922, lon: 95.3468 },
  { city: 'Bongaigaon', state: 'Assam', lat: 26.5020, lon: 90.5434 },

  // ── Jharkhand ──
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { city: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lon: 86.2029 },
  { city: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304 },
  { city: 'Bokaro Steel City', state: 'Jharkhand', lat: 23.6693, lon: 86.1511 },
  { city: 'Deoghar', state: 'Jharkhand', lat: 24.4826, lon: 86.7001 },
  { city: 'Hazaribagh', state: 'Jharkhand', lat: 23.9966, lon: 85.3686 },
  { city: 'Giridih', state: 'Jharkhand', lat: 24.1868, lon: 86.3045 },
  { city: 'Ramgarh', state: 'Jharkhand', lat: 23.6332, lon: 85.5149 },
  { city: 'Dumka', state: 'Jharkhand', lat: 24.2690, lon: 87.2483 },

  // ── Chhattisgarh ──
  { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { city: 'Bhilai', state: 'Chhattisgarh', lat: 21.2167, lon: 81.4333 },
  { city: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0797, lon: 82.1409 },
  { city: 'Korba', state: 'Chhattisgarh', lat: 22.3595, lon: 82.7501 },
  { city: 'Jagdalpur', state: 'Chhattisgarh', lat: 19.0734, lon: 82.0163 },
  { city: 'Durg', state: 'Chhattisgarh', lat: 21.1904, lon: 81.2849 },
  { city: 'Rajnandgaon', state: 'Chhattisgarh', lat: 21.0974, lon: 81.0380 },
  { city: 'Raigarh', state: 'Chhattisgarh', lat: 21.8974, lon: 83.3950 },
  { city: 'Ambikapur', state: 'Chhattisgarh', lat: 23.1186, lon: 83.1950 },

  // ── Uttarakhand ──
  { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
  { city: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642 },
  { city: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676 },
  { city: 'Haldwani', state: 'Uttarakhand', lat: 29.2183, lon: 79.5130 },
  { city: 'Roorkee', state: 'Uttarakhand', lat: 29.8543, lon: 77.8880 },
  { city: 'Nainital', state: 'Uttarakhand', lat: 29.3919, lon: 79.4542 },
  { city: 'Rudrapur', state: 'Uttarakhand', lat: 28.9800, lon: 79.4000 },
  { city: 'Kashipur', state: 'Uttarakhand', lat: 29.2104, lon: 78.9619 },
  { city: 'Mussoorie', state: 'Uttarakhand', lat: 30.4598, lon: 78.0644 },

  // ── Himachal Pradesh ──
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { city: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.2190, lon: 76.3234 },
  { city: 'Solan', state: 'Himachal Pradesh', lat: 30.9045, lon: 77.0967 },
  { city: 'Mandi', state: 'Himachal Pradesh', lat: 31.5892, lon: 76.9182 },
  { city: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lon: 77.1892 },
  { city: 'Kullu', state: 'Himachal Pradesh', lat: 31.9579, lon: 77.1095 },
  { city: 'Baddi', state: 'Himachal Pradesh', lat: 30.9578, lon: 76.7914 },
  { city: 'Bilaspur (HP)', state: 'Himachal Pradesh', lat: 31.3418, lon: 76.7578 },
  { city: 'Una', state: 'Himachal Pradesh', lat: 31.4685, lon: 76.2708 },

  // ── Jammu and Kashmir ──
  { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lon: 74.7973 },
  { city: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lon: 74.8570 },
  { city: 'Anantnag', state: 'Jammu and Kashmir', lat: 33.7311, lon: 75.1522 },
  { city: 'Baramulla', state: 'Jammu and Kashmir', lat: 34.2000, lon: 74.3436 },
  { city: 'Gulmarg', state: 'Jammu and Kashmir', lat: 34.0484, lon: 74.3805 },
  { city: 'Udhampur', state: 'Jammu and Kashmir', lat: 32.9255, lon: 75.1416 },
  { city: 'Kathua', state: 'Jammu and Kashmir', lat: 32.3700, lon: 75.5200 },
  { city: 'Pahalgam', state: 'Jammu and Kashmir', lat: 34.0167, lon: 75.3167 },

  // ── Goa ──
  { city: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278 },
  { city: 'Margao', state: 'Goa', lat: 15.2832, lon: 73.9862 },
  { city: 'Vasco da Gama', state: 'Goa', lat: 15.3959, lon: 73.8153 },
  { city: 'Mapusa', state: 'Goa', lat: 15.5937, lon: 73.8144 },
  { city: 'Ponda', state: 'Goa', lat: 15.4026, lon: 74.0152 },
  { city: 'Calangute', state: 'Goa', lat: 15.5439, lon: 73.7553 },

  // ── Chandigarh ──
  { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794 },

  // ── Puducherry ──
  { city: 'Puducherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083 },
  { city: 'Karaikal', state: 'Puducherry', lat: 10.9254, lon: 79.8380 },
  { city: 'Yanam', state: 'Puducherry', lat: 16.7328, lon: 82.2178 },
  { city: 'Mahe', state: 'Puducherry', lat: 11.7003, lon: 75.5340 },

  // ── Tripura ──
  { city: 'Agartala', state: 'Tripura', lat: 23.8315, lon: 91.2868 },
  { city: 'Dharmanagar', state: 'Tripura', lat: 24.3725, lon: 92.1645 },
  { city: 'Udaipur (Tripura)', state: 'Tripura', lat: 23.5333, lon: 91.4833 },

  // ── Manipur ──
  { city: 'Imphal', state: 'Manipur', lat: 24.8170, lon: 93.9368 },
  { city: 'Churachandpur', state: 'Manipur', lat: 24.3333, lon: 93.6833 },
  { city: 'Thoubal', state: 'Manipur', lat: 24.6333, lon: 94.0000 },

  // ── Meghalaya ──
  { city: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933 },
  { city: 'Cherrapunji', state: 'Meghalaya', lat: 25.2986, lon: 91.7330 },
  { city: 'Tura', state: 'Meghalaya', lat: 25.5138, lon: 90.2045 },
  { city: 'Jowai', state: 'Meghalaya', lat: 25.4500, lon: 92.2000 },

  // ── Nagaland ──
  { city: 'Kohima', state: 'Nagaland', lat: 25.6751, lon: 94.1086 },
  { city: 'Dimapur', state: 'Nagaland', lat: 25.9090, lon: 93.7265 },
  { city: 'Mokokchung', state: 'Nagaland', lat: 26.3256, lon: 94.5294 },

  // ── Arunachal Pradesh ──
  { city: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053 },
  { city: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5861, lon: 91.8594 },
  { city: 'Naharlagun', state: 'Arunachal Pradesh', lat: 27.1064, lon: 93.6934 },
  { city: 'Pasighat', state: 'Arunachal Pradesh', lat: 28.0667, lon: 95.3333 },

  // ── Mizoram ──
  { city: 'Aizawl', state: 'Mizoram', lat: 23.7271, lon: 92.7176 },
  { city: 'Lunglei', state: 'Mizoram', lat: 22.8833, lon: 92.7333 },
  { city: 'Champhai', state: 'Mizoram', lat: 23.4667, lon: 93.3167 },

  // ── Sikkim ──
  { city: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065 },
  { city: 'Namchi', state: 'Sikkim', lat: 27.1667, lon: 88.3500 },
  { city: 'Pelling', state: 'Sikkim', lat: 27.3000, lon: 88.2333 },

  // ── Ladakh ──
  { city: 'Leh', state: 'Ladakh', lat: 34.1526, lon: 77.5771 },
  { city: 'Kargil', state: 'Ladakh', lat: 34.5539, lon: 76.1349 },

  // ── Andaman and Nicobar Islands ──
  { city: 'Port Blair', state: 'Andaman and Nicobar Islands', lat: 11.6234, lon: 92.7265 },
  { city: 'Havelock Island (Swaraj Dweep)', state: 'Andaman and Nicobar Islands', lat: 11.9761, lon: 92.9876 },

  // ── Dadra and Nagar Haveli and Daman and Diu ──
  { city: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.3974, lon: 72.8328 },
  { city: 'Silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.2763, lon: 73.0083 },
  { city: 'Diu', state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.7144, lon: 70.9874 },

  // ── Lakshadweep ──
  { city: 'Kavaratti', state: 'Lakshadweep', lat: 10.5593, lon: 72.6358 },
  { city: 'Agatti', state: 'Lakshadweep', lat: 10.8533, lon: 72.1931 },
];

/**
 * Finds matching state and coordinates for any city name (case-insensitive fuzzy match).
 */
export function findCityData(cityName: string): CityData | undefined {
  if (!cityName || !cityName.trim()) return undefined;
  const clean = cityName.trim().toLowerCase();

  // 1. Direct match
  const exact = ALL_INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Starts with / includes match
  const partial = ALL_INDIAN_CITIES.find(
    (c) =>
      clean.includes(c.city.toLowerCase()) ||
      c.city.toLowerCase().includes(clean)
  );
  return partial;
}

/**
 * Returns list of cities belonging to a specific state/UT.
 */
export function getCitiesByState(stateName: string): CityData[] {
  if (!stateName || !stateName.trim()) return ALL_INDIAN_CITIES;
  return ALL_INDIAN_CITIES.filter(
    (c) => c.state.toLowerCase() === stateName.trim().toLowerCase()
  );
}
