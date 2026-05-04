import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { addDays, setHours, subDays } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATS = [
  { slug: "adventure",    name: "Adventure" },
  { slug: "food-drink",   name: "Food & Drink" },
  { slug: "arts-culture", name: "Arts & Culture" },
  { slug: "wellness",     name: "Wellness" },
  { slug: "professional", name: "Professional" },
];

const SAMPLE_EXPERIENCES = [

  // ════════════════════════════════════════════════════════════════════
  // ADVENTURE  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-adventure-sunrise-hike",
    title: "Sunrise Hike in Saxon Switzerland",
    short: "Catch the first light from the Bastei Bridge with a local mountain guide.",
    cat: "adventure", price: 6500, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Sächsische Schweiz",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-cycling-tour",
    title: "Tempelhofer Feld Cycling Tour",
    short: "Explore Berlin's iconic abandoned airport turned public park on two wheels.",
    cat: "adventure", price: 3500, max: 15, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Tempelhof",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-bouldering",
    title: "Beginner Bouldering Session",
    short: "All gear included — a friendly, structured intro to indoor bouldering.",
    cat: "adventure", price: 4000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Friedrichshain",
    images: [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-kayaking",
    title: "Kayaking on the Müggelsee",
    short: "Paddle Berlin's largest lake with a certified kayak guide — no experience needed.",
    cat: "adventure", price: 5500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Köpenick",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-rock-climbing",
    title: "Outdoor Rock Climbing in the Elbsandstein",
    short: "Scale real sandstone towers with a certified UIAA climbing guide.",
    cat: "adventure", price: 8500, max: 6, duration: 300, difficulty: "HARD" as const,
    location: "Elbsandsteingebirge",
    images: [
      "https://images.unsplash.com/photo-1486899430790-61dbf6f6d98b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-paragliding",
    title: "Tandem Paragliding over the Havel Lakes",
    short: "Soar above Berlin's western lakes strapped to an experienced paragliding pilot.",
    cat: "adventure", price: 14500, max: 4, duration: 180, difficulty: "EASY" as const,
    location: "Potsdam Havel",
    images: [
      "https://images.unsplash.com/photo-1601999077603-cc5571b01eea?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-sailing",
    title: "Sailing Lesson on the Wannsee",
    short: "Learn to tack, gybe, and trim sails on Berlin's most scenic sailing lake.",
    cat: "adventure", price: 9500, max: 6, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Wannsee",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559599238-308793637427?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-sup",
    title: "Stand-Up Paddleboard Tour on the Spree",
    short: "Glide through central Berlin on a SUP board — steady, calm, spectacular views.",
    cat: "adventure", price: 4500, max: 12, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-parkour",
    title: "Parkour & Freerunning Basics",
    short: "Move through the city differently — a certified coach teaches you safe fundamentals.",
    cat: "adventure", price: 5000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-urban-exploration",
    title: "Urban Exploration: Hidden Berlin",
    short: "Discover forgotten bunkers, rooftops, and tunnels with a licensed urban explorer.",
    cat: "adventure", price: 7500, max: 6, duration: 240, difficulty: "HARD" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // FOOD & DRINK  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-food-street-food-tour",
    title: "Berlin Street-Food Walking Tour",
    short: "Five stops, five cuisines — discover the stories behind Kreuzberg's food scene.",
    cat: "food-drink", price: 5500, max: 12, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sourdough",
    title: "Sourdough Bread Workshop",
    short: "Take home your own live starter and a freshly baked loaf from a professional baker.",
    cat: "food-drink", price: 9500, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Potsdam",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-wine-tasting",
    title: "Natural Wine Tasting Evening",
    short: "Six low-intervention wines, tasting notes, and a certified sommelier guiding you.",
    cat: "food-drink", price: 7500, max: 10, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sushi",
    title: "Sushi Rolling Masterclass",
    short: "Master nigiri, maki, and hand rolls under the guidance of a Japanese chef.",
    cat: "food-drink", price: 8500, max: 8, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-vegan-cooking",
    title: "Vegan Plant-Based Cooking Class",
    short: "Cook a three-course plant-based feast — bold flavours, zero compromise.",
    cat: "food-drink", price: 7000, max: 8, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-craft-beer",
    title: "Craft Beer Brewery Tour & Tasting",
    short: "Go behind the tanks, learn the brewing process, and taste seven seasonal beers.",
    cat: "food-drink", price: 6000, max: 14, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-chocolate",
    title: "Artisan Chocolate Truffle Making",
    short: "Temper chocolate, craft ganache fillings, and go home with a box of your truffles.",
    cat: "food-drink", price: 7500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg",
    images: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-ramen",
    title: "Ramen from Scratch Workshop",
    short: "Brew your own tonkotsu broth, hand-pull noodles, and plate a bowl to be proud of.",
    cat: "food-drink", price: 9000, max: 6, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-cheese-making",
    title: "Artisan Cheese Making Workshop",
    short: "Stretch mozzarella, ladle ricotta, and press your own wheel of aged cheese.",
    cat: "food-drink", price: 8000, max: 8, duration: 210, difficulty: "MEDIUM" as const,
    location: "Potsdam",
    images: [
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-market-cooking",
    title: "Market-to-Table Cooking Experience",
    short: "Shop the Markthalle Neun with a chef, then cook a seasonal meal together.",
    cat: "food-drink", price: 11000, max: 6, duration: 300, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // ARTS & CULTURE  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-arts-pottery",
    title: "Pottery Wheel Throwing for Beginners",
    short: "Shape your own bowl on the wheel in a light-filled Wedding studio.",
    cat: "arts-culture", price: 8500, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Wedding",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-photography",
    title: "Mindful Photography Walk",
    short: "Slow down and train your eye. Phone or camera both welcome.",
    cat: "arts-culture", price: 5000, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764b8?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-street-art",
    title: "Berlin Street Art & Graffiti Tour",
    short: "Murals, paste-ups, and tags across Kreuzberg and Friedrichshain with a working artist.",
    cat: "arts-culture", price: 4500, max: 14, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-watercolour",
    title: "Watercolour Painting for Adults",
    short: "Two hours of paint, paper, and a patient tutor. Zero experience required.",
    cat: "arts-culture", price: 6000, max: 8, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Schöneberg",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-calligraphy",
    title: "Modern Calligraphy & Hand Lettering",
    short: "Learn brush pen calligraphy and take home your own tools and practice sheets.",
    cat: "arts-culture", price: 5500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-darkroom",
    title: "Analogue Darkroom Photography",
    short: "Develop your own black-and-white film and make prints in a professional darkroom.",
    cat: "arts-culture", price: 9000, max: 4, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-improv",
    title: "Improv Comedy & Theater Workshop",
    short: "Yes-and your way through scenes, games, and laughter with a professional improv coach.",
    cat: "arts-culture", price: 4500, max: 12, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-mosaic",
    title: "Mosaic Art Workshop",
    short: "Cut, arrange, and grout coloured glass tiles into your own mosaic piece.",
    cat: "arts-culture", price: 7000, max: 8, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Wedding",
    images: [
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-berlin-wall",
    title: "Berlin Wall History & Art Walk",
    short: "Trace the Wall's path and decode Cold War murals with a historian guide.",
    cat: "arts-culture", price: 3500, max: 16, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-jazz-evening",
    title: "Jazz & Blues Listening Evening",
    short: "Curated vinyl session with a music historian — ears wide open, phones down.",
    cat: "arts-culture", price: 4000, max: 12, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // WELLNESS  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-wellness-forest-bathing",
    title: "Forest Bathing in Grunewald",
    short: "Three hours of guided sensory immersion in Berlin's ancient western forest.",
    cat: "wellness", price: 4500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Grunewald",
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sunset-yoga",
    title: "Sunset Yoga at Treptower Park",
    short: "Outdoor yoga flow by the Spree river as the sun dips below the skyline.",
    cat: "wellness", price: 2500, max: 20, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Treptow",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sound-healing",
    title: "Sound Healing & Breathwork Session",
    short: "Tibetan bowls, breath techniques, and a complete nervous-system reset.",
    cat: "wellness", price: 5500, max: 12, duration: 90, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-cold-plunge",
    title: "Cold Plunge & Sauna Ritual",
    short: "Nordic contrast therapy — alternating ice baths and sauna guided by a wellness coach.",
    cat: "wellness", price: 6500, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-morning-yoga",
    title: "Morning Yoga Flow in Tiergarten",
    short: "Start your day with a 90-minute vinyasa yoga class in Berlin's central park.",
    cat: "wellness", price: 2000, max: 15, duration: 90, difficulty: "EASY" as const,
    location: "Berlin Tiergarten",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-aerial-yoga",
    title: "Aerial Yoga Introduction",
    short: "Suspend yourself in a silk hammock and explore yoga from a whole new angle.",
    cat: "wellness", price: 5000, max: 8, duration: 90, difficulty: "MEDIUM" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-hot-yoga",
    title: "Hot Yoga Power Session",
    short: "Sweat through 26 postures in a heated studio — detoxify and energise.",
    cat: "wellness", price: 2800, max: 16, duration: 90, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-meditation",
    title: "Guided Meditation & Mindfulness",
    short: "One hour of guided breath-focused meditation for beginners and experienced alike.",
    cat: "wellness", price: 1800, max: 20, duration: 60, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg",
    images: [
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-pilates",
    title: "Reformer Pilates for Beginners",
    short: "Build core strength and mobility on the reformer machine in a small-group session.",
    cat: "wellness", price: 3500, max: 6, duration: 60, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-rooftop-yoga",
    title: "Rooftop Yoga at Sunrise",
    short: "Greet the day with yoga on a Berlin rooftop as the city wakes beneath you.",
    cat: "wellness", price: 3500, max: 10, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PROFESSIONAL  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-pro-resume-workshop",
    title: "Resume Workshop with a Senior Recruiter",
    short: "Two hours, your CV, brutally honest feedback from someone who reads 200 a week.",
    cat: "professional", price: 12000, max: 4, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-public-speaking",
    title: "Public Speaking & Presentation Coaching",
    short: "Master storytelling, slide design, and stage presence in one focused afternoon.",
    cat: "professional", price: 15000, max: 6, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-linkedin",
    title: "LinkedIn Profile & Personal Brand Masterclass",
    short: "Rewrite your profile live with a top-100 LinkedIn creator — results in one session.",
    cat: "professional", price: 9500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg (Online available)",
    images: [
      "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-negotiation",
    title: "Negotiation Skills Intensive",
    short: "Role-play real scenarios and learn frameworks used by top-tier dealmakers.",
    cat: "professional", price: 18000, max: 6, duration: 240, difficulty: "HARD" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-python",
    title: "Python for Complete Beginners",
    short: "Write your first scripts, automate tasks, and understand programming logic in a day.",
    cat: "professional", price: 14000, max: 6, duration: 480, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-ux-design",
    title: "UX Design Sprint: From Idea to Prototype",
    short: "Build a clickable product prototype using real UX methods in one intensive workshop.",
    cat: "professional", price: 16000, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-financial-planning",
    title: "Personal Finance & Investment Workshop",
    short: "Budgeting, ETFs, pension planning — a certified advisor demystifies your money.",
    cat: "professional", price: 11000, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-ai-productivity",
    title: "AI Tools for Productivity & Work",
    short: "Master ChatGPT, Notion AI, and automation tools to cut your workload in half.",
    cat: "professional", price: 8500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-freelancing",
    title: "Freelancing Masterclass: Launch Your Business",
    short: "From finding clients to pricing and contracts — everything to go independent.",
    cat: "professional", price: 13000, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Kreuzberg (Online available)",
    images: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-sales-psychology",
    title: "Sales Psychology & Persuasion Workshop",
    short: "Understand buying decisions and learn ethical persuasion techniques that convert.",
    cat: "professional", price: 14500, max: 8, duration: 210, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
] as const;

async function main() {
  // ── Clean up old variable-ID seed data ────────────────────────────
  const oldIds = await prisma.experience.findMany({
    where: { id: { startsWith: "seed_" } },
    select: { id: true },
  });
  if (oldIds.length > 0) {
    const ids = oldIds.map((e) => e.id);
    console.log(`🧹 Removing ${ids.length} old seed_ experiences…`);
    const slots = await prisma.timeSlot.findMany({
      where: { experienceId: { in: ids } }, select: { id: true },
    });
    const slotIds = slots.map((s) => s.id);
    await prisma.review.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.bookingEvent.deleteMany({ where: { booking: { timeSlotId: { in: slotIds } } } });
    await prisma.booking.deleteMany({ where: { timeSlotId: { in: slotIds } } });
    await prisma.wishlistItem.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.timeSlot.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.experience.deleteMany({ where: { id: { in: ids } } });
  }

  // ── Categories ────────────────────────────────────────────────────
  for (const c of CATS) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`✅ ${CATS.length} categories`);

  // ── Demo host ─────────────────────────────────────────────────────
  const host = await prisma.user.upsert({
    where: { clerkId: "demo_host" },
    update: {},
    create: {
      clerkId: "demo_host", role: "HOST",
      email: "demo-host@erlebnisly.test", name: "Demo Host",
      hostProfile: {
        create: { bio: "Experienced city guide.", location: "Berlin", isVerified: true },
      },
      mollieConnect: {
        create: {
          accessTokenEnc: "test_enc", refreshTokenEnc: "test_enc",
          expiresAt: new Date(Date.now() + 86400_000 * 30),
          mollieProfileId: "pfl_demo", chargesEnabled: true, isOnboarded: true,
        },
      },
    },
  });

  // ── Experiences + time slots ──────────────────────────────────────
  for (const x of SAMPLE_EXPERIENCES) {
    const cat = await prisma.category.findUnique({ where: { slug: x.cat } });
    if (!cat) continue;
    const exp = await prisma.experience.upsert({
      where: { id: x.id },
      update: { images: [...x.images], title: x.title, shortDescription: x.short },
      create: {
        id: x.id, hostId: host.id, categoryId: cat.id,
        title: x.title, shortDescription: x.short,
        description: `${x.short}\n\nFull description placeholder.`,
        location: x.location, durationMinutes: x.duration,
        maxParticipants: x.max, difficulty: x.difficulty,
        currency: "EUR", basePriceCents: x.price,
        minPriceCents: x.price, maxPriceCents: x.price,
        timezone: "Europe/Berlin", isPublished: true,
        images: [...x.images],
      },
    });
    for (const offsetDays of [3, 7, 14]) {
      const start = setHours(addDays(new Date(), offsetDays), 10);
      const end = new Date(start.getTime() + x.duration * 60_000);
      await prisma.timeSlot.upsert({
        where: { experienceId_startTime: { experienceId: exp.id, startTime: start } },
        update: {}, create: { experienceId: exp.id, startTime: start, endTime: end },
      });
    }
  }
  console.log(`✅ ${SAMPLE_EXPERIENCES.length} experiences with slots and images`);

  // ── Demo customer + bookings + reviews ────────────────────────────
  const demoCustomer = await prisma.user.upsert({
    where: { clerkId: "demo_customer" },
    update: {},
    create: {
      clerkId: "demo_customer", role: "CUSTOMER",
      email: "demo-customer@erlebnisly.test", name: "Anna Schmidt",
    },
  });

  const allExperiences = await prisma.experience.findMany({ include: { timeSlots: true } });
  const REVIEW_COMMENTS = [
    "Amazing experience, would do again!",
    "Our host was knowledgeable and friendly.",
    "Great way to spend an afternoon.",
    "Highly recommend — exceeded expectations.",
    "Perfectly organised, great value for money.",
    "Loved every moment — will bring friends next time!",
    "Exceeded all my expectations. Booked again already.",
    "Incredibly well run. Worth every cent.",
    "One of the best things I've done in Berlin.",
    "Super fun, very professional. Five stars.",
  ];

  for (let i = 0; i < 100; i++) {
    const exp = allExperiences[i % allExperiences.length];
    if (!exp || exp.timeSlots.length === 0) continue;
    const slotStart = subDays(new Date(), Math.floor(Math.random() * 180) + 2);
    const slotEnd = new Date(slotStart.getTime() + exp.durationMinutes * 60_000);
    const pastSlot = await prisma.timeSlot.create({
      data: { experienceId: exp.id, startTime: slotStart, endTime: slotEnd },
    });
    const participants = 1 + Math.floor(Math.random() * 3);
    const total = exp.basePriceCents * participants;
    const fee = Math.round(total * 0.15);
    const created = subDays(new Date(), Math.floor(Math.random() * 180));
    const booking = await prisma.booking.create({
      data: {
        userId: demoCustomer.id, timeSlotId: pastSlot.id, status: "COMPLETED",
        participantCount: participants, currency: "EUR",
        subtotalCents: total, totalPriceCents: total,
        platformFeeCents: fee, hostPayoutCents: total - fee,
        molliePaymentId: `tr_demo_${Date.now()}_${i}`, molliePaymentStatus: "paid",
        createdAt: created,
      },
    });
    if (Math.random() < 0.75) {
      await prisma.review.create({
        data: {
          bookingId: booking.id, userId: demoCustomer.id, experienceId: exp.id,
          rating: 4 + Math.floor(Math.random() * 2),
          comment: REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)],
        },
      });
    }
  }

  console.log("✅ 100 demo bookings with reviews");
  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
