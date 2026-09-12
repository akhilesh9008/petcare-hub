import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/features/language";
import { PetcareProvider } from "@/features/petcare-store";

export const metadata: Metadata = {
  title: "PetCare Hub | Everything your pet needs, in one place.",
  description: "A thoughtful digital operating system for pet ownership.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider><PetcareProvider>{children}</PetcareProvider></LanguageProvider>
      </body>
    </html>
  );
}
