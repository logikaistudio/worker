import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { DataProvider } from "@/context/DataContext";


export const metadata: Metadata = {
    title: "WORKer - HRMS",
    description: "Modern Human Resource Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body>
                <DataProvider>
                    <div className="flex min-h-screen bg-gray-50">
                        <Navigation />
                        <main className="flex-1 lg:ml-64">
                            <div className="p-4 md:p-6 lg:p-8">
                                {children}
                            </div>
                        </main>
                    </div>
                </DataProvider>
            </body>
        </html>
    );
}
