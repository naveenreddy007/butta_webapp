export const buttaBusinessInfo = {
  name: "Butta Convention",
  tagline: "Enduring bonds. Enduring value.",
  logo: "/logo/butta-logo.png", // We'll add the logo file
  
  // Location & Contact
  contact: {
    phone: "+91 88018 86108",
    email: "info@buttaconvention.com",
    address: "Madhapur, Hyderabad, Telangana - 500081",
    landmark: "Opposite Cyber Towers, KPHB Road",
    website: "https://buttagroup.com"
  },

  // Venue Details
  venue: {
    type: "Premium Wedding & Event Convention Hall",
    features: [
      "Indoor air-conditioned banquet hall",
      "Outdoor lawn area",
      "Modern architecture with blend of tradition",
      "Central location in Hyderabad IT corridor"
    ],
    capacity: {
      indoorSeating: "400-500 people",
      floatingCapacity: "Up to 1000 guests",
      parking: "120 cars & 200 two-wheelers",
      rooms: "2 bridal suites with AC"
    }
  },

  // Services
  services: [
    "In-house catering or client-chosen catering",
    "In-house or panel decorators", 
    "DJ services (in-house or external)",
    "Custom lighting & sound system",
    "Backup power & valet parking",
    "Alcohol permitted (with permission)"
  ],

  // Pricing
  pricing: {
    veg: { min: 750, max: 800, unit: "per plate" },
    nonVeg: { min: 850, max: 1000, unit: "per plate" },
    decoration: { min: 100000, unit: "starting from" },
    advance: { percentage: 30, refundable: false }
  },

  // Event Types
  eventTypes: [
    "Weddings", "Receptions", "Corporate Events", 
    "Cultural Programs", "Birthday Parties", 
    "Anniversary Celebrations", "Engagement Ceremonies"
  ],

  // Brand Colors (Green palette for eye-catching feel)
  branding: {
    primary: "#22c55e", // Green-500
    secondary: "#16a34a", // Green-600  
    accent: "#15803d", // Green-700
    light: "#dcfce7", // Green-100
    dark: "#14532d", // Green-900
    gold: "#f59e0b", // Amber-500 (from logo)
    red: "#ef4444" // Red-500 (from logo)
  },

  // Group Information
  group: {
    name: "Butta Group",
    description: "A diversified business group with presence in hospitality, textiles, and other sectors",
    website: "https://buttagroup.com"
  }
};