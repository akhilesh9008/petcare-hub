"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";

export const supportedLanguages = ["en", "hi", "es", "fr"] as const;
export type LanguageCode = (typeof supportedLanguages)[number];

type TranslationMap = Record<string, string>;

export const languageDetails: Record<LanguageCode, { label: string; nativeLabel: string; locale: string }> = {
  en: { label: "English", nativeLabel: "English", locale: "en-IN" },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", locale: "hi-IN" },
  es: { label: "Spanish", nativeLabel: "Español", locale: "es-ES" },
  fr: { label: "French", nativeLabel: "Français", locale: "fr-FR" },
};

const translations: Record<LanguageCode, TranslationMap> = {
  en: {
    "language.label": "Language",
    "language.english": "English",
    "language.hindi": "Hindi",
    "language.spanish": "Spanish",
    "language.french": "French",
    "auth.signIn": "Sign in",
    "auth.createAccount": "Create account",
    "auth.createYourSpace": "Create your space",
    "auth.welcomeBack": "Welcome back.",
    "auth.chooseWorkspace": "Choose the workspace that matches your account.",
    "auth.newHere": "New to PetCare Hub?",
    "auth.alreadyMember": "Already a member?",
    "auth.roleRequired": "Choose the workspace you registered for.",
    "auth.roleNotice": "Professional workspaces are for local-demo use. In production, verify professional credentials before granting clinical or business access.",
    "role.petOwner": "Pet owner",
    "role.petOwner.description": "Manage passports, care, services and pet life.",
    "role.veterinarian": "Veterinarian",
    "role.veterinarian.description": "Review authorized patient context and appointments.",
    "role.serviceProvider": "Service provider",
    "role.serviceProvider.description": "Manage your services, availability and bookings.",
    "role.admin": "Administrator",
    "role.admin.description": "Review platform operations in the demo workspace.",
    "nav.dashboard": "Dashboard",
    "nav.pets": "My Pets",
    "nav.insights": "Pet Insights",
    "nav.passport": "Digital passport",
    "nav.health": "Health",
    "nav.healthBand": "Health Band",
    "nav.veterinarians": "Veterinarians",
    "nav.appointments": "Appointments",
    "nav.calendar": "Care calendar",
    "nav.breeding": "Breeding match",
    "nav.social": "Pet social",
    "nav.places": "Pet-friendly places",
    "nav.marketplace": "Marketplace",
    "nav.services": "Services",
    "nav.reminders": "Reminders",
    "nav.ai": "PetCare AI",
    "nav.emergency": "Emergency",
    "nav.orders": "Orders",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.overview": "Overview",
    "nav.patients": "Patients",
    "nav.availability": "Availability",
    "nav.bookings": "Bookings",
    "nav.switchWorkspace": "Switch workspace",
    "nav.users": "Users",
    "nav.products": "Products",
    "nav.operations": "Operations",
  },
  hi: {
    "language.label": "भाषा",
    "language.english": "अंग्रेज़ी",
    "language.hindi": "हिन्दी",
    "language.spanish": "स्पेनिश",
    "language.french": "फ़्रेंच",
    "auth.signIn": "साइन इन करें",
    "auth.createAccount": "खाता बनाएँ",
    "auth.createYourSpace": "अपना स्थान बनाएँ",
    "auth.welcomeBack": "वापसी पर स्वागत है।",
    "auth.chooseWorkspace": "अपने खाते के अनुसार कार्यस्थान चुनें।",
    "auth.newHere": "क्या आप PetCare Hub पर नए हैं?",
    "auth.alreadyMember": "क्या आप पहले से सदस्य हैं?",
    "auth.roleRequired": "वही कार्यस्थान चुनें जिसके लिए आपका खाता पंजीकृत है।",
    "auth.roleNotice": "पेशेवर कार्यस्थान स्थानीय डेमो के लिए हैं। उत्पादन में क्लिनिकल या व्यवसायिक पहुँच देने से पहले प्रमाण-पत्र सत्यापित करें।",
    "role.petOwner": "पेट ओनर",
    "role.petOwner.description": "पासपोर्ट, देखभाल, सेवाएँ और पेट जीवन प्रबंधित करें।",
    "role.veterinarian": "पशु चिकित्सक",
    "role.veterinarian.description": "अधिकृत मरीजों का संदर्भ और अपॉइंटमेंट देखें।",
    "role.serviceProvider": "सेवा प्रदाता",
    "role.serviceProvider.description": "सेवाएँ, उपलब्धता और बुकिंग प्रबंधित करें।",
    "role.admin": "प्रशासक",
    "role.admin.description": "डेमो कार्यस्थान में प्लेटफ़ॉर्म संचालन देखें।",
    "nav.dashboard": "डैशबोर्ड",
    "nav.pets": "मेरे पालतू",
    "nav.insights": "पेट इनसाइट्स",
    "nav.passport": "डिजिटल पासपोर्ट",
    "nav.health": "स्वास्थ्य",
    "nav.healthBand": "हेल्थ बैंड",
    "nav.veterinarians": "पशु चिकित्सक",
    "nav.appointments": "अपॉइंटमेंट",
    "nav.calendar": "केयर कैलेंडर",
    "nav.breeding": "ब्रीडिंग मैच",
    "nav.social": "पेट सोशल",
    "nav.places": "पालतू-अनुकूल स्थान",
    "nav.marketplace": "मार्केटप्लेस",
    "nav.services": "सेवाएँ",
    "nav.reminders": "रिमाइंडर",
    "nav.ai": "PetCare AI",
    "nav.emergency": "आपातकाल",
    "nav.orders": "ऑर्डर",
    "nav.profile": "प्रोफ़ाइल",
    "nav.settings": "सेटिंग्स",
    "nav.overview": "अवलोकन",
    "nav.patients": "मरीज",
    "nav.availability": "उपलब्धता",
    "nav.bookings": "बुकिंग",
    "nav.switchWorkspace": "कार्यस्थान बदलें",
    "nav.users": "उपयोगकर्ता",
    "nav.products": "उत्पाद",
    "nav.operations": "संचालन",
  },
  es: {
    "language.label": "Idioma",
    "language.english": "Inglés",
    "language.hindi": "Hindi",
    "language.spanish": "Español",
    "language.french": "Francés",
    "auth.signIn": "Iniciar sesión",
    "auth.createAccount": "Crear cuenta",
    "auth.createYourSpace": "Crea tu espacio",
    "auth.welcomeBack": "Bienvenido de nuevo.",
    "auth.chooseWorkspace": "Elige el espacio de trabajo de tu cuenta.",
    "auth.newHere": "¿Nuevo en PetCare Hub?",
    "auth.alreadyMember": "¿Ya eres miembro?",
    "auth.roleRequired": "Elige el espacio de trabajo con el que registraste tu cuenta.",
    "auth.roleNotice": "Los espacios profesionales son para la demostración local. En producción, verifica las credenciales antes de conceder acceso clínico o comercial.",
    "role.petOwner": "Tutor de mascota",
    "role.petOwner.description": "Gestiona pasaportes, cuidados, servicios y la vida de tu mascota.",
    "role.veterinarian": "Veterinario",
    "role.veterinarian.description": "Revisa pacientes autorizados y sus citas.",
    "role.serviceProvider": "Proveedor de servicios",
    "role.serviceProvider.description": "Gestiona servicios, disponibilidad y reservas.",
    "role.admin": "Administrador",
    "role.admin.description": "Revisa las operaciones de la plataforma en la demo.",
    "nav.dashboard": "Panel",
    "nav.pets": "Mis mascotas",
    "nav.insights": "Información de mascotas",
    "nav.passport": "Pasaporte digital",
    "nav.health": "Salud",
    "nav.healthBand": "Pulsera de salud",
    "nav.veterinarians": "Veterinarios",
    "nav.appointments": "Citas",
    "nav.calendar": "Calendario de cuidados",
    "nav.breeding": "Encuentro de cría",
    "nav.social": "Social de mascotas",
    "nav.places": "Lugares aptos para mascotas",
    "nav.marketplace": "Tienda",
    "nav.services": "Servicios",
    "nav.reminders": "Recordatorios",
    "nav.ai": "PetCare AI",
    "nav.emergency": "Emergencia",
    "nav.orders": "Pedidos",
    "nav.profile": "Perfil",
    "nav.settings": "Ajustes",
    "nav.overview": "Resumen",
    "nav.patients": "Pacientes",
    "nav.availability": "Disponibilidad",
    "nav.bookings": "Reservas",
    "nav.switchWorkspace": "Cambiar espacio",
    "nav.users": "Usuarios",
    "nav.products": "Productos",
    "nav.operations": "Operaciones",
  },
  fr: {
    "language.label": "Langue",
    "language.english": "Anglais",
    "language.hindi": "Hindi",
    "language.spanish": "Espagnol",
    "language.french": "Français",
    "auth.signIn": "Se connecter",
    "auth.createAccount": "Créer un compte",
    "auth.createYourSpace": "Créez votre espace",
    "auth.welcomeBack": "Bon retour.",
    "auth.chooseWorkspace": "Choisissez l’espace correspondant à votre compte.",
    "auth.newHere": "Nouveau sur PetCare Hub ?",
    "auth.alreadyMember": "Déjà membre ?",
    "auth.roleRequired": "Choisissez l’espace pour lequel votre compte a été créé.",
    "auth.roleNotice": "Les espaces professionnels sont destinés à la démo locale. En production, vérifiez les qualifications avant d’accorder un accès clinique ou commercial.",
    "role.petOwner": "Propriétaire d’animal",
    "role.petOwner.description": "Gérez passeports, soins, services et vie de votre animal.",
    "role.veterinarian": "Vétérinaire",
    "role.veterinarian.description": "Consultez les patients autorisés et les rendez-vous.",
    "role.serviceProvider": "Prestataire de services",
    "role.serviceProvider.description": "Gérez vos services, disponibilités et réservations.",
    "role.admin": "Administrateur",
    "role.admin.description": "Consultez les opérations de la plateforme dans la démo.",
    "nav.dashboard": "Tableau de bord",
    "nav.pets": "Mes animaux",
    "nav.insights": "Informations animal",
    "nav.passport": "Passeport numérique",
    "nav.health": "Santé",
    "nav.healthBand": "Bracelet santé",
    "nav.veterinarians": "Vétérinaires",
    "nav.appointments": "Rendez-vous",
    "nav.calendar": "Calendrier de soins",
    "nav.breeding": "Mise en relation d’élevage",
    "nav.social": "Réseau animaux",
    "nav.places": "Lieux acceptant les animaux",
    "nav.marketplace": "Boutique",
    "nav.services": "Services",
    "nav.reminders": "Rappels",
    "nav.ai": "PetCare AI",
    "nav.emergency": "Urgence",
    "nav.orders": "Commandes",
    "nav.profile": "Profil",
    "nav.settings": "Paramètres",
    "nav.overview": "Vue d’ensemble",
    "nav.patients": "Patients",
    "nav.availability": "Disponibilités",
    "nav.bookings": "Réservations",
    "nav.switchWorkspace": "Changer d’espace",
    "nav.users": "Utilisateurs",
    "nav.products": "Produits",
    "nav.operations": "Opérations",
  },
};

interface LanguageContextValue {
  language: LanguageCode;
  locale: string;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const languageStorageKey = "petcare-hub-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved && supportedLanguages.includes(saved as LanguageCode)) setLanguage(saved as LanguageCode);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale: languageDetails[language].locale,
    setLanguage,
    t: (key, fallback) => translations[language][key] ?? translations.en[key] ?? fallback ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSelector({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { language, setLanguage, t } = useLanguage();
  return <label className={`inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 ${className}`}>
    <Languages size={17} className="text-teal-700" aria-hidden="true" />
    <span className="sr-only">{t("language.label")}</span>
    {!compact ? <span className="hidden sm:inline">{t("language.label")}</span> : null}
    <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="max-w-24 bg-transparent text-sm font-bold text-slate-700 outline-none" aria-label={t("language.label")}>
      {supportedLanguages.map((code) => <option key={code} value={code}>{languageDetails[code].nativeLabel}</option>)}
    </select>
  </label>;
}
