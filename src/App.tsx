import { useState } from "react";
import { Layout, HeroSection, Container } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuSection, MenuDataTest } from "@/components/menu";
import { ButtaFoodMenu } from "@/components/menu/ButtaFoodMenu";
import { MenuSelectionProvider } from "@/context/MenuSelectionContext";

// Sample business info - this would come from a config file later
const businessInfo = {
  name: "ARK Events",
  logo: "",
  contact: {
    phone: "+91 88018 86108",
    email: "info@arkevents.com",
    address: "Banjara Hills, Hyderabad, Telangana 500034"
  },
  branding: {
    primaryColor: "#d97706",
    secondaryColor: "#dc2626"
  }
};

type PageType = 'home' | 'butta-menu';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  if (currentPage === 'butta-menu') {
    return (
      <MenuSelectionProvider>
        <ButtaFoodMenu 
          businessInfo={businessInfo} 
          onNavigateBack={() => setCurrentPage('home')}
        />
      </MenuSelectionProvider>
    );
  }

  return (
    <MenuSelectionProvider>
      <Layout businessInfo={businessInfo}>
        <HeroSection 
          businessName={businessInfo.name}
          tagline="Premium event catering services with authentic South Indian and Hyderabadi cuisine"
        />
        
        {/* Development status section */}
        <section id="menu" className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Development Progress
              </h2>
              <p className="text-muted-foreground text-lg">
                Your modern catering website is taking shape!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✅ Layout Components
                  </CardTitle>
                  <CardDescription>
                    Responsive header, footer, and hero section with animations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">Header</Badge>
                    <Badge variant="secondary">Footer</Badge>
                    <Badge variant="secondary">Hero</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mobile-first design with Framer Motion animations and parallax effects.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✅ Menu Categories
                  </CardTitle>
                  <CardDescription>
                    Animated category cards with parallax effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">Animations</Badge>
                    <Badge variant="secondary">Parallax</Badge>
                    <Badge variant="secondary">Interactive</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Beautiful category display with Framer Motion animations and hover effects.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✅ PDF Generation
                  </CardTitle>
                  <CardDescription>
                    Professional menu PDFs with business branding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">jsPDF</Badge>
                    <Badge variant="secondary">Branding</Badge>
                    <Badge variant="secondary">Professional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate branded PDF menus with customer details, itemized pricing, and terms & conditions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12 space-x-4">
              <Button size="lg" className="px-8" onClick={() => setCurrentPage('butta-menu')}>
                View Butta Food Menu →
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Continue to Next Task →
              </Button>
            </div>
          </Container>
        </section>

        {/* Menu Categories Section */}
        <MenuSection businessInfo={businessInfo} />

        {/* Menu Data Demo */}
        <section className="py-16 bg-muted/30">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Menu Data System Demo
              </h2>
              <p className="text-muted-foreground text-lg">
                Live demonstration of the menu data loading and validation system
              </p>
            </div>
            
            <MenuDataTest />
          </Container>
        </section>
      </Layout>
    </MenuSelectionProvider>
  );
}

export default App;
