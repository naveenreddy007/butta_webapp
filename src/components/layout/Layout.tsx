import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import type { BusinessInfo } from "@/types";

interface LayoutProps {
  children: ReactNode;
  businessInfo: BusinessInfo;
}

export function Layout({ children, businessInfo }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header businessInfo={businessInfo} />
      <main className="flex-1">
        {children}
      </main>
      <Footer businessInfo={businessInfo} />
    </div>
  );
}