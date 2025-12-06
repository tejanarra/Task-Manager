import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./BootstrapClient";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Task Manager - AI-Powered Task Management & Productivity App | Free Online Tool",
  description: "Free AI-powered task manager with smart reminders, drag-and-drop prioritization, and dark mode. Organize tasks effortlessly with natural language AI assistant. Perfect for productivity and time management.",
  keywords: ["task manager", "AI task manager", "productivity app", "todo list", "task organizer", "reminder app", "free task manager", "time management", "project management", "task tracking", "daily planner", "teja narra"],
  authors: [{ name: "Teja Narra" }],
  creator: "Teja Narra",
  publisher: "Teja Narra",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tejanarra.github.io/Task-Manager/",
    siteName: "Task Manager",
    title: "Task Manager - AI-Powered Task Management & Productivity App",
    description: "Free AI-powered task manager with smart reminders, drag-and-drop prioritization, and dark mode. Boost your productivity with intelligent task organization.",
    images: [
      {
        url: "https://tejanarra.github.io/Task-Manager/OG_Logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Task Manager App Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Task Manager - AI-Powered Task Management & Productivity App",
    description: "Free AI-powered task manager with smart reminders, drag-and-drop prioritization, and dark mode.",
    creator: "@tejanarra",
    images: ["https://tejanarra.github.io/Task-Manager/OG_Logo-removebg-preview.png"],
  },
  applicationName: "Task Manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Task Manager",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`,
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico` },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`, sizes: "32x32", type: "image/png" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`, sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`, sizes: "180x180" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`, sizes: "167x167" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`, sizes: "152x152" },
    ],
  },
  other: {
    "msapplication-TileColor": "#007bff",
    "theme-color": "#007bff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
          rel="stylesheet"
        />
      </head>
      <body className={poppins.className} style={{ fontFamily: "'Poppins', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
