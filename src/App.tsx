import { useState } from "react";
import LandingPage from "@/pages/LandingPage";
import KitchenPage from "@/pages/KitchenPage";
import { ButtaFoodMenu } from "@/components/menu/ButtaFoodMenu";
import { buttaBusinessInfo } from "@/data/businessInfo";

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
      <KitchenPage 
        businessInfo={businessInfo}
        onNavigateBack={() => setCurrentPage('home')}
      />
    );
  }

  // Main Client Website - Landing Page
  return (
    <div>
      <LandingPage />
      {/* Access Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setCurrentPage('catering-menu')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          🍽️ Menu Planner
        </button>
        <button
          onClick={() => setCurrentPage('kitchen')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          👨‍🍳 Kitchen Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;