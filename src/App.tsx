import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { ButtaFoodMenu } from "@/components/menu/ButtaFoodMenu";
import { buttaBusinessInfo } from "@/data/businessInfo";

// Kitchen Module imports
import KitchenLayout from "../kitchen/layout";
import KitchenPage from "../kitchen/page";

type PageType = 'home' | 'catering-menu' | 'kitchen';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // Business info for components
  const businessInfo = {
    name: buttaBusinessInfo.name,
    logo: buttaBusinessInfo.logo,
    contact: buttaBusinessInfo.contact,
    branding: {
      primaryColor: buttaBusinessInfo.branding.primary,
      secondaryColor: buttaBusinessInfo.branding.secondary
    }
  };

  // Handle navigation
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  // Render different pages based on current page
  if (currentPage === 'catering-menu') {
    return (
      <ButtaFoodMenu 
        businessInfo={businessInfo} 
        onNavigateBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'kitchen') {
    return (
      <KitchenLayout>
        <KitchenPage />
      </KitchenLayout>
    );
  }

  // Main Client Website - Landing Page
  return (
    <div>
      <LandingPage />
      {/* Kitchen Dashboard Access Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setCurrentPage('kitchen')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          🍳 Kitchen Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;