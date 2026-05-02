import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "The Elite English Academy | Personal English Teacher",
    template: "%s | The Elite English Academy",
  },
  description:
    "Warm, structured English classes for school learners with a clean, parent-friendly learning experience.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${plusJakartaSans.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
