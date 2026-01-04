import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< HEAD
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";
=======
import { Suspense } from "react";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import NavigationProgress from "@/components/NavigationProgress";
>>>>>>> habyaad_dev

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UI Staff School Management System",
  description: "UI Staff School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
<<<<<<< HEAD
=======
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
>>>>>>> habyaad_dev
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
