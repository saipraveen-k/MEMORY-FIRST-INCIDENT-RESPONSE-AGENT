import "./globals.css";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

export const metadata = {
  title: "IncidentOS — Memory-First Incident Response Agent",
  description: "An incident-response agent that remembers what happened last time. Built with Hindsight, RocketRide, and HydraDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#080c14] text-gray-100 min-h-screen">
        <Navbar />
        <Header />
        <main className="ml-64 p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
