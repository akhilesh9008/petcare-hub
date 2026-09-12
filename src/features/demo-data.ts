export type Role = "PET_OWNER" | "VETERINARIAN" | "SERVICE_PROVIDER" | "ADMIN";
export type Species = "Dog" | "Cat" | "Bird" | "Rabbit" | "Other";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type OrderStatus = "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  birthDate: string;
  gender: "Male" | "Female";
  weight: number;
  color: string;
  image: string;
  microchipId?: string;
  allergies: string[];
  conditions: string[];
  dietaryPreferences: string[];
  activityLevel: "Low" | "Moderate" | "High";
  vaccinationStatus: "Up to date" | "Due soon" | "Overdue";
}

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  type: "Consultation" | "Vaccination" | "Medication" | "Lab report" | "Note";
  veterinarian: string;
  clinic: string;
  reason: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  followUp?: string;
  attachments?: string[];
}

export interface Vaccination { id: string; petId: string; name: string; administered: string; nextDue: string; veterinarian: string; notes: string; }
export interface Medication { id: string; petId: string; name: string; dosage: string; frequency: string; startDate: string; endDate: string; instructions: string; veterinarian: string; }
export interface WeightRecord { id: string; petId: string; date: string; weight: number; }
export interface Reminder { id: string; petId: string; title: string; description: string; date: string; time: string; type: "Vaccination" | "Medication" | "Appointment" | "Grooming" | "Food refill" | "Deworming" | "Custom"; recurring: boolean; status: "PENDING" | "DONE" | "OVERDUE"; }
export interface Vet { id: string; name: string; specialization: string; clinic: string; location: string; rating: number; reviews: number; experience: number; fee: number; image: string; bio: string; languages: string[]; slots: string[]; }
export interface Appointment { id: string; petId: string; vetId: string; date: string; time: string; type: "In-person" | "Online"; reason: string; notes: string; status: AppointmentStatus; consultationNotes?: string; }
export interface Product { id: string; name: string; brand: string; category: string; price: number; originalPrice?: number; rating: number; reviews: number; species: Species[]; age: string; image: string; stock: number; tags: string[]; description: string; reason?: string; }
export interface CartItem { productId: string; quantity: number; }
export interface Order { id: string; number: string; date: string; items: CartItem[]; total: number; status: OrderStatus; address: string; petId?: string; }
export interface ServiceProvider { id: string; name: string; businessName: string; category: string; location: string; rating: number; reviews: number; price: number; image: string; description: string; availability: string[]; }
export interface ServiceBooking { id: string; petId: string; providerId: string; date: string; time: string; notes: string; status: AppointmentStatus; }
export interface ChatMessage { id: string; role: "user" | "assistant"; text: string; timestamp: string; }

// Wearable data is deliberately presented as wellbeing context, never as a diagnosis.
export type BandConnectionStatus = "CONNECTED" | "SYNCING" | "DISCONNECTED";
export type HabitKind = "WALK" | "MEAL" | "WATER" | "PLAY" | "REST" | "POTTY" | "MEDICATION";
export type HabitSource = "BAND" | "MANUAL";

export interface HealthBand {
  id: string;
  petId: string;
  name: string;
  model: string;
  serialNumber: string;
  status: BandConnectionStatus;
  battery: number;
  lastSynced?: string;
  pairedAt?: string;
  /** Historical demo data is distinct from a browser-authorized BLE session. */
  connectionType?: "DEMO" | "BLUETOOTH_LE";
  /** Browser-scoped Bluetooth ID; it is not a physical device serial number. */
  bluetoothDeviceId?: string;
  supportsBattery?: boolean;
  supportsHeartRate?: boolean;
  liveHeartRate?: number;
  lastLiveReading?: string;
}

export interface BandDailyMetric {
  id: string;
  petId: string;
  date: string;
  activeMinutes: number;
  restMinutes: number;
  steps: number;
  distanceKm: number;
  sleepMinutes: number;
  sleepQuality: number;
  averageRestingPulse?: number;
  temperatureTrend: "Baseline" | "Slightly above baseline" | "Slightly below baseline" | "Unavailable";
}

export interface PetHabit {
  id: string;
  petId: string;
  kind: HabitKind;
  label: string;
  timestamp: string;
  durationMinutes?: number;
  source: HabitSource;
}

/** A consented location sample from the phone currently accompanying the pet. */
export interface PetLocationPoint {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedMps?: number;
  heading?: number;
  timestamp: string;
  source: "PHONE_GPS";
}

export interface BandAlert {
  id: string;
  petId: string;
  priority: "INFO" | "ATTENTION";
  title: string;
  description: string;
  createdAt: string;
  status: "OPEN" | "READ";
}

export const demoUser = {
  id: "owner-akhilesh",
  name: "Akhilesh Sharma",
  email: "akhilesh@petcare.demo",
  phone: "+91 98765 43210",
  role: "PET_OWNER" as Role,
  city: "Pune",
};

export const initialPets: Pet[] = [
  { id: "bruno", name: "Bruno", species: "Dog", breed: "Golden Retriever", birthDate: "2021-06-14", gender: "Male", weight: 28.4, color: "Golden", image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85", microchipId: "IN-PN-490271", allergies: ["Chicken"], conditions: [], dietaryPreferences: ["Grain-free", "Chicken-free"], activityLevel: "High", vaccinationStatus: "Due soon" },
  { id: "miso", name: "Miso", species: "Cat", breed: "Indie Cat", birthDate: "2023-02-08", gender: "Female", weight: 4.6, color: "Tortoiseshell", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85", allergies: [], conditions: [], dietaryPreferences: ["Indoor cat"], activityLevel: "Moderate", vaccinationStatus: "Up to date" },
];

export const initialRecords: HealthRecord[] = [
  { id: "record-1", petId: "bruno", date: "2026-08-12", type: "Consultation", veterinarian: "Dr. Anaya Mehta", clinic: "Paws & Care Clinic", reason: "Annual wellness examination", symptoms: "None reported", diagnosis: "Healthy adult dog; body condition appropriate.", treatment: "Continue balanced diet and regular exercise.", followUp: "2026-09-15" },
  { id: "record-2", petId: "bruno", date: "2026-05-15", type: "Vaccination", veterinarian: "Dr. Anaya Mehta", clinic: "Paws & Care Clinic", reason: "DHPP booster", symptoms: "None", diagnosis: "Vaccination completed", treatment: "Observed for 20 minutes; no reaction." },
  { id: "record-3", petId: "miso", date: "2026-07-21", type: "Consultation", veterinarian: "Dr. Rohan Iyer", clinic: "Little Whiskers Veterinary", reason: "Routine check-up", symptoms: "Occasional hairball", diagnosis: "Normal examination", treatment: "Increase hydration; consider hairball-friendly food." },
];

export const initialVaccinations: Vaccination[] = [
  { id: "vac-1", petId: "bruno", name: "Rabies", administered: "2025-09-15", nextDue: "2026-09-15", veterinarian: "Dr. Anaya Mehta", notes: "Annual booster due soon." },
  { id: "vac-2", petId: "bruno", name: "DHPP", administered: "2026-05-15", nextDue: "2027-05-15", veterinarian: "Dr. Anaya Mehta", notes: "Completed" },
  { id: "vac-3", petId: "miso", name: "FVRCP", administered: "2026-02-10", nextDue: "2027-02-10", veterinarian: "Dr. Rohan Iyer", notes: "Completed" },
  { id: "vac-4", petId: "miso", name: "Rabies", administered: "2026-02-10", nextDue: "2027-02-10", veterinarian: "Dr. Rohan Iyer", notes: "Completed" },
];

export const initialMedications: Medication[] = [
  { id: "med-1", petId: "miso", name: "Omega-3 supplement", dosage: "1 capsule", frequency: "Once daily", startDate: "2026-08-18", endDate: "2026-09-01", instructions: "Mix with evening meal.", veterinarian: "Dr. Rohan Iyer" },
];

export const initialWeights: WeightRecord[] = [
  { id: "weight-1", petId: "bruno", date: "2026-01-10", weight: 27.6 },
  { id: "weight-2", petId: "bruno", date: "2026-03-14", weight: 28.0 },
  { id: "weight-3", petId: "bruno", date: "2026-05-15", weight: 28.2 },
  { id: "weight-4", petId: "bruno", date: "2026-08-12", weight: 28.4 },
  { id: "weight-5", petId: "miso", date: "2026-02-10", weight: 4.4 },
  { id: "weight-6", petId: "miso", date: "2026-07-21", weight: 4.6 },
];

export const initialReminders: Reminder[] = [
  { id: "rem-1", petId: "bruno", title: "Rabies vaccination", description: "Annual rabies booster is due. Book a visit with your veterinarian.", date: "2026-09-15", time: "10:00", type: "Vaccination", recurring: true, status: "PENDING" },
  { id: "rem-2", petId: "miso", title: "Omega-3 supplement", description: "Give with Miso's evening meal.", date: "2026-08-25", time: "19:30", type: "Medication", recurring: true, status: "PENDING" },
  { id: "rem-3", petId: "bruno", title: "Grooming day", description: "Coat brushing and nail check.", date: "2026-08-28", time: "09:00", type: "Grooming", recurring: true, status: "PENDING" },
  { id: "rem-4", petId: "bruno", title: "Food refill", description: "Order Bruno's grain-free kibble.", date: "2026-08-30", time: "18:00", type: "Food refill", recurring: true, status: "PENDING" },
];

export const initialVets: Vet[] = [
  { id: "vet-anaya", name: "Dr. Anaya Mehta", specialization: "Small Animal Medicine", clinic: "Paws & Care Clinic", location: "Koregaon Park, Pune", rating: 4.9, reviews: 184, experience: 12, fee: 850, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85", bio: "A compassionate companion-animal clinician focused on preventative care and clear, collaborative guidance for pet families.", languages: ["English", "Hindi", "Marathi"], slots: ["09:30", "11:00", "16:30", "18:00"] },
  { id: "vet-rohan", name: "Dr. Rohan Iyer", specialization: "Feline Medicine", clinic: "Little Whiskers Veterinary", location: "Baner, Pune", rating: 4.8, reviews: 126, experience: 9, fee: 750, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=85", bio: "A feline-focused veterinarian who takes a low-stress, evidence-informed approach to care.", languages: ["English", "Hindi", "Tamil"], slots: ["10:00", "12:30", "15:00", "17:30"] },
  { id: "vet-kavya", name: "Dr. Kavya Nair", specialization: "Dermatology", clinic: "Companion Health Studio", location: "Viman Nagar, Pune", rating: 4.7, reviews: 93, experience: 11, fee: 950, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=85", bio: "Supports pets with skin and coat concerns while helping owners understand everyday care routines.", languages: ["English", "Hindi", "Malayalam"], slots: ["09:00", "13:00", "16:00"] },
  { id: "vet-isha", name: "Dr. Isha Kapoor", specialization: "General Practice", clinic: "Happy Tails Hospital", location: "Kalyani Nagar, Pune", rating: 4.7, reviews: 161, experience: 7, fee: 700, image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=700&q=85", bio: "General practitioner providing family-centred consultations, vaccinations and wellness support.", languages: ["English", "Hindi", "Punjabi"], slots: ["08:30", "10:30", "14:30", "19:00"] },
  { id: "vet-vikram", name: "Dr. Vikram Deshmukh", specialization: "Orthopaedics & Mobility", clinic: "Stride Veterinary Centre", location: "Aundh, Pune", rating: 4.8, reviews: 109, experience: 14, fee: 1100, image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=700&q=85", bio: "Helps families understand mobility, recovery and comfortable everyday routines for companion animals.", languages: ["English", "Hindi", "Marathi"], slots: ["09:30", "12:00", "15:30", "18:30"] },
  { id: "vet-zoya", name: "Dr. Zoya Merchant", specialization: "Avian & Exotic Pets", clinic: "Nest & Nuzzle Veterinary", location: "Kothrud, Pune", rating: 4.7, reviews: 76, experience: 10, fee: 1000, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=700&q=85", bio: "Offers calm, practical care for birds, rabbits and other small companion animals.", languages: ["English", "Hindi", "Gujarati"], slots: ["10:00", "12:30", "16:00"] },
  { id: "vet-aditya", name: "Dr. Aditya Kulkarni", specialization: "Preventive Care & Dentistry", clinic: "Kind Canine & Feline Clinic", location: "Wakad, Pune", rating: 4.9, reviews: 142, experience: 8, fee: 800, image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=85", bio: "Focused on preventive visits, dental wellbeing and clear home-care plans for pet families.", languages: ["English", "Hindi", "Marathi"], slots: ["08:00", "11:00", "14:00", "17:00"] },
  { id: "vet-sana", name: "Dr. Sana Farooqui", specialization: "Behaviour & Wellbeing", clinic: "Calm Paws Behaviour Clinic", location: "Magarpatta, Pune", rating: 4.8, reviews: 68, experience: 9, fee: 1200, image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=700&q=85", bio: "Supports humane behaviour plans and home routines in collaboration with each pet's primary veterinarian.", languages: ["English", "Hindi", "Urdu"], slots: ["10:30", "13:30", "17:30"] },
  { id: "vet-aarav", name: "Dr. Aarav Mehta", specialization: "Preventive & Family Pet Care", clinic: "Willow Veterinary Studio", location: "Koregaon Park, Pune", rating: 4.8, reviews: 128, experience: 11, fee: 700, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85", bio: "A fictional demo clinician focused on preventive visits, clear care plans and low-stress family consultations.", languages: ["English", "Hindi", "Marathi"], slots: ["10:00", "11:30", "16:00"] },
];

export const initialAppointments: Appointment[] = [
  { id: "appt-1", petId: "bruno", vetId: "vet-anaya", date: "2026-09-15", time: "10:00", type: "In-person", reason: "Rabies vaccination", notes: "Bruno is comfortable with Dr. Mehta.", status: "CONFIRMED" },
  { id: "appt-2", petId: "miso", vetId: "vet-rohan", date: "2026-08-27", time: "17:30", type: "Online", reason: "Nutrition follow-up", notes: "Discuss hairball prevention routine.", status: "PENDING" },
  { id: "appt-3", petId: "bruno", vetId: "vet-anaya", date: "2026-08-12", time: "11:00", type: "In-person", reason: "Annual wellness examination", notes: "", status: "COMPLETED", consultationNotes: "Healthy adult dog; continue daily activity and current diet." },
  { id: "appt-4", petId: "miso", vetId: "vet-aarav", date: "2026-09-18", time: "10:00", type: "In-person", reason: "Preventive care review", notes: "Review care calendar and indoor routine.", status: "PENDING" },
];

export const initialProducts: Product[] = [
  { id: "prod-1", name: "Harvest Bowl Adult Dog Food", brand: "Nourish & Co.", category: "Food", price: 1899, originalPrice: 2199, rating: 4.8, reviews: 240, species: ["Dog"], age: "Adult", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=85", stock: 22, tags: ["Grain-free", "Chicken-free", "High activity"], description: "A complete, chicken-free dry food made for active adult dogs.", reason: "Matches Bruno's chicken-free, high-activity routine" },
  { id: "prod-2", name: "Everyday Dental Chews", brand: "Good Dog", category: "Treats", price: 549, rating: 4.7, reviews: 118, species: ["Dog"], age: "Adult", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=85", stock: 41, tags: ["Dental care", "Adult dog"], description: "Crunchy daily dental chews for a satisfying snack routine.", reason: "Suitable for adult dogs" },
  { id: "prod-3", name: "Cloud Nap Orthopedic Bed", brand: "Paw & Rest", category: "Beds", price: 3299, rating: 4.9, reviews: 91, species: ["Dog", "Cat"], age: "All life stages", image: "https://images.unsplash.com/photo-1541599468348-e96984315921?auto=format&fit=crop&w=800&q=85", stock: 12, tags: ["Supportive", "Washable"], description: "A supportive, washable resting place with a bolstered edge.", reason: "A comfortable recovery and rest option" },
  { id: "prod-4", name: "Feather & Felt Puzzle Toy", brand: "Milo Play", category: "Toys", price: 799, rating: 4.6, reviews: 84, species: ["Cat"], age: "All life stages", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=85", stock: 33, tags: ["Indoor", "Enrichment"], description: "An engaging felt puzzle designed for indoor feline play.", reason: "Fits Miso's indoor activity profile" },
  { id: "prod-5", name: "Gentle Coat & Skin Shampoo", brand: "Kind Fur", category: "Grooming", price: 625, rating: 4.7, reviews: 67, species: ["Dog", "Cat"], age: "All life stages", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=85", stock: 26, tags: ["Gentle", "Fragrance-light"], description: "A gentle cleansing shampoo for routine grooming.", reason: "A general grooming essential" },
  { id: "prod-6", name: "Travel Water Bottle", brand: "Trail Paws", category: "Accessories", price: 899, rating: 4.8, reviews: 132, species: ["Dog"], age: "All life stages", image: "https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?auto=format&fit=crop&w=800&q=85", stock: 17, tags: ["Travel", "Outdoor"], description: "Leak-resistant portable water bottle for walks and travel.", reason: "Useful for Bruno's active outings" },
  { id: "prod-7", name: "Indoor Cat Litter", brand: "Quiet Paws", category: "Healthcare", price: 730, rating: 4.5, reviews: 220, species: ["Cat"], age: "All life stages", image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=800&q=85", stock: 48, tags: ["Low dust", "Indoor"], description: "Low-dust clumping litter for indoor households." },
  { id: "prod-8", name: "Reflective Everyday Collar", brand: "City Tails", category: "Collars", price: 499, rating: 4.6, reviews: 77, species: ["Dog", "Cat"], age: "All life stages", image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&w=800&q=85", stock: 35, tags: ["Reflective", "Adjustable"], description: "A lightweight adjustable collar with reflective thread." },
  { id: "prod-9", name: "Slow Feed Bowl", brand: "Paw Pace", category: "Bowls", price: 675, rating: 4.7, reviews: 65, species: ["Dog"], age: "All life stages", image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=85", stock: 19, tags: ["Enrichment", "Dishwasher safe"], description: "An everyday slow-feeding bowl for supervised mealtimes." },
  { id: "prod-10", name: "Soft-Sided Travel Carrier", brand: "Roam Together", category: "Carriers", price: 2799, rating: 4.8, reviews: 44, species: ["Cat", "Dog"], age: "All life stages", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=85", stock: 9, tags: ["Travel", "Ventilated"], description: "Well-ventilated carrier for short trips and clinic visits." },
  { id: "prod-11", name: "Training Treat Pouch", brand: "Good Dog", category: "Training", price: 449, rating: 4.4, reviews: 59, species: ["Dog"], age: "All life stages", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=85", stock: 28, tags: ["Training", "Hands-free"], description: "A practical clip-on treat pouch for positive-reinforcement training." },
  { id: "prod-12", name: "Plush Rope Tug", brand: "Tumble", category: "Toys", price: 359, rating: 4.5, reviews: 102, species: ["Dog"], age: "Adult", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=85", stock: 31, tags: ["Interactive", "Tug"], description: "A soft, supervised interactive play toy." },
];

export const initialProviders: ServiceProvider[] = [
  { id: "provider-1", name: "Neel Shah", businessName: "The Gentle Groom Room", category: "Grooming", location: "Koregaon Park, Pune", rating: 4.9, reviews: 97, price: 1200, image: "https://images.unsplash.com/photo-1516383607781-913a19294fd1?auto=format&fit=crop&w=800&q=85", description: "Low-stress grooming and coat-care sessions for dogs and cats.", availability: ["09:00", "11:30", "15:00"] },
  { id: "provider-2", name: "Rhea Dsouza", businessName: "Weekend Wag Walks", category: "Pet Walking", location: "Kalyani Nagar, Pune", rating: 4.8, reviews: 143, price: 450, image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=85", description: "Small-group and individual walks with live check-ins.", availability: ["07:00", "08:30", "18:00"] },
  { id: "provider-3", name: "Arjun Menon", businessName: "Pawfect Stay", category: "Pet Boarding", location: "Baner, Pune", rating: 4.7, reviews: 88, price: 1800, image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=85", description: "Home-style supervised boarding with daily updates.", availability: ["10:00", "14:00", "17:00"] },
  { id: "provider-4", name: "Mira Fernandes", businessName: "Kindred Pet Training", category: "Pet Training", location: "Viman Nagar, Pune", rating: 4.9, reviews: 75, price: 1500, image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=85", description: "Reward-based training plans tailored to your home routine.", availability: ["08:00", "12:00", "16:30"] },
  { id: "provider-5", name: "Tanya Rao", businessName: "Light & Leash", category: "Pet Photography", location: "Aundh, Pune", rating: 4.8, reviews: 61, price: 2400, image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=85", description: "Relaxed outdoor and at-home pet portrait sessions.", availability: ["07:30", "09:30", "17:30"] },
  { id: "provider-6", name: "Devika Joshi", businessName: "Homeward Pet Sitting", category: "Pet Sitting", location: "Kothrud, Pune", rating: 4.8, reviews: 116, price: 650, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=85", description: "In-home pet-sitting visits with feeding, playtime and clear owner updates.", availability: ["08:00", "13:00", "19:00"] },
  { id: "provider-7", name: "Kabir Sethi", businessName: "Paws in Motion", category: "Pet Physiotherapy", location: "Hadapsar, Pune", rating: 4.7, reviews: 54, price: 1700, image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=85", description: "Gentle, vet-referred mobility and conditioning sessions with home-routine guidance.", availability: ["09:00", "11:30", "16:00"] },
  { id: "provider-8", name: "Aarav Bhat", businessName: "SafeRide Pet Transit", category: "Pet Taxi", location: "Shivajinagar, Pune", rating: 4.6, reviews: 133, price: 550, image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=85", description: "Pre-booked, pet-friendly local travel for clinic visits, grooming and airport transfers.", availability: ["06:00", "12:00", "20:00"] },
  { id: "provider-9", name: "Leena Mathew", businessName: "Bowl & Balance", category: "Pet Nutrition", location: "Koregaon Park, Pune", rating: 4.9, reviews: 82, price: 1300, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85", description: "Practical food-routine consultations designed to complement veterinary advice and each pet's preferences.", availability: ["10:00", "14:30", "18:00"] },
  { id: "provider-10", name: "Nikhil Patil", businessName: "Puppy Steps Academy", category: "Puppy Socialisation", location: "Wakad, Pune", rating: 4.8, reviews: 69, price: 1100, image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=85", description: "Small, supervised learning groups for young dogs and their families using reward-based methods.", availability: ["08:30", "11:00", "17:00"] },
  { id: "provider-11", name: "Priya Nambiar", businessName: "Purr & Polish Mobile Care", category: "Mobile Grooming", location: "Viman Nagar, Pune", rating: 4.7, reviews: 91, price: 1400, image: "https://images.unsplash.com/photo-1516383607781-913a19294fd1?auto=format&fit=crop&w=800&q=85", description: "At-home hygiene and coat-care visits for families who prefer a familiar environment.", availability: ["09:30", "12:30", "16:30"] },
  { id: "provider-rhea-kapoor", name: "Rhea Kapoor", businessName: "Paws & Paths Concierge", category: "Pet Care Concierge", location: "Koregaon Park, Pune", rating: 4.8, reviews: 104, price: 900, image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=85", description: "A fictional demo service that coordinates pet routines, transport planning and trusted care hand-offs for busy families.", availability: ["09:00", "13:00", "18:00"] },
];

export const initialOrders: Order[] = [
  { id: "order-1", number: "PCH-24081", date: "2026-08-04", items: [{ productId: "prod-6", quantity: 1 }, { productId: "prod-2", quantity: 2 }], total: 1997, status: "DELIVERED", address: "12 Palm Grove, Koregaon Park, Pune 411001", petId: "bruno" },
  { id: "order-2", number: "PCH-23916", date: "2026-07-14", items: [{ productId: "prod-4", quantity: 1 }, { productId: "prod-7", quantity: 1 }], total: 1529, status: "DELIVERED", address: "12 Palm Grove, Koregaon Park, Pune 411001", petId: "miso" },
];

export const initialBookings: ServiceBooking[] = [
  { id: "booking-1", petId: "bruno", providerId: "provider-1", date: "2026-08-28", time: "11:30", notes: "Nail trim and full coat brush.", status: "CONFIRMED" },
  { id: "booking-2", petId: "miso", providerId: "provider-rhea-kapoor", date: "2026-09-06", time: "13:00", notes: "Discuss pet transport and care-plan coordination.", status: "PENDING" },
];

export const initialBands: HealthBand[] = [
  { id: "band-bruno", petId: "bruno", name: "Bruno's Care Band", model: "PetCare Halo", serialNumber: "PCH-HL-20481", status: "CONNECTED", battery: 84, lastSynced: "2026-08-26T18:42:00.000Z", pairedAt: "2026-07-03T09:15:00.000Z", connectionType: "DEMO" },
  { id: "band-miso", petId: "miso", name: "Miso's Care Band", model: "PetCare Halo", serialNumber: "PCH-HL-30172", status: "DISCONNECTED", battery: 46, lastSynced: "2026-08-24T19:10:00.000Z", pairedAt: "2026-06-18T14:30:00.000Z", connectionType: "DEMO" },
];

export const initialBandMetrics: BandDailyMetric[] = [
  { id: "metric-b1", petId: "bruno", date: "2026-08-20", activeMinutes: 73, restMinutes: 690, steps: 6810, distanceKm: 4.8, sleepMinutes: 627, sleepQuality: 84, averageRestingPulse: 75, temperatureTrend: "Baseline" },
  { id: "metric-b2", petId: "bruno", date: "2026-08-21", activeMinutes: 64, restMinutes: 722, steps: 6150, distanceKm: 4.3, sleepMinutes: 644, sleepQuality: 87, averageRestingPulse: 76, temperatureTrend: "Baseline" },
  { id: "metric-b3", petId: "bruno", date: "2026-08-22", activeMinutes: 81, restMinutes: 671, steps: 7440, distanceKm: 5.2, sleepMinutes: 618, sleepQuality: 80, averageRestingPulse: 74, temperatureTrend: "Baseline" },
  { id: "metric-b4", petId: "bruno", date: "2026-08-23", activeMinutes: 59, restMinutes: 734, steps: 5540, distanceKm: 3.9, sleepMinutes: 650, sleepQuality: 88, averageRestingPulse: 77, temperatureTrend: "Baseline" },
  { id: "metric-b5", petId: "bruno", date: "2026-08-24", activeMinutes: 51, restMinutes: 743, steps: 4980, distanceKm: 3.5, sleepMinutes: 621, sleepQuality: 76, averageRestingPulse: 78, temperatureTrend: "Slightly above baseline" },
  { id: "metric-b6", petId: "bruno", date: "2026-08-25", activeMinutes: 48, restMinutes: 758, steps: 4660, distanceKm: 3.2, sleepMinutes: 604, sleepQuality: 72, averageRestingPulse: 79, temperatureTrend: "Slightly above baseline" },
  { id: "metric-b7", petId: "bruno", date: "2026-08-26", activeMinutes: 56, restMinutes: 731, steps: 5310, distanceKm: 3.7, sleepMinutes: 636, sleepQuality: 82, averageRestingPulse: 77, temperatureTrend: "Baseline" },
  { id: "metric-m1", petId: "miso", date: "2026-08-22", activeMinutes: 42, restMinutes: 825, steps: 2180, distanceKm: 1.4, sleepMinutes: 705, sleepQuality: 86, averageRestingPulse: 122, temperatureTrend: "Baseline" },
  { id: "metric-m2", petId: "miso", date: "2026-08-23", activeMinutes: 39, restMinutes: 840, steps: 1960, distanceKm: 1.2, sleepMinutes: 693, sleepQuality: 83, averageRestingPulse: 124, temperatureTrend: "Baseline" },
  { id: "metric-m3", petId: "miso", date: "2026-08-24", activeMinutes: 45, restMinutes: 818, steps: 2410, distanceKm: 1.6, sleepMinutes: 709, sleepQuality: 88, averageRestingPulse: 121, temperatureTrend: "Baseline" },
];

export const initialHabits: PetHabit[] = [
  { id: "habit-b1", petId: "bruno", kind: "WALK", label: "Morning walk", timestamp: "2026-08-26T07:12:00.000Z", durationMinutes: 31, source: "BAND" },
  { id: "habit-b2", petId: "bruno", kind: "MEAL", label: "Breakfast", timestamp: "2026-08-26T08:16:00.000Z", source: "MANUAL" },
  { id: "habit-b3", petId: "bruno", kind: "PLAY", label: "Garden play", timestamp: "2026-08-26T17:45:00.000Z", durationMinutes: 18, source: "BAND" },
  { id: "habit-b4", petId: "bruno", kind: "WATER", label: "Water refill", timestamp: "2026-08-26T13:10:00.000Z", source: "MANUAL" },
  { id: "habit-m1", petId: "miso", kind: "MEAL", label: "Evening meal", timestamp: "2026-08-25T19:30:00.000Z", source: "MANUAL" },
];

export const initialBandAlerts: BandAlert[] = [
  { id: "band-alert-1", petId: "bruno", priority: "ATTENTION", title: "A quieter two-day pattern", description: "Bruno's tracked activity has been below his recent personal pattern for two days. It is a trend to notice, not a diagnosis.", createdAt: "2026-08-25T20:00:00.000Z", status: "OPEN" },
  { id: "band-alert-2", petId: "bruno", priority: "INFO", title: "Back near usual overnight rest", description: "Last night's tracked rest is closer to Bruno's recent pattern.", createdAt: "2026-08-26T07:30:00.000Z", status: "OPEN" },
  { id: "band-alert-3", petId: "miso", priority: "INFO", title: "Band needs a charge", description: "Miso's band battery is below 50%. Charge it before the next sync to maintain habit history.", createdAt: "2026-08-24T19:10:00.000Z", status: "READ" },
];
