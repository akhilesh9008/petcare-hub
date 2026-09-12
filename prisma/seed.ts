import {
  ActivityLevel,
  AIMessageRole,
  AppointmentStatus,
  AppointmentType,
  MedicalRecordType,
  MedicationStatus,
  OrderStatus,
  PaymentStatus,
  PetGender,
  PetSpecies,
  PrismaClient,
  ProductAgeGroup,
  ReminderRecurrence,
  ReminderSource,
  ReminderStatus,
  ReminderType,
  ReviewTarget,
  Role,
  ServiceBookingStatus,
  ServiceCategory,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "PetCare@123";

const dateAt = (offsetDays: number, hour = 10) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const money = (value: number) => Number(value.toFixed(2));

async function clearLocalData() {
  // The seed is intentionally repeatable for local development. Never run it against a production database.
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.productRecommendation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.serviceBooking.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.healthDocument.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.weightRecord.deleteMany();
  await prisma.veterinarianPetAccess.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceProviderAvailability.deleteMany();
  await prisma.vetAvailability.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.product.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.veterinarian.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The PetCare Hub demo seed is disabled in production.");
  }

  await clearLocalData();
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const ownerSeeds = [
    { name: "Akhilesh Mehta", email: "akhilesh.mehta@demo.petcarehub.in", phone: "9000100001", city: "Pune", state: "Maharashtra", line1: "18 Demo Park, Kalyani Nagar", pinCode: "411006" },
    { name: "Nisha Kapoor", email: "nisha.kapoor@demo.petcarehub.in", phone: "9000100002", city: "Mumbai", state: "Maharashtra", line1: "42 Demo Lane, Powai", pinCode: "400076" },
    { name: "Rohan Iyer", email: "rohan.iyer@demo.petcarehub.in", phone: "9000100003", city: "Bengaluru", state: "Karnataka", line1: "7 Demo Residency, Indiranagar", pinCode: "560038" },
    { name: "Meera Sharma", email: "meera.sharma@demo.petcarehub.in", phone: "9000100004", city: "Delhi", state: "Delhi", line1: "91 Demo Enclave, Saket", pinCode: "110017" },
    { name: "Kavya Reddy", email: "kavya.reddy@demo.petcarehub.in", phone: "9000100005", city: "Hyderabad", state: "Telangana", line1: "22 Demo Avenue, Jubilee Hills", pinCode: "500033" },
    { name: "Arjun Nair", email: "arjun.nair@demo.petcarehub.in", phone: "9000100006", city: "Pune", state: "Maharashtra", line1: "10 Demo Court, Baner", pinCode: "411045" },
    { name: "Sana Khan", email: "sana.khan@demo.petcarehub.in", phone: "9000100007", city: "Mumbai", state: "Maharashtra", line1: "5 Demo Heights, Bandra", pinCode: "400050" },
    { name: "Vikram Das", email: "vikram.das@demo.petcarehub.in", phone: "9000100008", city: "Bengaluru", state: "Karnataka", line1: "32 Demo Road, Whitefield", pinCode: "560066" },
    { name: "Priya Menon", email: "priya.menon@demo.petcarehub.in", phone: "9000100009", city: "Delhi", state: "Delhi", line1: "61 Demo Marg, Dwarka", pinCode: "110075" },
    { name: "Dev Malhotra", email: "dev.malhotra@demo.petcarehub.in", phone: "9000100010", city: "Hyderabad", state: "Telangana", line1: "14 Demo Street, Kondapur", pinCode: "500084" },
  ];

  const owners = await Promise.all(
    ownerSeeds.map((owner) =>
      prisma.user.create({
        data: {
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          passwordHash,
          role: Role.PET_OWNER,
          emailVerifiedAt: dateAt(-120),
        },
      }),
    ),
  );

  await prisma.user.create({
    data: {
      name: "PetCare Hub Demo Admin",
      email: "admin@demo.petcarehub.in",
      phone: "9000100099",
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt: dateAt(-120),
    },
  });

  const addresses = await Promise.all(
    ownerSeeds.map((owner, index) =>
      prisma.address.create({
        data: {
          userId: owners[index].id,
          recipientName: owner.name,
          phone: owner.phone,
          line1: owner.line1,
          city: owner.city,
          state: owner.state,
          pinCode: owner.pinCode,
          isDefault: true,
        },
      }),
    ),
  );

  const clinicSeeds = [
    { name: "Pune Pet Wellness Demo Clinic", city: "Pune", state: "Maharashtra", address: "4 Demo Square, Koregaon Park", pinCode: "411001", phone: "9100101001", email: "pune-clinic@demo.petcarehub.in" },
    { name: "Mumbai Companion Care Demo Clinic", city: "Mumbai", state: "Maharashtra", address: "11 Demo Road, Andheri East", pinCode: "400093", phone: "9100101002", email: "mumbai-clinic@demo.petcarehub.in" },
    { name: "Bengaluru Animal Health Demo Clinic", city: "Bengaluru", state: "Karnataka", address: "28 Demo Cross, Koramangala", pinCode: "560034", phone: "9100101003", email: "bengaluru-clinic@demo.petcarehub.in" },
    { name: "Hyderabad Pet Health Demo Clinic", city: "Hyderabad", state: "Telangana", address: "16 Demo Plaza, Banjara Hills", pinCode: "500034", phone: "9100101004", email: "hyderabad-clinic@demo.petcarehub.in" },
  ];

  const clinics = await Promise.all(
    clinicSeeds.map((clinic) =>
      prisma.clinic.create({
        data: {
          ...clinic,
          description: "A clearly fictional clinic profile for PetCare Hub local demo data.",
        },
      }),
    ),
  );

  const veterinarianSeeds = [
    { name: "Dr. Aanya Rao (Demo)", email: "aanya.rao@demo.petcarehub.in", phone: "9200100001", slug: "dr-aanya-rao-demo", clinic: 0, city: "Pune", state: "Maharashtra", qualifications: ["BVSc & AH (Demo)", "Companion Animal Care (Demo)"], specializations: ["Preventive care", "Canine wellness"], yearsExperience: 9, consultationFee: 650, rating: 4.8, reviewCount: 34 },
    { name: "Dr. Kiran Shah (Demo)", email: "kiran.shah@demo.petcarehub.in", phone: "9200100002", slug: "dr-kiran-shah-demo", clinic: 0, city: "Pune", state: "Maharashtra", qualifications: ["BVSc & AH (Demo)"], specializations: ["Dermatology", "Feline care"], yearsExperience: 7, consultationFee: 700, rating: 4.7, reviewCount: 28 },
    { name: "Dr. Mira Sen (Demo)", email: "mira.sen@demo.petcarehub.in", phone: "9200100003", slug: "dr-mira-sen-demo", clinic: 1, city: "Mumbai", state: "Maharashtra", qualifications: ["BVSc & AH (Demo)", "Small Animal Surgery (Demo)"], specializations: ["Surgery", "Orthopaedics"], yearsExperience: 12, consultationFee: 900, rating: 4.9, reviewCount: 46 },
    { name: "Dr. Neel Vora (Demo)", email: "neel.vora@demo.petcarehub.in", phone: "9200100004", slug: "dr-neel-vora-demo", clinic: 1, city: "Mumbai", state: "Maharashtra", qualifications: ["BVSc & AH (Demo)"], specializations: ["Nutrition", "Senior pet care"], yearsExperience: 8, consultationFee: 750, rating: 4.6, reviewCount: 19 },
    { name: "Dr. Tara Iqbal (Demo)", email: "tara.iqbal@demo.petcarehub.in", phone: "9200100005", slug: "dr-tara-iqbal-demo", clinic: 2, city: "Bengaluru", state: "Karnataka", qualifications: ["BVSc & AH (Demo)"], specializations: ["Avian care", "Exotic pets"], yearsExperience: 10, consultationFee: 850, rating: 4.8, reviewCount: 24 },
    { name: "Dr. Om Prakash (Demo)", email: "om.prakash@demo.petcarehub.in", phone: "9200100006", slug: "dr-om-prakash-demo", clinic: 2, city: "Bengaluru", state: "Karnataka", qualifications: ["BVSc & AH (Demo)"], specializations: ["Internal medicine", "Preventive care"], yearsExperience: 6, consultationFee: 650, rating: 4.5, reviewCount: 17 },
    { name: "Dr. Leela Bose (Demo)", email: "leela.bose@demo.petcarehub.in", phone: "9200100007", slug: "dr-leela-bose-demo", clinic: 3, city: "Hyderabad", state: "Telangana", qualifications: ["BVSc & AH (Demo)"], specializations: ["Dentistry", "Rabbit care"], yearsExperience: 11, consultationFee: 800, rating: 4.7, reviewCount: 31 },
    { name: "Dr. Farhan Ali (Demo)", email: "farhan.ali@demo.petcarehub.in", phone: "9200100008", slug: "dr-farhan-ali-demo", clinic: 3, city: "Hyderabad", state: "Telangana", qualifications: ["BVSc & AH (Demo)"], specializations: ["Emergency triage", "General practice"], yearsExperience: 5, consultationFee: 600, rating: 4.4, reviewCount: 14 },
  ];

  const veterinarians = await Promise.all(
    veterinarianSeeds.map((vet) =>
      prisma.veterinarian.create({
        data: {
          slug: vet.slug,
          clinic: { connect: { id: clinics[vet.clinic].id } },
          city: vet.city,
          state: vet.state,
          qualifications: vet.qualifications,
          specializations: vet.specializations,
          yearsExperience: vet.yearsExperience,
          consultationFee: vet.consultationFee,
          rating: vet.rating,
          reviewCount: vet.reviewCount,
          bio: "Fictional demo veterinarian profile for local PetCare Hub development.",
          photoUrl: "/images/veterinarians/" + vet.slug + ".jpg",
          isVerified: true,
          user: {
            create: {
              name: vet.name,
              email: vet.email,
              phone: vet.phone,
              passwordHash,
              role: Role.VETERINARIAN,
              emailVerifiedAt: dateAt(-120),
            },
          },
        },
      }),
    ),
  );

  const providerSeeds = [
    { name: "Ria Kapoor (Demo)", email: "ria.kapoor@demo.petcarehub.in", phone: "9300100001", businessName: "Paws & Whiskers Demo Care", slug: "paws-whiskers-demo-care", city: "Mumbai", state: "Maharashtra", address: "8 Demo Terrace, Powai", rating: 4.8, reviewCount: 52 },
    { name: "Kabir Sethi (Demo)", email: "kabir.sethi@demo.petcarehub.in", phone: "9300100002", businessName: "Happy Tails Demo Grooming", slug: "happy-tails-demo-grooming", city: "Pune", state: "Maharashtra", address: "19 Demo Street, Viman Nagar", rating: 4.7, reviewCount: 41 },
    { name: "Aditi Pillai (Demo)", email: "aditi.pillai@demo.petcarehub.in", phone: "9300100003", businessName: "TailTrail Demo Walkers", slug: "tailtrail-demo-walkers", city: "Bengaluru", state: "Karnataka", address: "44 Demo Main, HSR Layout", rating: 4.6, reviewCount: 35 },
    { name: "Manav Gupta (Demo)", email: "manav.gupta@demo.petcarehub.in", phone: "9300100004", businessName: "Gentle Paws Demo Boarding", slug: "gentle-paws-demo-boarding", city: "Hyderabad", state: "Telangana", address: "12 Demo Colony, Gachibowli", rating: 4.5, reviewCount: 23 },
    { name: "Ira Dutta (Demo)", email: "ira.dutta@demo.petcarehub.in", phone: "9300100005", businessName: "FrameMyPet Demo Studio", slug: "frame-my-pet-demo-studio", city: "Delhi", state: "Delhi", address: "30 Demo Road, Hauz Khas", rating: 4.9, reviewCount: 29 },
  ];

  const serviceProviders = await Promise.all(
    providerSeeds.map((provider) =>
      prisma.serviceProvider.create({
        data: {
          businessName: provider.businessName,
          slug: provider.slug,
          city: provider.city,
          state: provider.state,
          address: provider.address,
          phone: provider.phone,
          rating: provider.rating,
          reviewCount: provider.reviewCount,
          description: "Fictional demo service provider profile for PetCare Hub local development.",
          photoUrl: "/images/providers/" + provider.slug + ".jpg",
          gallery: ["/images/providers/" + provider.slug + "-1.jpg"],
          isVerified: true,
          user: {
            create: {
              name: provider.name,
              email: provider.email,
              phone: provider.phone,
              passwordHash,
              role: Role.SERVICE_PROVIDER,
              emailVerifiedAt: dateAt(-120),
            },
          },
        },
      }),
    ),
  );

  const petSeeds = [
    { owner: 0, name: "Bruno", species: PetSpecies.DOG, breed: "Golden Retriever", birthDate: new Date("2021-03-12"), gender: PetGender.MALE, weightKg: 28.4, color: "Golden", allergies: ["Chicken"], conditions: [], dietary: ["Adult dog food", "Chicken-free"], activity: ActivityLevel.HIGH },
    { owner: 1, name: "Miso", species: PetSpecies.CAT, breed: "Indian Shorthair", birthDate: new Date("2022-07-19"), gender: PetGender.FEMALE, weightKg: 4.2, color: "Calico", allergies: [], conditions: [], dietary: ["Wet food"], activity: ActivityLevel.MODERATE },
    { owner: 2, name: "Tara", species: PetSpecies.DOG, breed: "Indian Pariah", birthDate: new Date("2020-11-04"), gender: PetGender.FEMALE, weightKg: 19.8, color: "Tan", allergies: [], conditions: ["Sensitive skin"], dietary: ["Grain-inclusive"], activity: ActivityLevel.HIGH },
    { owner: 3, name: "Coco", species: PetSpecies.DOG, breed: "Beagle", birthDate: new Date("2023-01-26"), gender: PetGender.MALE, weightKg: 12.6, color: "Tri-colour", allergies: [], conditions: [], dietary: ["Adult dog food"], activity: ActivityLevel.HIGH },
    { owner: 4, name: "Pepper", species: PetSpecies.CAT, breed: "Persian", birthDate: new Date("2021-09-08"), gender: PetGender.FEMALE, weightKg: 4.8, color: "Smoke grey", allergies: ["Fish"], conditions: [], dietary: ["Fish-free"], activity: ActivityLevel.LOW },
    { owner: 5, name: "Max", species: PetSpecies.DOG, breed: "Labrador Retriever", birthDate: new Date("2019-05-17"), gender: PetGender.MALE, weightKg: 31.2, color: "Black", allergies: [], conditions: ["Joint monitoring"], dietary: ["Senior-support formula"], activity: ActivityLevel.MODERATE },
    { owner: 6, name: "Kiwi", species: PetSpecies.BIRD, breed: "Budgerigar", birthDate: new Date("2024-02-14"), gender: PetGender.UNKNOWN, weightKg: 0.04, color: "Green and yellow", allergies: [], conditions: [], dietary: ["Seed and pellet mix"], activity: ActivityLevel.HIGH },
    { owner: 7, name: "Bella", species: PetSpecies.CAT, breed: "Indian Shorthair", birthDate: new Date("2020-10-11"), gender: PetGender.FEMALE, weightKg: 4.5, color: "Tortoiseshell", allergies: [], conditions: [], dietary: ["High-protein"], activity: ActivityLevel.MODERATE },
    { owner: 8, name: "Simba", species: PetSpecies.DOG, breed: "German Shepherd", birthDate: new Date("2020-04-29"), gender: PetGender.MALE, weightKg: 34.7, color: "Black and tan", allergies: [], conditions: [], dietary: ["Large-breed adult"], activity: ActivityLevel.HIGH },
    { owner: 9, name: "Luna", species: PetSpecies.DOG, breed: "Shih Tzu", birthDate: new Date("2022-12-03"), gender: PetGender.FEMALE, weightKg: 6.1, color: "White and brown", allergies: [], conditions: [], dietary: ["Small-breed adult"], activity: ActivityLevel.MODERATE },
    { owner: 0, name: "Oreo", species: PetSpecies.RABBIT, breed: "Holland Lop", birthDate: new Date("2023-06-18"), gender: PetGender.MALE, weightKg: 2.1, color: "Black and white", allergies: [], conditions: [], dietary: ["Timothy hay"], activity: ActivityLevel.MODERATE },
    { owner: 1, name: "Rocky", species: PetSpecies.DOG, breed: "Pug", birthDate: new Date("2021-08-30"), gender: PetGender.MALE, weightKg: 8.9, color: "Fawn", allergies: [], conditions: [], dietary: ["Weight-management"], activity: ActivityLevel.LOW },
    { owner: 2, name: "Nala", species: PetSpecies.DOG, breed: "Indie Mix", birthDate: new Date("2023-03-22"), gender: PetGender.FEMALE, weightKg: 17.2, color: "Brown", allergies: [], conditions: [], dietary: ["Puppy-to-adult transition"], activity: ActivityLevel.HIGH },
    { owner: 3, name: "Chiku", species: PetSpecies.BIRD, breed: "Cockatiel", birthDate: new Date("2022-06-07"), gender: PetGender.MALE, weightKg: 0.09, color: "Grey and yellow", allergies: [], conditions: [], dietary: ["Pellets and greens"], activity: ActivityLevel.HIGH },
    { owner: 4, name: "Milo", species: PetSpecies.CAT, breed: "Ragdoll", birthDate: new Date("2021-01-15"), gender: PetGender.MALE, weightKg: 5.7, color: "Cream", allergies: [], conditions: [], dietary: ["Hairball support"], activity: ActivityLevel.MODERATE },
  ];

  const pets = await Promise.all(
    petSeeds.map((pet) =>
      prisma.pet.create({
        data: {
          ownerId: owners[pet.owner].id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: pet.birthDate,
          gender: pet.gender,
          weightKg: pet.weightKg,
          color: pet.color,
          profileImageUrl: "/images/pets/" + pet.name.toLowerCase() + ".jpg",
          microchipId: "DEMO-MICRO-" + pet.name.toUpperCase(),
          allergies: pet.allergies,
          medicalConditions: pet.conditions,
          dietaryPreferences: pet.dietary,
          activityLevel: pet.activity,
        },
      }),
    ),
  );

  await prisma.vetAvailability.createMany({
    data: veterinarians.flatMap((vet, index) =>
      [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        veterinarianId: vet.id,
        dayOfWeek,
        startTime: index % 2 === 0 ? "09:00" : "10:00",
        endTime: index % 2 === 0 ? "17:00" : "18:00",
      })),
    ),
  });

  await prisma.serviceProviderAvailability.createMany({
    data: serviceProviders.flatMap((provider) =>
      [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        serviceProviderId: provider.id,
        dayOfWeek,
        startTime: "08:00",
        endTime: "19:00",
      })),
    ),
  });

  const appointmentOffsets = [-48, -41, -35, -28, -21, -16, -10, -4, -1, 2, 4, 6, 8, 11, 14, 18, 22, 27, 31, 36];
  const appointmentStatuses = [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
  ];
  const appointmentReasons = [
    "Annual wellness review",
    "Vaccination follow-up",
    "Skin and coat check",
    "Diet discussion",
    "Routine preventive consultation",
  ];

  const appointments = await Promise.all(
    appointmentOffsets.map((offset, index) => {
      const pet = pets[index % pets.length];
      const veterinarian = veterinarians[index % veterinarians.length];
      const status = appointmentStatuses[index];
      const isCompleted = status === AppointmentStatus.COMPLETED;
      const isCancelled = status === AppointmentStatus.CANCELLED;
      return prisma.appointment.create({
        data: {
          petId: pet.id,
          ownerId: pet.ownerId,
          veterinarianId: veterinarian.id,
          clinicId: veterinarian.clinicId,
          scheduledAt: dateAt(offset, 9 + (index % 6)),
          durationMinutes: index % 3 === 0 ? 45 : 30,
          type: index % 4 === 0 ? AppointmentType.ONLINE : AppointmentType.IN_PERSON,
          status,
          reason: appointmentReasons[index % appointmentReasons.length],
          notes: index % 2 === 0 ? "Demo appointment note supplied by the pet owner." : undefined,
          consultationNotes: isCompleted ? "Demo consultation summary recorded for the pet owner." : undefined,
          meetingUrl: index % 4 === 0 ? "https://meet.demo.petcarehub.in/appointment-" + (index + 1) : undefined,
          fee: veterinarian.consultationFee,
          cancelledAt: isCancelled ? dateAt(offset - 1) : undefined,
          cancellationReason: isCancelled ? "Demo schedule conflict" : undefined,
          completedAt: isCompleted ? dateAt(offset, 11 + (index % 4)) : undefined,
        },
      });
    }),
  );

  const recordTemplates = [
    { recordType: MedicalRecordType.WELLNESS, reason: "Annual wellness review", symptoms: [], diagnosis: "Routine wellness review", treatment: "Preventive care plan discussed" },
    { recordType: MedicalRecordType.CONSULTATION, reason: "Skin and coat check", symptoms: ["Occasional scratching"], diagnosis: "Skin comfort monitoring", treatment: "Gentle grooming and follow-up if symptoms persist" },
    { recordType: MedicalRecordType.VACCINATION, reason: "Scheduled vaccination", symptoms: [], diagnosis: "Vaccination administered", treatment: "Observe pet normally after vaccination" },
    { recordType: MedicalRecordType.CONSULTATION, reason: "Diet review", symptoms: ["Selective appetite"], diagnosis: "Dietary preference review", treatment: "Maintain a gradual food transition" },
    { recordType: MedicalRecordType.WELLNESS, reason: "Weight check", symptoms: [], diagnosis: "Weight trend logged", treatment: "Continue activity and food-portion monitoring" },
    { recordType: MedicalRecordType.CONSULTATION, reason: "Mobility check", symptoms: ["Slower after long walks"], diagnosis: "Mobility observation", treatment: "Low-impact activity plan discussed" },
  ];

  const medicalRecords = await Promise.all(
    Array.from({ length: 30 }, (_, index) => {
      const pet = pets[index % pets.length];
      const veterinarian = veterinarians[index % veterinarians.length];
      const template = recordTemplates[index % recordTemplates.length];
      return prisma.medicalRecord.create({
        data: {
          petId: pet.id,
          veterinarianId: veterinarian.id,
          clinicId: veterinarian.clinicId,
          appointmentId: index < 8 ? appointments[index].id : undefined,
          createdById: veterinarian.userId,
          recordType: template.recordType,
          occurredAt: dateAt(-90 + index * 3, 11),
          reason: template.reason,
          symptoms: template.symptoms,
          diagnosis: template.diagnosis,
          notes: "Fictional demo health record. This information is not medical advice.",
          treatment: template.treatment,
          followUpDate: index % 4 === 0 ? dateAt(20 + index) : undefined,
        },
      });
    }),
  );

  await prisma.healthDocument.createMany({
    data: medicalRecords.slice(0, 6).map((record, index) => ({
      petId: record.petId,
      medicalRecordId: record.id,
      uploadedById: record.createdById,
      documentType: index % 2 === 0 ? "VACCINATION_CERTIFICATE" : "LAB_REPORT",
      fileName: "demo-health-document-" + (index + 1) + ".pdf",
      fileUrl: "/uploads/demo-health-document-" + (index + 1) + ".pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 240000 + index * 12000,
    })),
  });

  const vaccineNames = ["Rabies", "DHPPi", "FVRCP", "Leptospirosis", "Avian wellness vaccine"];
  const vaccinationDueOffsets = [-5, 10, 28, 45, 70, 95, 120, 150, 180, 210, 240, 275, 305, 335, 365, 390, 420, 450, 480, 510];
  const vaccinations = await Promise.all(
    Array.from({ length: 20 }, (_, index) => {
      const pet = pets[index % pets.length];
      const veterinarian = veterinarians[index % veterinarians.length];
      return prisma.vaccination.create({
        data: {
          petId: pet.id,
          veterinarianId: veterinarian.id,
          medicalRecordId: medicalRecords[(index + 2) % medicalRecords.length].id,
          createdById: veterinarian.userId,
          vaccineName: vaccineNames[index % vaccineNames.length],
          administeredAt: dateAt(-365 + index * 12),
          nextDueDate: dateAt(vaccinationDueOffsets[index]),
          notes: "Demo vaccination entry for local development.",
        },
      });
    }),
  );

  const medicationNames = ["Omega-3 supplement", "Topical skin cleanser", "Dental-care gel", "Digestive support supplement", "Ear-cleaning solution", "Joint-support supplement", "Eye-area cleanser", "Coat-care supplement"];
  const medications = await Promise.all(
    medicationNames.map((name, index) => {
      const pet = pets[(index + 1) % pets.length];
      const veterinarian = veterinarians[(index + 2) % veterinarians.length];
      const isActive = index < 5;
      return prisma.medication.create({
        data: {
          petId: pet.id,
          prescribingVeterinarianId: veterinarian.id,
          medicalRecordId: medicalRecords[(index + 4) % medicalRecords.length].id,
          createdById: veterinarian.userId,
          name,
          dosage: index % 2 === 0 ? "As directed on the product label" : "Use only as instructed by the veterinarian",
          frequency: index % 2 === 0 ? "Once daily" : "Twice weekly",
          startDate: dateAt(-20 - index * 4),
          endDate: isActive ? dateAt(10 + index * 3) : dateAt(-2 - index),
          instructions: "Demo instruction only; do not alter a treatment plan without veterinary guidance.",
          status: isActive ? MedicationStatus.ACTIVE : MedicationStatus.COMPLETED,
        },
      });
    }),
  );

  await prisma.weightRecord.createMany({
    data: pets.flatMap((pet, petIndex) =>
      [-90, -60, -30, 0].map((offset, pointIndex) => ({
        petId: pet.id,
        recordedById: pet.ownerId,
        recordedAt: dateAt(offset),
        weightKg: money(Number(pet.weightKg ?? 1) - (3 - pointIndex) * (petIndex % 3 === 0 ? 0.25 : 0.1)),
        notes: pointIndex === 3 ? "Latest demo weight entry." : undefined,
      })),
    ),
  });

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED,
  );
  await prisma.reminder.createMany({
    data: [
      ...vaccinations.slice(0, 5).map((vaccination, index) => ({
        petId: vaccination.petId,
        userId: pets.find((pet) => pet.id === vaccination.petId)!.ownerId,
        vaccinationId: vaccination.id,
        type: ReminderType.VACCINATION,
        source: ReminderSource.VACCINATION,
        title: vaccination.vaccineName + " vaccination due",
        description: "Automatically created from the vaccination due date.",
        scheduledFor: vaccination.nextDueDate!,
        recurrence: ReminderRecurrence.YEARLY,
        status: index === 0 ? ReminderStatus.PENDING : ReminderStatus.PENDING,
      })),
      ...medications.slice(0, 5).map((medication) => ({
        petId: medication.petId,
        userId: pets.find((pet) => pet.id === medication.petId)!.ownerId,
        medicationId: medication.id,
        type: ReminderType.MEDICATION,
        source: ReminderSource.MEDICATION,
        title: medication.name + " follow-up",
        description: "Automatically created from the medication schedule.",
        scheduledFor: medication.endDate!,
        recurrence: ReminderRecurrence.NONE,
        status: ReminderStatus.PENDING,
      })),
      ...upcomingAppointments.slice(0, 5).map((appointment) => ({
        petId: appointment.petId,
        userId: appointment.ownerId,
        appointmentId: appointment.id,
        type: ReminderType.VET_APPOINTMENT,
        source: ReminderSource.APPOINTMENT,
        title: "Upcoming veterinary appointment",
        description: "Automatically created when the appointment was booked.",
        scheduledFor: new Date(appointment.scheduledAt.getTime() - 24 * 60 * 60 * 1000),
        recurrence: ReminderRecurrence.NONE,
        status: ReminderStatus.PENDING,
      })),
    ],
  });

  const categorySeeds = [
    ["Food", "food", "Daily nutrition for dogs, cats, birds, and rabbits."],
    ["Treats", "treats", "Reward and training treats."],
    ["Toys", "toys", "Enrichment and play essentials."],
    ["Grooming", "grooming", "Gentle everyday grooming."],
    ["Healthcare", "healthcare", "Non-prescription wellness essentials."],
    ["Accessories", "accessories", "Useful everyday pet accessories."],
    ["Beds", "beds", "Comfortable rest spaces."],
    ["Collars", "collars", "Collars for everyday identification."],
    ["Leashes", "leashes", "Walking essentials."],
    ["Bowls", "bowls", "Food and water bowls."],
    ["Carriers", "carriers", "Travel and safe transport."],
    ["Training", "training", "Training and enrichment tools."],
  ];
  const categories = await Promise.all(
    categorySeeds.map(([name, slug, description], index) =>
      prisma.productCategory.create({
        data: { name, slug, description, sortOrder: index + 1, imageUrl: "/images/categories/" + slug + ".jpg" },
      }),
    ),
  );
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));

  const productSeeds = [
    { category: "food", name: "Pawline Adult Dog Chicken-Free Kibble", slug: "pawline-adult-dog-chicken-free-kibble", brand: "Pawline Demo", price: 1899, discount: 10, stock: 42, rating: 4.7, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ADULT, tags: ["adult", "chicken-free", "dry food"] },
    { category: "food", name: "WhiskerWell Indoor Cat Recipe", slug: "whiskerwell-indoor-cat-recipe", brand: "WhiskerWell Demo", price: 1399, discount: 8, stock: 50, rating: 4.6, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ADULT, tags: ["indoor cat", "dry food"] },
    { category: "food", name: "FeatherFuel Bird Pellet Blend", slug: "featherfuel-bird-pellet-blend", brand: "FeatherFuel Demo", price: 549, discount: 0, stock: 36, rating: 4.5, species: [PetSpecies.BIRD], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["pellets", "bird nutrition"] },
    { category: "food", name: "HopHarvest Timothy Hay", slug: "hopharvest-timothy-hay", brand: "HopHarvest Demo", price: 429, discount: 5, stock: 61, rating: 4.8, species: [PetSpecies.RABBIT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["hay", "rabbit"] },
    { category: "food", name: "Pawline Large Breed Adult Recipe", slug: "pawline-large-breed-adult-recipe", brand: "Pawline Demo", price: 2299, discount: 12, stock: 28, rating: 4.6, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ADULT, tags: ["large breed", "adult"] },
    { category: "treats", name: "TailJoy Soft Training Bites", slug: "tailjoy-soft-training-bites", brand: "TailJoy Demo", price: 299, discount: 0, stock: 84, rating: 4.5, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.JUNIOR, tags: ["training", "soft treats"] },
    { category: "treats", name: "PurrPop Cat Treat Cubes", slug: "purrpop-cat-treat-cubes", brand: "PurrPop Demo", price: 279, discount: 5, stock: 72, rating: 4.4, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["cat treats", "reward"] },
    { category: "toys", name: "TugLoop Durable Rope Toy", slug: "tugloop-durable-rope-toy", brand: "TugLoop Demo", price: 399, discount: 10, stock: 48, rating: 4.6, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["interactive", "chew"] },
    { category: "toys", name: "WhiskerChase Feather Wand", slug: "whiskerchase-feather-wand", brand: "WhiskerChase Demo", price: 349, discount: 0, stock: 53, rating: 4.7, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["interactive", "cat toy"] },
    { category: "grooming", name: "GentleCoat Oat Shampoo", slug: "gentlecoat-oat-shampoo", brand: "GentleCoat Demo", price: 525, discount: 8, stock: 40, rating: 4.5, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["sensitive skin", "grooming"] },
    { category: "grooming", name: "SoftPaw Detangling Comb", slug: "softpaw-detangling-comb", brand: "SoftPaw Demo", price: 359, discount: 0, stock: 37, rating: 4.4, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["coat care", "comb"] },
    { category: "healthcare", name: "SmileBright Dental Wipes", slug: "smilebright-dental-wipes", brand: "SmileBright Demo", price: 449, discount: 5, stock: 65, rating: 4.5, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["dental care", "non-prescription"] },
    { category: "healthcare", name: "JointEase Mobility Supplement", slug: "jointease-mobility-supplement", brand: "JointEase Demo", price: 799, discount: 10, stock: 31, rating: 4.6, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.SENIOR, tags: ["mobility", "supplement"] },
    { category: "accessories", name: "TravelSip Water Bottle", slug: "travelsip-water-bottle", brand: "TravelSip Demo", price: 599, discount: 0, stock: 45, rating: 4.4, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["travel", "hydration"] },
    { category: "accessories", name: "PetTag Personalised ID Tag", slug: "pettag-personalised-id-tag", brand: "PetTag Demo", price: 249, discount: 0, stock: 92, rating: 4.3, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["id tag", "safety"] },
    { category: "beds", name: "CloudNest Washable Dog Bed", slug: "cloudnest-washable-dog-bed", brand: "CloudNest Demo", price: 1799, discount: 15, stock: 22, rating: 4.7, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["bed", "washable"] },
    { category: "beds", name: "WindowWhisker Cat Lounger", slug: "windowwhisker-cat-lounger", brand: "WindowWhisker Demo", price: 1499, discount: 10, stock: 19, rating: 4.6, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["cat bed", "lounger"] },
    { category: "collars", name: "Everyday Reflective Dog Collar", slug: "everyday-reflective-dog-collar", brand: "SafeStride Demo", price: 499, discount: 0, stock: 74, rating: 4.5, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["reflective", "collar"] },
    { category: "collars", name: "Breakaway Cat Collar", slug: "breakaway-cat-collar", brand: "SafeStride Demo", price: 329, discount: 0, stock: 70, rating: 4.4, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["breakaway", "collar"] },
    { category: "leashes", name: "CityWalk Adjustable Leash", slug: "citywalk-adjustable-leash", brand: "CityWalk Demo", price: 699, discount: 8, stock: 39, rating: 4.6, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["leash", "walking"] },
    { category: "leashes", name: "TrailFlex Long Line", slug: "trailflex-long-line", brand: "TrailFlex Demo", price: 899, discount: 10, stock: 25, rating: 4.5, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["training", "long line"] },
    { category: "bowls", name: "SteelServe Slow Feeder Bowl", slug: "steelserve-slow-feeder-bowl", brand: "SteelServe Demo", price: 649, discount: 0, stock: 58, rating: 4.5, species: [PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["slow feeder", "steel"] },
    { category: "bowls", name: "WhiskerDish Ceramic Cat Bowl", slug: "whiskerdish-ceramic-cat-bowl", brand: "WhiskerDish Demo", price: 529, discount: 5, stock: 42, rating: 4.4, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["ceramic", "cat bowl"] },
    { category: "carriers", name: "AiryRide Pet Carrier", slug: "airyride-pet-carrier", brand: "AiryRide Demo", price: 2399, discount: 12, stock: 16, rating: 4.6, species: [PetSpecies.CAT, PetSpecies.DOG], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["travel", "carrier"] },
    { category: "carriers", name: "FeatherSafe Bird Travel Case", slug: "feathersafe-bird-travel-case", brand: "FeatherSafe Demo", price: 1199, discount: 0, stock: 18, rating: 4.5, species: [PetSpecies.BIRD], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["bird", "travel"] },
    { category: "training", name: "ClickStart Training Clicker", slug: "clickstart-training-clicker", brand: "ClickStart Demo", price: 199, discount: 0, stock: 99, rating: 4.3, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["training", "clicker"] },
    { category: "training", name: "PuzzlePaws Treat Puzzle", slug: "puzzlepaws-treat-puzzle", brand: "PuzzlePaws Demo", price: 799, discount: 5, stock: 33, rating: 4.7, species: [PetSpecies.DOG, PetSpecies.CAT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["enrichment", "puzzle"] },
    { category: "food", name: "PurrPure Fish-Free Wet Meal", slug: "purrpure-fish-free-wet-meal", brand: "PurrPure Demo", price: 899, discount: 7, stock: 46, rating: 4.6, species: [PetSpecies.CAT], ageGroup: ProductAgeGroup.ADULT, tags: ["wet food", "fish-free"] },
    { category: "grooming", name: "FeatherFresh Bird Bath Spray", slug: "featherfresh-bird-bath-spray", brand: "FeatherFresh Demo", price: 379, discount: 0, stock: 27, rating: 4.4, species: [PetSpecies.BIRD], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["bird grooming", "bath"] },
    { category: "accessories", name: "HopHide Rabbit Tunnel", slug: "hophide-rabbit-tunnel", brand: "HopHide Demo", price: 699, discount: 8, stock: 24, rating: 4.5, species: [PetSpecies.RABBIT], ageGroup: ProductAgeGroup.ALL_LIFE_STAGES, tags: ["rabbit", "enrichment"] },
  ];

  const products = await Promise.all(
    productSeeds.map((product, index) => {
      const categoryId = categoryIds.get(product.category);
      if (!categoryId) throw new Error("Missing product category: " + product.category);
      return prisma.product.create({
        data: {
          categoryId,
          name: product.name,
          slug: product.slug,
          description: "Fictional demo marketplace product for PetCare Hub. Product suitability should be checked against the pet profile and label.",
          brand: product.brand,
          sku: "PCH-DEMO-" + String(index + 1).padStart(3, "0"),
          price: product.price,
          discountPercent: product.discount,
          images: ["/images/products/" + product.slug + ".jpg"],
          stock: product.stock,
          rating: product.rating,
          reviewCount: 8 + (index % 19),
          supportedSpecies: product.species,
          ageGroup: product.ageGroup,
          tags: product.tags,
        },
      });
    }),
  );

  await Promise.all(
    owners.map((owner, index) =>
      prisma.cart.create({
        data: {
          userId: owner.id,
          items: {
            create: [
              { productId: products[(index * 2) % products.length].id, quantity: 1 + (index % 2), unitPrice: products[(index * 2) % products.length].price },
              { productId: products[(index * 2 + 7) % products.length].id, quantity: 1, unitPrice: products[(index * 2 + 7) % products.length].price },
            ],
          },
        },
      }),
    ),
  );

  const orderStatuses: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PACKED, OrderStatus.CONFIRMED, OrderStatus.PLACED, OrderStatus.CANCELLED];
  await Promise.all(
    Array.from({ length: 20 }, async (_, index) => {
      const ownerIndex = index % owners.length;
      const owner = owners[ownerIndex];
      const address = addresses[ownerIndex];
      const selectedProducts = [products[(index * 3) % products.length], products[(index * 3 + 11) % products.length]];
      const items = selectedProducts.map((product, itemIndex) => {
        const quantity = itemIndex === 0 ? 1 + (index % 2) : 1;
        const unitPrice = Number(product.price);
        return { product, quantity, unitPrice, totalPrice: money(unitPrice * quantity) };
      });
      const subtotal = money(items.reduce((sum, item) => sum + item.totalPrice, 0));
      const discountAmount = index % 3 === 0 ? money(subtotal * 0.1) : 0;
      const deliveryFee = subtotal - discountAmount >= 999 ? 0 : 79;
      const status = orderStatuses[index % orderStatuses.length];
      const placedAt = dateAt(-60 + index * 3, 14);
      const isConfirmed = status === OrderStatus.CONFIRMED || status === OrderStatus.PACKED || status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED;
      const isShipped = status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED;
      return prisma.order.create({
        data: {
          userId: owner.id,
          orderNumber: "PCH-2026-" + String(index + 1).padStart(4, "0"),
          status,
          paymentStatus: status === OrderStatus.CANCELLED ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
          paymentMethod: "MOCK_UPI",
          paymentReference: "mock-payment-" + String(index + 1).padStart(4, "0"),
          subtotal,
          discountAmount,
          deliveryFee,
          total: money(subtotal - discountAmount + deliveryFee),
          couponCode: discountAmount > 0 ? "WELCOME10" : undefined,
          recipientName: address.recipientName,
          recipientPhone: address.phone,
          shippingAddressLine1: address.line1,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPinCode: address.pinCode,
          placedAt,
          confirmedAt: isConfirmed ? dateAt(-59 + index * 3) : undefined,
          shippedAt: isShipped ? dateAt(-57 + index * 3) : undefined,
          deliveredAt: status === OrderStatus.DELIVERED ? dateAt(-55 + index * 3) : undefined,
          cancelledAt: status === OrderStatus.CANCELLED ? dateAt(-58 + index * 3) : undefined,
          cancellationReason: status === OrderStatus.CANCELLED ? "Demo cancelled order" : undefined,
          items: {
            create: items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productSku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
      });
    }),
  );

  const serviceSeeds = [
    { provider: 0, category: ServiceCategory.VETERINARY, name: "At-home wellness visit", price: 1200, duration: 45, species: [PetSpecies.DOG, PetSpecies.CAT] },
    { provider: 0, category: ServiceCategory.SITTING, name: "Half-day pet sitting", price: 850, duration: 240, species: [PetSpecies.DOG, PetSpecies.CAT, PetSpecies.BIRD] },
    { provider: 1, category: ServiceCategory.GROOMING, name: "Full coat grooming", price: 1100, duration: 90, species: [PetSpecies.DOG] },
    { provider: 1, category: ServiceCategory.GROOMING, name: "Gentle cat grooming", price: 900, duration: 75, species: [PetSpecies.CAT] },
    { provider: 2, category: ServiceCategory.WALKING, name: "Neighbourhood dog walk", price: 350, duration: 45, species: [PetSpecies.DOG] },
    { provider: 2, category: ServiceCategory.TRAINING, name: "Basic training session", price: 999, duration: 60, species: [PetSpecies.DOG] },
    { provider: 3, category: ServiceCategory.BOARDING, name: "Overnight pet boarding", price: 1500, duration: 1440, species: [PetSpecies.DOG, PetSpecies.CAT] },
    { provider: 3, category: ServiceCategory.SITTING, name: "Rabbit care visit", price: 600, duration: 60, species: [PetSpecies.RABBIT] },
    { provider: 4, category: ServiceCategory.PHOTOGRAPHY, name: "Outdoor pet portrait session", price: 2200, duration: 90, species: [PetSpecies.DOG, PetSpecies.CAT, PetSpecies.BIRD] },
    { provider: 4, category: ServiceCategory.PHOTOGRAPHY, name: "Home pet mini shoot", price: 1600, duration: 60, species: [PetSpecies.DOG, PetSpecies.CAT] },
  ];

  const services = await Promise.all(
    serviceSeeds.map((service, index) =>
      prisma.service.create({
        data: {
          providerId: serviceProviders[service.provider].id,
          category: service.category,
          name: service.name,
          description: "Fictional demo service listing for PetCare Hub local development.",
          price: service.price,
          durationMinutes: service.duration,
          supportedSpecies: service.species,
          imageUrl: "/images/services/demo-service-" + (index + 1) + ".jpg",
        },
      }),
    ),
  );

  const bookingStatuses = [
    ServiceBookingStatus.COMPLETED,
    ServiceBookingStatus.COMPLETED,
    ServiceBookingStatus.CANCELLED,
    ServiceBookingStatus.CONFIRMED,
    ServiceBookingStatus.PENDING,
  ];
  await Promise.all(
    Array.from({ length: 15 }, (_, index) => {
      const service = services[index % services.length];
      const pet = pets[index % pets.length];
      const provider = serviceProviders[serviceSeeds[index % serviceSeeds.length].provider];
      const status = bookingStatuses[index % bookingStatuses.length];
      return prisma.serviceBooking.create({
        data: {
          petId: pet.id,
          ownerId: pet.ownerId,
          serviceId: service.id,
          serviceProviderId: provider.id,
          scheduledAt: dateAt(-14 + index * 3, 10 + (index % 5)),
          durationMinutes: service.durationMinutes,
          status,
          price: service.price,
          notes: "Demo service booking note.",
          providerNotes: status === ServiceBookingStatus.COMPLETED ? "Demo service completed successfully." : undefined,
          completedAt: status === ServiceBookingStatus.COMPLETED ? dateAt(-14 + index * 3, 15) : undefined,
          cancelledAt: status === ServiceBookingStatus.CANCELLED ? dateAt(-15 + index * 3) : undefined,
          cancellationReason: status === ServiceBookingStatus.CANCELLED ? "Demo customer schedule conflict" : undefined,
        },
      });
    }),
  );

  await prisma.veterinarianPetAccess.createMany({
    data: pets.slice(0, 8).map((pet, index) => ({
      petId: pet.id,
      veterinarianId: veterinarians[index].id,
      grantedById: pet.ownerId,
      scope: "WRITE_HEALTH",
      grantedAt: dateAt(-30 + index),
    })),
  });

  await prisma.productRecommendation.createMany({
    data: pets.slice(0, 10).flatMap((pet, index) => [
      {
        petId: pet.id,
        productId: products[(index * 2) % products.length].id,
        reasons: ["Matches " + pet.species.toLowerCase() + " profile", "Suitable for the selected life stage"],
        score: 0.92,
      },
      {
        petId: pet.id,
        productId: products[(index * 2 + 7) % products.length].id,
        reasons: ["Supports everyday enrichment", "Based on product-category interest"],
        score: 0.78,
      },
    ]),
  });

  await prisma.review.createMany({
    data: [
      { userId: owners[0].id, veterinarianId: veterinarians[0].id, target: ReviewTarget.VETERINARIAN, rating: 5, comment: "Clear, calm demo consultation experience." },
      { userId: owners[1].id, veterinarianId: veterinarians[2].id, target: ReviewTarget.VETERINARIAN, rating: 5, comment: "Helpful fictional profile for testing the directory." },
      { userId: owners[2].id, serviceProviderId: serviceProviders[1].id, target: ReviewTarget.SERVICE_PROVIDER, rating: 4, comment: "Convenient demo grooming booking flow." },
      { userId: owners[3].id, serviceProviderId: serviceProviders[2].id, target: ReviewTarget.SERVICE_PROVIDER, rating: 5, comment: "Great demo walking service." },
      { userId: owners[4].id, productId: products[0].id, target: ReviewTarget.PRODUCT, rating: 5, comment: "Useful sample marketplace product." },
      { userId: owners[5].id, productId: products[8].id, target: ReviewTarget.PRODUCT, rating: 4, comment: "A good example product for the demo catalogue." },
    ],
  });

  await prisma.notification.createMany({
    data: owners.slice(0, 8).map((owner, index) => ({
      userId: owner.id,
      type: index % 2 === 0 ? "REMINDER" : "APPOINTMENT",
      title: index % 2 === 0 ? "A pet-care reminder is due soon" : "Your veterinary appointment is coming up",
      body: "This is an in-app notification generated by the local demo seed.",
      href: index % 2 === 0 ? "/reminders" : "/appointments",
      isRead: index > 5,
      readAt: index > 5 ? dateAt(-1) : undefined,
    })),
  });

  await prisma.aIConversation.create({
    data: {
      userId: owners[0].id,
      petId: pets[0].id,
      title: "Bruno's health summary",
      summary: "Demo conversation about a pet health summary and upcoming preventive care.",
      messages: {
        create: [
          { role: AIMessageRole.USER, content: "Show Bruno's health summary." },
          { role: AIMessageRole.ASSISTANT, content: "Bruno's demo profile shows a recent weight entry and an upcoming vaccination reminder. PetCare AI provides general information and is not a substitute for professional veterinary care." },
          { role: AIMessageRole.USER, content: "What should I ask at the next visit?" },
          { role: AIMessageRole.ASSISTANT, content: "You could ask about Bruno's weight trend, vaccination timing, diet, activity level, and any new changes you have observed." },
        ],
      },
    },
  });

  await prisma.aIConversation.create({
    data: {
      userId: owners[1].id,
      petId: pets[1].id,
      title: "Miso's food categories",
      summary: "Demo conversation about general food category selection.",
      messages: {
        create: [
          { role: AIMessageRole.USER, content: "What food categories might suit Miso?" },
          { role: AIMessageRole.ASSISTANT, content: "Based on the selected demo profile, you can browse adult cat food and wet-food categories. Check product labels and discuss dietary changes with a veterinarian if Miso has symptoms or special needs." },
        ],
      },
    },
  });

  console.info("PetCare Hub demo seed complete.");
  console.info("Demo password for every seeded account: " + DEMO_PASSWORD);
  console.info("Owner login: akhilesh.mehta@demo.petcarehub.in");
  console.info("Veterinarian login: aanya.rao@demo.petcarehub.in");
  console.info("Service provider login: ria.kapoor@demo.petcarehub.in");
  console.info("Admin login: admin@demo.petcarehub.in");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
