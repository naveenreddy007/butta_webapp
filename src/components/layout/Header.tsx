import { motion } from "framer-motion";
import { Menu, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusinessInfo } from "@/types";

interface HeaderProps {
  businessInfo: BusinessInfo;
}

export function Header({ businessInfo }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        {/* Top contact bar - hidden on mobile */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-muted-foreground border-b">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{businessInfo.contact.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{businessInfo.contact.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{businessInfo.contact.address}</span>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            {businessInfo.logo && (
              <img
                src={businessInfo.logo}
                alt={businessInfo.name}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {businessInfo.name}
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Professional Catering Services
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:flex items-center space-x-6"
          >
            <a
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Browse Menu
            </a>
            <a
              href="#about"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              About Us
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </a>
            <Button size="sm" className="ml-4 touch-manipulation">
              Get Quote
            </Button>
          </motion.nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden touch-manipulation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}