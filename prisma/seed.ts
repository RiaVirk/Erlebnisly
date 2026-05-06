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

const HOSTS = [
  {
    key: "adventure",
    clerkId: "demo_host_adventure",
    email: "max.berger@erlebnisly.test",
    name: "Max Berger",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Certified mountain and wilderness guide with 12 years leading outdoor adventures across Germany and the Alps. Max holds UIAA climbing certifications, a European sailing licence, and has guided over 2,000 participants safely through wilderness experiences. His philosophy: anyone can find their edge in the outdoors — you just need the right guide.",
    location: "Berlin / Saxon Switzerland",
  },
  {
    key: "food-drink",
    clerkId: "demo_host_food",
    email: "lena.fischer@erlebnisly.test",
    name: "Lena Fischer",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    bio: "Former sous-chef at a two-Michelin-star Berlin restaurant, Lena left fine dining to share her passion for food directly with people. She studied pastry in Lyon, fermentation in Tokyo, and spent two years travelling Asia documenting street food. Today she runs immersive cooking experiences that are as educational as they are delicious.",
    location: "Berlin Kreuzberg",
  },
  {
    key: "arts-culture",
    clerkId: "demo_host_arts",
    email: "sophie.mueller@erlebnisly.test",
    name: "Sophie Müller",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    bio: "Contemporary artist, illustrator, and art educator based in Berlin since 2011. Sophie's work has been exhibited across Europe and she has taught at the Weißensee School of Art. She believes creativity is a skill, not a talent — and that everyone has a unique visual voice waiting to be unlocked. Her workshops are relaxed, practical, and genuinely transformative.",
    location: "Berlin Wedding",
  },
  {
    key: "wellness",
    clerkId: "demo_host_wellness",
    email: "thomas.klein@erlebnisly.test",
    name: "Thomas Klein",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
    bio: "500-hour certified yoga teacher, breathwork facilitator, and cold-exposure coach trained in the Wim Hof Method. Thomas spent three years living in an ashram in Rishikesh before returning to Berlin to make ancient wellness practices accessible to modern city dwellers. His sessions blend rigorous science with deep somatic awareness.",
    location: "Berlin Prenzlauer Berg",
  },
  {
    key: "professional",
    clerkId: "demo_host_pro",
    email: "julia.wagner@erlebnisly.test",
    name: "Julia Wagner",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    bio: "Executive coach, TEDx speaker, and former VP at a Berlin tech unicorn. Julia has advised over 300 professionals on career transitions, built two of her own startups, and holds a master's degree in Organisational Psychology from Humboldt University. Her workshops are intense, practical, and grounded in behavioural science — no fluff, real results.",
    location: "Berlin Mitte",
  },
] as const;

// Precise coordinates for each experience location
const COORDS: Record<string, { lat: number; lon: number }> = {
  "exp-adventure-sunrise-hike":   { lat: 50.9152, lon: 14.0739 }, // Bastei, Saxon Switzerland
  "exp-adventure-cycling-tour":   { lat: 52.4733, lon: 13.4008 }, // Tempelhofer Feld
  "exp-adventure-bouldering":     { lat: 52.5163, lon: 13.4548 }, // Friedrichshain
  "exp-adventure-kayaking":       { lat: 52.4399, lon: 13.6125 }, // Müggelsee
  "exp-adventure-rock-climbing":  { lat: 50.9128, lon: 14.0698 }, // Elbsandstein
  "exp-adventure-paragliding":    { lat: 52.4009, lon: 13.0596 }, // Potsdam Havel
  "exp-adventure-sailing":        { lat: 52.4209, lon: 13.1788 }, // Wannsee
  "exp-adventure-sup":            { lat: 52.5200, lon: 13.3766 }, // Spree, Berlin Mitte
  "exp-adventure-parkour":        { lat: 52.5380, lon: 13.4221 }, // Prenzlauer Berg
  "exp-adventure-urban-exploration": { lat: 52.5167, lon: 13.3833 }, // Berlin Mitte

  "exp-food-street-food-tour":    { lat: 52.4978, lon: 13.4071 }, // Kreuzberg
  "exp-food-sourdough":           { lat: 52.3906, lon: 13.0645 }, // Potsdam
  "exp-food-wine-tasting":        { lat: 52.5380, lon: 13.4221 }, // Prenzlauer Berg
  "exp-food-sushi":               { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-food-vegan-cooking":       { lat: 52.4811, lon: 13.4380 }, // Neukölln
  "exp-food-craft-beer":          { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-food-chocolate":           { lat: 52.5163, lon: 13.3030 }, // Charlottenburg
  "exp-food-ramen":               { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-food-cheese-making":       { lat: 52.3906, lon: 13.0645 }, // Potsdam
  "exp-food-market-cooking":      { lat: 52.4978, lon: 13.4071 }, // Kreuzberg

  "exp-arts-pottery":             { lat: 52.5512, lon: 13.3553 }, // Wedding
  "exp-arts-photography":         { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-arts-street-art":          { lat: 52.4978, lon: 13.4071 }, // Kreuzberg
  "exp-arts-watercolour":         { lat: 52.4836, lon: 13.3531 }, // Schöneberg
  "exp-arts-calligraphy":         { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-arts-darkroom":            { lat: 52.4811, lon: 13.4380 }, // Neukölln
  "exp-arts-improv":              { lat: 52.5380, lon: 13.4221 }, // Prenzlauer Berg
  "exp-arts-mosaic":              { lat: 52.5512, lon: 13.3553 }, // Wedding
  "exp-arts-berlin-wall":         { lat: 52.5351, lon: 13.3901 }, // East Side Gallery
  "exp-arts-jazz-evening":        { lat: 52.4811, lon: 13.4380 }, // Neukölln

  "exp-wellness-forest-bathing":  { lat: 52.4880, lon: 13.2364 }, // Grunewald
  "exp-wellness-sunset-yoga":     { lat: 52.4797, lon: 13.4709 }, // Treptower Park
  "exp-wellness-sound-healing":   { lat: 52.4811, lon: 13.4380 }, // Neukölln
  "exp-wellness-cold-plunge":     { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-wellness-morning-yoga":    { lat: 52.5145, lon: 13.3501 }, // Tiergarten
  "exp-wellness-aerial-yoga":     { lat: 52.5380, lon: 13.4221 }, // Prenzlauer Berg
  "exp-wellness-hot-yoga":        { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-wellness-meditation":      { lat: 52.5163, lon: 13.3030 }, // Charlottenburg
  "exp-wellness-pilates":         { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-wellness-rooftop-yoga":    { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte

  "exp-pro-resume-workshop":      { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-public-speaking":      { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-linkedin":             { lat: 52.5163, lon: 13.3030 }, // Charlottenburg
  "exp-pro-negotiation":          { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-python":               { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-ux-design":            { lat: 52.4978, lon: 13.4071 }, // Kreuzberg
  "exp-pro-financial-planning":   { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-ai-productivity":      { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
  "exp-pro-freelancing":          { lat: 52.4978, lon: 13.4071 }, // Kreuzberg
  "exp-pro-sales-psychology":     { lat: 52.5200, lon: 13.4050 }, // Berlin Mitte
};

const SAMPLE_EXPERIENCES = [

  // ════════════════════════════════════════════════════════════════════
  // ADVENTURE  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-adventure-sunrise-hike",
    hostKey: "adventure",
    title: "Sunrise Hike in Saxon Switzerland",
    short: "Catch the first light from the Bastei Bridge with a local mountain guide.",
    desc: "There is no better alarm clock than the Bastei Bridge at dawn. This guided hike begins before first light at the trailhead in the Sächsische Schweiz, following centuries-old sandstone paths through fog-filled valleys until you emerge on the famous bridge just as the sun breaks the horizon. The golden light on the rock formations is one of Germany's most spectacular natural sights — and most visitors never see it without crowds.\n\nYour guide Max knows every footpath, hidden viewpoint, and local legend in this UNESCO-protected landscape. The route is moderate — a mix of woodland trails and stone staircases — and suitable for anyone in reasonable fitness. Along the way you'll learn about the geology of the Elbe Sandstone Mountains and the history of the region.\n\nThe experience includes warm drinks and breakfast pastries at the summit. Small group of maximum 8 ensures a personal experience. Sturdy walking shoes and weather-appropriate layers are essential. Transfer options from Dresden city centre available on request.",
    cat: "adventure", price: 6500, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Sächsische Schweiz",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-cycling-tour",
    hostKey: "adventure",
    title: "Tempelhofer Feld Cycling Tour",
    short: "Explore Berlin's iconic abandoned airport turned public park on two wheels.",
    desc: "Tempelhofer Feld is one of Berlin's great urban miracles — a former Lufthansa and Nazi-era airport runway turned into 355 hectares of open parkland, entirely managed by its citizens. On a bike, the vast open tarmac feels like flying. This guided tour explores the whole perimeter and the hidden corners most visitors miss: the Cold War-era radar installations, the community gardens carved into the old runway edges, the urban kitesurfers, and the marathon training groups.\n\nMax leads the group at a relaxed pace with regular stops for history, stories, and photo opportunities. The flat surface and wide paths make this ideal for any fitness level, and bikes are available to hire on-site if you don't have one. The tour also crosses into the surrounding Neukölln and Tempelhof neighbourhoods, giving you a feel for authentic working-class Berlin.\n\nDuration is approximately 2 hours. The tour runs in sun or light rain — Berlin weather is part of the experience. Children on tag-alongs or cargo bikes are welcome.",
    cat: "adventure", price: 3500, max: 15, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Tempelhof",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-bouldering",
    hostKey: "adventure",
    title: "Beginner Bouldering Session",
    short: "All gear included — a friendly, structured intro to indoor bouldering.",
    desc: "Bouldering is climbing stripped back to its essentials: no ropes, no harness, just you, the wall, and the problem in front of you. It's as much a mental puzzle as a physical challenge, and that's exactly why beginners often find it more addictive than they expected. This structured intro session takes place at one of Berlin's best indoor bouldering gyms, where brightly colour-coded routes guide your progress from first moves to first real climbs.\n\nMax breaks the session into three phases: technique fundamentals on easy terrain, footwork drills to build body awareness, and then free exploration with coaching on the routes that challenge you most. All equipment is included — shoes, chalk bag, everything. The small group of maximum 8 means you get real individual attention, not just a safety briefing and a wave goodbye.\n\nNo previous climbing experience is needed. The session is physically engaging but not exhausting — you'll use muscles you forgot you had, but leave feeling accomplished rather than broken. Most participants book a second session within the week.",
    cat: "adventure", price: 4000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Friedrichshain",
    images: [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-kayaking",
    hostKey: "adventure",
    title: "Kayaking on the Müggelsee",
    short: "Paddle Berlin's largest lake with a certified kayak guide — no experience needed.",
    desc: "The Müggelsee is Berlin's largest lake — 7.4 kilometres long, ringed by forest, and blissfully free of motorboats on most days. A kayak lets you reach the reed-fringed northern shores and quiet inlets that are inaccessible any other way, where kingfishers dart and herons stand motionless in the shallows. This guided paddle covers the most scenic stretch of the lake, with a rest stop at a secluded beach halfway round.\n\nMax provides all equipment including sit-on-top kayaks (stable and beginner-friendly), paddles, buoyancy aids, and a full safety briefing before launch. The pace is gentle enough for complete beginners while still covering real ground. You'll learn basic paddle strokes, how to read water and wind, and how to capsize safely if needed — though conditions are usually calm.\n\nThe session runs for approximately 3 hours on the water. Bring sunscreen, a change of clothes, and something waterproof for your phone. The put-in point is a short walk from the S-Bahn Friedrichshagen station. Post-paddle coffee and cake at a nearby lakeside café is a popular optional add-on.",
    cat: "adventure", price: 5500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Köpenick",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-rock-climbing",
    hostKey: "adventure",
    title: "Outdoor Rock Climbing in the Elbsandstein",
    short: "Scale real sandstone towers with a certified UIAA climbing guide.",
    desc: "The Elbsandstein mountains contain some of Europe's most distinctive climbing: tall, smooth sandstone pillars rising from dense forest, with a strict traditional ethic — no bolt protection, only hand-tied knots in natural features. Climbing here feels like stepping into another century. This full-day guided session introduces you to real outdoor rock on beginner and intermediate routes under the patient instruction of a UIAA-certified guide.\n\nMax sets up top-rope anchors on carefully selected routes graded for your experience level. The day begins with ground-school — harness fitting, knot tying, belaying technique — before moving onto the rock. You'll complete multiple routes of increasing difficulty, receiving detailed feedback on technique between each attempt. The sandstone demands precision footwork and an understanding of friction, which is why climbers who train here become noticeably better, fast.\n\nThe session runs for approximately 5 hours including travel between crags. Maximum 6 participants. All technical equipment is provided. Participants must be comfortable with heights and have a reasonable level of general fitness. The drive from Dresden takes about 45 minutes — carpooling arrangements can be made on booking.",
    cat: "adventure", price: 8500, max: 6, duration: 300, difficulty: "HARD" as const,
    location: "Elbsandsteingebirge",
    images: [
      "https://images.unsplash.com/photo-1486899430790-61dbf6f6d98b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-paragliding",
    hostKey: "adventure",
    title: "Tandem Paragliding over the Havel Lakes",
    short: "Soar above Berlin's western lakes strapped to an experienced paragliding pilot.",
    desc: "Paragliding over the Havel lakes west of Berlin is the closest most people will ever come to the feeling of pure, unaided flight. You are not a passenger in a machine — you are suspended in a wing, reading the air, feeling lift develop beneath you and the whole landscape unfold in silence. The tandem format means Max handles all piloting while you simply experience it fully, hands free, looking out over Potsdam's palaces, the glittering lake network, and the forests stretching to the horizon.\n\nThe flight begins with a 20-minute briefing covering what to expect during launch, in the air, and on landing. Launch takes place from a gentle grass slope and is entirely smooth — no running, no drama. Typical flight duration is 20-40 minutes depending on thermal conditions; Max will extend the session as long as the air allows. The post-flight debrief covers the basics of paragliding if you're curious about learning.\n\nWeather-dependent: sessions are confirmed 24 hours in advance. Maximum weight 110kg per passenger. The launch site is accessible by car from Potsdam city centre in 20 minutes. Bring comfortable closed-toe shoes and avoid bulky jackets. GoPro footage can be arranged.",
    cat: "adventure", price: 14500, max: 4, duration: 180, difficulty: "EASY" as const,
    location: "Potsdam Havel",
    images: [
      "https://images.unsplash.com/photo-1601999077603-cc5571b01eea?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-sailing",
    hostKey: "adventure",
    title: "Sailing Lesson on the Wannsee",
    short: "Learn to tack, gybe, and trim sails on Berlin's most scenic sailing lake.",
    desc: "Learning to sail on the Wannsee is a Berlin rite of passage. The lake is wide enough to feel genuine open water but sheltered enough to learn safely, and the sailing club infrastructure is world-class — this is where generations of Berliners have learned their first tacks and gybes. This 4-hour introduction covers everything from rigging a dinghy to steering upwind, reading wind indicators, and managing a controlled capsize.\n\nMax is an RYA-qualified instructor who adapts the teaching pace to each group. Theory is kept to the absolute minimum needed to get you sailing independently — the rest is learned by doing. By the end of the session, most participants can complete a basic triangular course without guidance. You'll leave understanding how a sailing boat works and what to do if things go wrong.\n\nThe boat is a stable two-person training dinghy. All safety equipment is provided. The session is suitable for complete beginners but also offers real challenge for those who have sailed before and want to refine technique. The club café serves excellent coffee and Kuchen post-session.",
    cat: "adventure", price: 9500, max: 6, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Wannsee",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559599238-308793637427?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-sup",
    hostKey: "adventure",
    title: "Stand-Up Paddleboard Tour on the Spree",
    short: "Glide through central Berlin on a SUP board — steady, calm, spectacular views.",
    desc: "Standing on a paddleboard in the middle of the Spree with the Berlin skyline around you is a genuinely surprising experience — the city looks completely different from water level, quieter, more spacious, and yours. This guided tour starts near Museum Island and winds through some of the most iconic stretches of central Berlin before looping back through the canal network. The pace is relaxed enough that you're never more than a few seconds from steadiness.\n\nMax starts every session with 15 minutes of balance practice in shallow, calm water before the group moves onto the main river. SUP is genuinely accessible — within 20 minutes nearly everyone is standing confidently and paddling with reasonable control. All boards, paddles, and buoyancy aids are included. The boards are extra-wide and stable, specifically chosen for beginner comfort.\n\nThe tour covers approximately 6 kilometres over 2.5 hours. A dry bag is provided for your phone and valuables. The session runs in all weather except strong wind or lightning. Early morning slots give the calmest water and the best light for photos. Bring a swimsuit and a towel just in case — falling in is part of the fun.",
    cat: "adventure", price: 4500, max: 12, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-parkour",
    hostKey: "adventure",
    title: "Parkour & Freerunning Basics",
    short: "Move through the city differently — a certified coach teaches you safe fundamentals.",
    desc: "Parkour is not what most people think it is. It is not reckless jumping between rooftops — it is a methodical practice of moving through the environment more efficiently, more confidently, and more creatively than you currently do. In this introductory session, certified coach Max teaches precision jumps, controlled landings, safe rolls, and basic vaults in an outdoor urban environment in Prenzlauer Berg, using park benches, low walls, and concrete blocks as your training apparatus.\n\nThe session is structured as a proper sports coaching class: warm-up, technical drills, progressive challenges, and cool-down. The focus is on fundamentals — how to land without impact on your joints, how to read a surface before committing to it, and how to build movement confidence step by step. You will be surprised at how much progress you make in 2 hours with proper instruction.\n\nSuitable for ages 16 and above. Wear comfortable athletic clothing and flat-soled trainers (not running shoes with thick cushioning). No prior fitness training is required, but a basic level of mobility is helpful. Maximum 8 participants. The session can be run as a team-building activity for groups — ask about corporate bookings.",
    cat: "adventure", price: 5000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-urban-exploration",
    hostKey: "adventure",
    title: "Urban Exploration: Hidden Berlin",
    short: "Discover forgotten bunkers, rooftops, and tunnels with a licensed urban explorer.",
    desc: "Berlin is Europe's most layered city — every kilometre of its surface conceals decades of hidden history beneath. This is not a tourist tour. With licensed urban explorer Max, small groups of maximum 6 access legally permitted locations that include Cold War-era underground infrastructure, decommissioned industrial spaces, and historic building interiors that are never featured in guidebooks. Each session is different: the access, the routes, and the stories are never repeated.\n\nMax has spent 15 years documenting Berlin's underground and forgotten spaces. He knows which locations are safe, which are historically significant, and how to navigate them respectfully. The tour includes detailed historical context for everything you see — understanding what a place was built for transforms the experience of standing inside it. Photography is welcome and encouraged; this is some of the most visually arresting material in the city.\n\nDuration approximately 4 hours. Wear dark, comfortable clothing you don't mind getting dusty, and sturdy closed-toe shoes. A headlamp is provided. This experience is not suitable for claustrophobia or serious mobility limitations. Age 18+. Exact meeting point is shared 24 hours before the session.",
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
    hostKey: "food-drink",
    title: "Berlin Street-Food Walking Tour",
    short: "Five stops, five cuisines — discover the stories behind Kreuzberg's food scene.",
    desc: "Kreuzberg's food scene is one of the most diverse in Europe — and most of it is invisible unless you know where to look. This walking tour visits five carefully selected vendors across SO36 and the Turkish Market area, covering Lebanese shawarma, Vietnamese bánh mì, Georgian khachapuri, a legendary Turkish gözleme stall that has been operating since 1987, and a cult-status Berlin-style currywurst stand. Each stop includes a full portion and a conversation with the person who makes it.\n\nLena curates this tour based on quality and story rather than fame. Some of the best food on the route is served from carts with no Instagram presence and no English menu. Her knowledge of the community — she has lived in Kreuzberg for 14 years — means you get genuine introductions rather than tourist transactions. You leave not just full, but with a real sense of how this neighbourhood works.\n\nThe tour covers approximately 2.5 kilometres on foot over 3 hours. Wear comfortable walking shoes. The tour operates rain or shine. Dietary requirements including vegetarian, vegan, and halal can be accommodated with advance notice. Private tours for groups of up to 12 available on request.",
    cat: "food-drink", price: 5500, max: 12, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sourdough",
    hostKey: "food-drink",
    title: "Sourdough Bread Workshop",
    short: "Take home your own live starter and a freshly baked loaf from a professional baker.",
    desc: "Real sourdough is a living thing — a culture of wild yeast and lactobacillus bacteria that has been maintained for years, fed twice daily, and treated like a pet. This full-day workshop (6 hours) teaches you everything: how starters work biologically, how to mix, fold, and shape a proper open-crumb loaf, and how to score and bake it for maximum oven spring. You leave with your own active starter, a baked loaf still warm from the oven, and the knowledge to repeat the process independently.\n\nLena trained under two of Germany's most respected artisan bakers before opening her own bread lab in Potsdam. She has a talent for making the science accessible without dumbing it down. The workshop runs in small groups of maximum 8, and every participant works their own dough throughout. This is not a demonstration — you will get your hands in the mix from the first minute.\n\nThe day includes a working lunch of house-made bread with cultured butters and local cheeses. All ingredients are organic. Bring a 1-litre jar with a lid for taking your starter home. The workshop runs on weekends; early booking is essential as this is consistently our most sold-out experience.",
    cat: "food-drink", price: 9500, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Potsdam",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-wine-tasting",
    hostKey: "food-drink",
    title: "Natural Wine Tasting Evening",
    short: "Six low-intervention wines, tasting notes, and a certified sommelier guiding you.",
    desc: "Natural wine is the most exciting movement in European drinking right now — low intervention, high expression, genuinely different every vintage. This evening tasting introduces you to six bottles selected from small-production German and European natural producers: two orange wines, two minimal-sulphite reds, and two skin-contact whites that challenge everything you thought wine was supposed to taste like. Each wine is paired with a small food accompaniment chosen to reveal its character.\n\nLena is a certified sommelier who has spent the last three years specialising specifically in the natural wine movement. She presents each wine with its backstory — the grower, the region, the vintage conditions — and leads a structured tasting discussion that helps you build a vocabulary for what you're experiencing. By the end of the evening, you will be able to distinguish biodynamic from conventional production by taste alone.\n\nThe evening runs for approximately 2.5 hours in a private tasting room in Prenzlauer Berg. Wine is poured generously — this is a tasting, not a sip. Food is included. The format works beautifully as a date night or a small group celebration. Advance booking required; the room seats a maximum of 10.",
    cat: "food-drink", price: 7500, max: 10, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sushi",
    hostKey: "food-drink",
    title: "Sushi Rolling Masterclass",
    short: "Master nigiri, maki, and hand rolls under the guidance of a Japanese chef.",
    desc: "Sushi in Japan is a 400-year-old craft refined to an art form. Most of what is sold as sushi in Europe is a pale imitation. This masterclass teaches you the real thing: how to prepare sushi rice correctly (the most important and most overlooked step), how to slice fish with a Japanese knife, and how to construct nigiri, hosomaki, and temaki with the speed and precision of a professional. Chef Kenji — Lena's collaborator for this session — trained for five years in Osaka before moving to Berlin.\n\nThe workshop runs for 3 hours and covers: rice preparation, knife technique, fish handling and portioning, rolling mat technique, and presentation. All ingredients are sourced from the Fischmarkt that morning — sashimi-grade salmon, tuna, and yellowtail, plus quality nori, organic rice, and house-made condiments. You eat everything you make at the end, plus there is usually plenty left over.\n\nMaximum 8 participants. Vegetarian options available on request. Take-home instruction cards are provided so you can reproduce the techniques at home. A knife skills session can be added as a paid upgrade if you want to go deeper.",
    cat: "food-drink", price: 8500, max: 8, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-vegan-cooking",
    hostKey: "food-drink",
    title: "Vegan Plant-Based Cooking Class",
    short: "Cook a three-course plant-based feast — bold flavours, zero compromise.",
    desc: "Plant-based cooking is not about restriction — it is about discovering the full spectrum of flavour, texture, and technique that most meat-focused cooking never explores. This three-hour class produces a complete three-course feast: a raw starter using fermentation and curing techniques, a substantial main built around legumes and whole grains, and a dessert that proves chocolate and coconut cream are not a compromise. Every dish is satisfying enough to serve to the most committed carnivore at your table.\n\nLena draws on her travels through Southeast Asia and her professional pastry training to create recipes that are ambitious without being fiddly. The class is structured so that participants are actually cooking throughout — not watching demonstrations. You will learn knife skills, emulsification, how to build umami without meat, and the basics of fermentation that make plant-based food genuinely complex.\n\nAll ingredients are organic and locally sourced where possible. The three-course meal is eaten together at the end of the session. Recipe cards are provided. Maximum 8 participants. The class runs in English and German. Suitable for all skill levels from complete beginners to experienced home cooks wanting to expand their repertoire.",
    cat: "food-drink", price: 7000, max: 8, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-craft-beer",
    hostKey: "food-drink",
    title: "Craft Beer Brewery Tour & Tasting",
    short: "Go behind the tanks, learn the brewing process, and taste seven seasonal beers.",
    desc: "Berlin's craft beer scene grew out of a reaction against the industrialisation of German brewing — and the people making interesting beer here are as interesting as the beer itself. This tour visits a working microbrewery in Mitte, where the head brewer leads a 45-minute walkthrough of the full brewing process: mashing, lautering, boiling, fermentation, and conditioning. You see every tank, smell every stage, and understand why craft beer tastes different.\n\nThe tasting portion covers seven seasonal beers from the brewery's current lineup plus two guest beers from partner producers. Lena leads the sensory analysis — aroma, appearance, flavour, mouthfeel — and teaches you how to evaluate beer using the same framework professional judges use. You leave with the vocabulary to describe what you're tasting rather than just whether you like it.\n\nSession runs approximately 2.5 hours. Substantial snacks are served throughout. Water, bread, and palate cleansers between pours keep the tasting calibrated rather than chaotic. The brewing process involves standing for periods — comfortable shoes recommended. Under-18s may attend for the tour only (no tasting). Private brewery hire for groups of up to 14 available.",
    cat: "food-drink", price: 6000, max: 14, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-chocolate",
    hostKey: "food-drink",
    title: "Artisan Chocolate Truffle Making",
    short: "Temper chocolate, craft ganache fillings, and go home with a box of your truffles.",
    desc: "Fine chocolate is one of the most technically demanding crafts in the food world — the gap between good chocolate and great chocolate comes down to temperature control measured in single degrees. This workshop teaches you to temper couverture chocolate by hand to the correct crystalline structure, then use it to enrobe ganache centres you have made from scratch with real cream, butter, and flavour infusions. You go home with a beautiful box of 12 truffles and the knowledge of how they were made.\n\nLena trained in pastry in Lyon, where chocolate technique is treated as seriously as any other professional discipline. She explains the science as you work — why cocoa butter crystallises at specific temperatures, what makes bloom happen, and how to tell by feel and sound when temper is perfect. The studio in Charlottenburg is equipped with marble surfaces and professional tempering tools, which you use throughout the session.\n\nDuration 2.5 hours. All equipment and ingredients provided. Groups of up to 8. Dietary versions using dairy-free alternatives can be accommodated with advance notice. The workshop makes an excellent gift — vouchers available. Corporate team sessions can be booked for groups of up to 16 with advance notice.",
    cat: "food-drink", price: 7500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg",
    images: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-ramen",
    hostKey: "food-drink",
    title: "Ramen from Scratch Workshop",
    short: "Brew your own tonkotsu broth, hand-pull noodles, and plate a bowl to be proud of.",
    desc: "A proper bowl of ramen is 12 hours in the making. The tonkotsu broth alone requires pork bones to simmer at a rolling boil — not a gentle simmer — for a minimum of 8 hours to achieve its characteristic milky opacity and depth. In this full workshop, Lena guides you through the entire process from bones to bowl: making the broth, preparing the tare seasoning, hand-pulling fresh alkaline noodles, curing soft-boiled eggs, and composing the final bowl with chashu pork, nori, bamboo shoots, and scallions.\n\nThe session is intense but structured. You will understand ramen as a system of components rather than a single recipe, which means you can vary and personalise every element once you understand the principles. The noodle pulling in particular is deeply satisfying — and surprisingly achievable for a first attempt. Lena's ramen recipe was developed over three years of weekly iterations.\n\nDuration 4 hours. Maximum 6 participants (the noodle pulling station limits capacity). All ingredients are provided. Recipe pack sent digitally after the session. The workshop runs on weekend afternoons; the timing means you eat your ramen as a late lunch, which is exactly the right time for it.",
    cat: "food-drink", price: 9000, max: 6, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-cheese-making",
    hostKey: "food-drink",
    title: "Artisan Cheese Making Workshop",
    short: "Stretch mozzarella, ladle ricotta, and press your own wheel of aged cheese.",
    desc: "Cheese is one of humanity's oldest technologies — a method of preserving the nutrition of milk developed independently on every inhabited continent, producing thousands of distinct regional variations from the same basic inputs of milk, culture, and time. This workshop in Potsdam covers the most fundamental techniques: stretching hot curd into silky mozzarella, ladling fresh ricotta, and pressing a small wheel of semi-hard cheese that you take home to age. You leave with fresh cheese to eat immediately and aged cheese developing in your fridge.\n\nLena trained in cheese making in the Allgäu before moving to Berlin and brings a cheesemaker's precision to the teaching. The session explains the science alongside the craft — how acidity develops, what rennet does, why temperature matters at each stage. The milk used is full-fat organic from a Potsdam-area farm that Lena has worked with for three years.\n\nDuration 3.5 hours. Maximum 8 participants. The Potsdam location is accessible from Berlin Hauptbahnhof in 25 minutes by regional train. Vegetarian rennet is used throughout. A tasting board of reference cheeses is served during the session. Recipe pack and aging notes included.",
    cat: "food-drink", price: 8000, max: 8, duration: 210, difficulty: "MEDIUM" as const,
    location: "Potsdam",
    images: [
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-market-cooking",
    hostKey: "food-drink",
    title: "Market-to-Table Cooking Experience",
    short: "Shop the Markthalle Neun with a chef, then cook a seasonal meal together.",
    desc: "The Markthalle Neun in Kreuzberg is one of Europe's great food markets — a 19th-century iron-and-glass hall housing artisan cheese producers, small-batch charcutiers, micro-roastery coffee, and the best seasonal produce from Brandenburg farms. This experience begins with a 90-minute guided market walk where Lena introduces you to her trusted vendors, explains seasonal selection and how to evaluate quality, and makes all the purchasing decisions for the meal you are about to cook together.\n\nYou then move to Lena's private kitchen, where the market ingredients become a three-course seasonal menu. The menu is never fixed in advance because it depends entirely on what was best at the market that day. Cooking is hands-on and collaborative — this is not a cooking class with a recipe to follow, it is how a professional chef thinks through a meal from first ingredient to finished plate.\n\nDuration 5 hours including market walk and cooking. Maximum 6 participants. The experience runs on Saturday mornings to coincide with the market. Wine is paired with the lunch. Private bookings for couples or small groups are available. One of the most personal food experiences in the city.",
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
    hostKey: "arts-culture",
    title: "Pottery Wheel Throwing for Beginners",
    short: "Shape your own bowl on the wheel in a light-filled Wedding studio.",
    desc: "There is something disarmingly honest about pottery — the clay responds to exactly the pressure and attention you give it, no more and no less. The wheel amplifies every hesitation and rewards every moment of focus. This introductory session in Sophie's Wedding studio begins with wedging and centering, the two most fundamental and most challenging skills, then moves through opening, raising, and shaping a simple bowl form. By the end of the 2.5-hour session, most participants have a piece they are genuinely proud of.\n\nSophie teaches pottery as she was taught — attentively, patiently, and with a strong emphasis on touch over theory. The studio is light-filled and unhurried. There are no expectations about what your piece should look like; the goal is to understand how clay responds and to experience the particular focus that hand-work demands. First-time participants regularly describe it as the most meditative two hours they have had in years.\n\nAll materials and tools are provided. Your piece will be bisque-fired and available for collection or shipping 2 weeks after the session. Glazing is not covered in the introductory session but can be arranged separately. The studio accommodates maximum 6 participants per session to maintain a genuine teaching environment.",
    cat: "arts-culture", price: 8500, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Wedding",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-photography",
    hostKey: "arts-culture",
    title: "Mindful Photography Walk",
    short: "Slow down and train your eye. Phone or camera both welcome.",
    desc: "Most of us carry a camera everywhere now, but very few of us actually see. This walk through central Berlin — from Museum Island through the government quarter and down to the Spree embankment — is not about technique, gear, or settings. It is about perception: how to find a photograph in an ordinary scene, how to choose what to include and exclude, and how to make a deliberate image rather than a random one. Phone photographers are not just welcome — they are often the most liberated participants.\n\nSophie trained in fine art photography at the Weißensee Academy and has a particular interest in urban documentary work. She teaches through observation rather than instruction: the walk stops frequently at locations that reward visual attention, and participants are given specific prompts that reframe how they see the space around them. The editing session at the end of the walk covers just two things — crop and exposure — and shows how much difference they make.\n\nDuration 2.5 hours. Maximum 6 participants. Bring whatever camera or phone you own; no equipment recommendations or requirements. The walk covers approximately 3 kilometres at a very slow pace. Suitable for complete beginners and experienced photographers alike.",
    cat: "arts-culture", price: 5000, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-street-art",
    hostKey: "arts-culture",
    title: "Berlin Street Art & Graffiti Tour",
    short: "Murals, paste-ups, and tags across Kreuzberg and Friedrichshain with a working artist.",
    desc: "Berlin's street art scene is not decoration — it is an ongoing conversation about politics, memory, displacement, and identity conducted in public space by artists from 40 countries. This walking tour with working artist Sophie covers Kreuzberg and the Friedrichshain bank, decoding the semiotics of the pieces you will see: what the scale means, how illegal works differ from commissioned murals, what the recurring symbols reference, and which artists have achieved international recognition since starting on these walls.\n\nSophie has been part of the Berlin art community for 13 years and knows many of the artists personally. The tour includes introductions to ongoing projects, access to some works in private courtyards not visible from the street, and a discussion of how the neighbourhood's gentrification has changed the work being made. This is cultural analysis as much as art appreciation.\n\nThe tour covers approximately 3 kilometres over 3 hours. No photography restrictions. Running commentary available in English, German, and basic French. Groups of up to 14 are welcomed — the outdoor format allows flexibility. The tour is different every season as new work replaces old and the conversation on the walls evolves.",
    cat: "arts-culture", price: 4500, max: 14, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-watercolour",
    hostKey: "arts-culture",
    title: "Watercolour Painting for Adults",
    short: "Two hours of paint, paper, and a patient tutor. Zero experience required.",
    desc: "Watercolour is the most forgiving medium there is — every accident is potentially a beautiful effect, and the whole point is learning to work with the water rather than fighting it. This relaxed studio session in Schöneberg introduces complete beginners (and nervous returners) to the basics: wet-on-wet washes, layering, negative space, and the one brush technique that makes everything easier. You will produce three finished studies by the end of the 2-hour session.\n\nSophie teaches with the understanding that most adults arrive carrying a story about not being good at art. Her job is to dismantle that story in 120 minutes. She does this by structuring the session so that success is virtually guaranteed — the exercises are chosen to produce pleasing results regardless of experience, which builds enough confidence to start experimenting. Real artistic development follows from that confidence.\n\nAll materials are provided: professional-grade paper, a starter palette of pigments, and three brushes. Your finished pieces are yours to take home. The studio seats a maximum of 8 and the atmosphere is quiet and relaxed — this is not an art class, it is an hour off from everything else. Suitable for ages 16 and above. Private sessions for couples or small groups can be arranged.",
    cat: "arts-culture", price: 6000, max: 8, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Schöneberg",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-calligraphy",
    hostKey: "arts-culture",
    title: "Modern Calligraphy & Hand Lettering",
    short: "Learn brush pen calligraphy and take home your own tools and practice sheets.",
    desc: "Modern calligraphy uses brush pens and pointed nibs rather than the quills of traditional scripts, but the principles are unchanged: pressure creates thick strokes, release creates thin ones, and the rhythm of the mark is what gives handwriting its life. This 2.5-hour workshop teaches you the core alphabets — both a casual brush script and a more formal copperplate-influenced hand — and sends you home with your own set of tools and a practice workbook designed for independent development.\n\nSophie is self-taught in calligraphy, which means her teaching is exceptionally practical. She knows which habits are hardest to break for beginners, which exercises accelerate progress fastest, and how to diagnose exactly what is going wrong when a letter looks wrong. The session is structured: alphabet drills first, then words, then a finished piece that functions as an artwork in itself.\n\nAll materials are included in the price. The take-home kit contains the same brush pens used in the session, an ink refill, and a 24-page practice booklet. The workshop runs for a maximum of 8 participants. Wedding calligraphy, place cards, and signage commissions are available if the workshop sparks a new hobby. Popular as a creative gift.",
    cat: "arts-culture", price: 5500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-darkroom",
    hostKey: "arts-culture",
    title: "Analogue Darkroom Photography",
    short: "Develop your own black-and-white film and make prints in a professional darkroom.",
    desc: "The darkroom is one of the few places left in the world where magic still happens chemically. You expose your negative, slide the paper into developer, and watch — in complete silence, under red safelight — as an image appears from nothing. This 4-hour session in a professional Neukölln darkroom covers the complete analogue printing process: setting up an enlarger, test strips, f-stop printing, dodging and burning, and producing a finished archival silver gelatin print from your own 35mm negative.\n\nSophie has maintained an active darkroom practice alongside her digital work for 12 years. She teaches the process methodically, but always with an eye on the artistic decisions: exposure, contrast, cropping, paper choice. The session is technical — there is real chemistry involved — but Sophie makes it accessible and explains every step as it happens. You leave with a physical print that could not have been made any other way.\n\nBring your own 35mm negatives (shot on any speed film). If you do not have negatives, Sophie provides a selection of stock negatives for printing. All darkroom chemicals, paper, and equipment are provided. Maximum 4 participants due to space. The session runs for 4 hours and cannot be shortened — the process takes the time it takes.",
    cat: "arts-culture", price: 9000, max: 4, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-improv",
    hostKey: "arts-culture",
    title: "Improv Comedy & Theater Workshop",
    short: "Yes-and your way through scenes, games, and laughter with a professional improv coach.",
    desc: "The rules of improv comedy — yes-and, listen before you speak, make your partner look good — are also, it turns out, excellent rules for human life. This workshop with professional improv coach Sophie uses the techniques of long-form improvisation not to make comedians but to build presence, spontaneity, and the ability to think clearly under mild social pressure. The games are funny. The insights tend to be useful.\n\nThe session runs for 2.5 hours and moves through a structured sequence: physical warmups to release self-consciousness, listening exercises, two-person scene work, and a closing ensemble piece. Sophie creates an environment in which failure is genuinely funny rather than embarrassing — within 20 minutes most groups are surprising themselves. The session works as well for very reserved participants as for naturally outgoing ones.\n\nNo performance experience required. No audience — the session is entirely participatory. Maximum 12 participants. Works well as a team-building activity for groups of 6-12. Corporate sessions available on request with a post-session debrief on professional application of the techniques. All sessions run in English; bilingual English/German sessions available on request.",
    cat: "arts-culture", price: 4500, max: 12, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-mosaic",
    hostKey: "arts-culture",
    title: "Mosaic Art Workshop",
    short: "Cut, arrange, and grout coloured glass tiles into your own mosaic piece.",
    desc: "Mosaic is one of the oldest art forms that still looks completely contemporary. The basic technique — cutting tesserae, applying adhesive, setting in grout — has not changed in 2,000 years, but the results range from Byzantine grandeur to modernist precision depending on the hand that makes them. In this 3-hour workshop in Sophie's Wedding studio, you design and complete a finished mosaic piece using coloured glass, ceramic, and mirror tesserae on a prepared substrate that is ready to hang or display immediately after grouting.\n\nSophie teaches the session in three phases: design and layout (your composition, your colour choices), cutting and setting (the most satisfying part), and grouting and finishing. The tools are simple — nippers and spreaders — and the techniques transferable. Several participants have gone on to use mosaic in their own homes or gardens after attending this workshop. The materials are beautiful: hand-cut Venetian glass smalti alongside contemporary ceramic tile.\n\nAll materials and tools provided. Finished pieces vary in size from A5 to A4 depending on the design. Wear clothes you don't mind getting dusty — grouting is enthusiastic work. Maximum 8 participants. The studio is open between workshops if you want to return and make a larger piece; ask Sophie about studio hire.",
    cat: "arts-culture", price: 7000, max: 8, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Wedding",
    images: [
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-berlin-wall",
    hostKey: "arts-culture",
    title: "Berlin Wall History & Art Walk",
    short: "Trace the Wall's path and decode Cold War murals with a historian guide.",
    desc: "The Berlin Wall was not just a physical barrier — it was the most visible symbol of the Cold War's logic applied in concrete and wire, 155 kilometres long, costing over 100 human lives, and standing for 28 years before it fell in a night. Walking its former path with historian and guide Sophie gives you a completely different experience of the city: you see how it cut streets in half, how entire neighbourhoods were severed, and how the art that grew along both sides reflected the very different worlds it divided.\n\nThe walk follows the most historically dense section of the Wall's route, from the Brandenburg Gate through Checkpoint Charlie and along the East Side Gallery, which remains the largest outdoor gallery in the world. Sophie's historical commentary covers the political decisions that built the Wall, the stories of those who crossed it, and the decades-long process of reunification that followed its fall. The art on the Gallery is decoded piece by piece.\n\nDuration 3 hours, covering approximately 4 kilometres. No special equipment needed. Available in English, German, and French. Groups up to 16. A shorter 90-minute version focused on the East Side Gallery art alone is available on request. This tour is frequently booked by school groups and corporate visitors new to Berlin.",
    cat: "arts-culture", price: 3500, max: 16, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-jazz-evening",
    hostKey: "arts-culture",
    title: "Jazz & Blues Listening Evening",
    short: "Curated vinyl session with a music historian — ears wide open, phones down.",
    desc: "Before Spotify, before YouTube, before the cassette, music was listened to. Actively, attentively, as the primary activity of an evening. This curated vinyl listening session in a Neukölln jazz bar revives that practice: six sides of vinyl, presented in chronological order from 1950s bebop to 1970s fusion, with Sophie's commentary on each album's historical context, the musicians involved, and what to listen for. Phones away. Drinks available. Ears wide open.\n\nSophie has been a serious jazz listener for 20 years and studied music history at Humboldt University alongside her fine art degree. She curates these evenings to tell a story — each album is chosen to illuminate something the previous one set up. Participants frequently describe the experience as hearing music they thought they knew in a completely new way. The format also works as an excellent introduction to jazz for people who have never quite understood what the fuss is about.\n\nDuration 2 hours. Maximum 12 participants. The venue is a small, private room above a Neukölln jazz bar. Drinks can be ordered from the bar throughout. Advance booking essential. Themed evenings — Blue Note Records, Miles Davis retrospectives, German jazz — run quarterly and sell out quickly.",
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
    hostKey: "wellness",
    title: "Forest Bathing in Grunewald",
    short: "Three hours of guided sensory immersion in Berlin's ancient western forest.",
    desc: "Shinrin-yoku — forest bathing — emerged from Japanese preventive medicine research in the 1980s as a response to the chronic stress diseases of urban life. The practice involves slow, sensory immersion in forest environments, and the research behind it is substantial: measurable reductions in cortisol, blood pressure, and inflammatory markers, alongside documented improvements in immune function and mood. This 3-hour guided session in the Grunewald — Berlin's ancient western forest — teaches you the practice properly.\n\nThomas trained as a forest bathing guide under the international ANFT certification programme and has been running these sessions in the Grunewald year-round since 2019. The session involves very slow walking, guided sensory invitations, periods of sitting silence, and a tea ceremony in the forest. There is no exercise component; the point is deceleration. Most participants find the experience more challenging than expected at first, and more restorative than anything else they have tried.\n\nDuration 3 hours. Maximum 10 participants. Wear comfortable, weather-appropriate clothing in natural colours where possible. The forest is always cooler than the city — bring a layer. The session runs in all weather except thunder or heavy snow; forest bathing in light rain is considered by many to be the finest version. Transport from the S-Bahn Grunewald station on arrival.",
    cat: "wellness", price: 4500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Grunewald",
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sunset-yoga",
    hostKey: "wellness",
    title: "Sunset Yoga at Treptower Park",
    short: "Outdoor yoga flow by the Spree river as the sun dips below the skyline.",
    desc: "Yoga outdoors, on grass, as the sun goes down over the Spree — this is the experience that reminds you why you wanted to do yoga in the first place. The 75-minute flow class is a balanced vinyasa sequence designed specifically for the outdoor context: grounding postures that connect you with the earth, an extended standing sequence as energy peaks at midday, and a long, unhurried savasana as the light changes. The class is appropriate for all levels and most participants leave describing it as the best session they have done in months.\n\nThomas has been teaching outdoor yoga in Berlin's parks since 2016. His teaching style is technically precise but never earnest — he takes the yoga seriously and the environment joyfully. The Treptower Park location is chosen for its combination of flat grass, tree cover for shade, and the particular quality of late-afternoon light on the Spree. The Soviet War Memorial nearby adds a dimension of historical weight that grounds the practice in time and place.\n\nBring your own mat if you have one; mats available to borrow at no charge. Wear comfortable athletic clothing appropriate for the weather. The class runs in English and German simultaneously. No registration required for drop-in sessions, but booking guarantees your spot in this class of maximum 20. Sessions run April through October, weather permitting.",
    cat: "wellness", price: 2500, max: 20, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Treptow",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sound-healing",
    hostKey: "wellness",
    title: "Sound Healing & Breathwork Session",
    short: "Tibetan bowls, breath techniques, and a complete nervous-system reset.",
    desc: "Sound healing is one of the oldest human wellness practices — the use of vibration to shift physiological and psychological states. Tibetan singing bowls are not mystical objects; they produce sustained harmonic frequencies that activate the parasympathetic nervous system, slow brainwave patterns toward theta states, and create the same conditions that deep meditation achieves through years of practice. Combined with Thomas's breathwork sequence — based on coherent breathing and extended exhale techniques — the session produces a profoundly restorative state in approximately 60 minutes.\n\nThomas trained with two of Europe's most respected sound healing practitioners and integrates his breathwork certification to create sessions that are physiologically grounded rather than purely experiential. He explains what is happening and why at each stage, which many participants find makes the experience more accessible rather than less. The session takes place lying down on a mat with an eye mask; you do nothing except follow the breath cues and receive the sound.\n\nDuration 90 minutes including briefing and integration time. Maximum 12 participants. All equipment provided including mat, blanket, and eye mask. Wear loose, comfortable clothing you can lie flat in. The session is contraindicated during pregnancy and for those with certain neurological conditions — please check the FAQ before booking. Several participants book monthly as a regular reset practice.",
    cat: "wellness", price: 5500, max: 12, duration: 90, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-cold-plunge",
    hostKey: "wellness",
    title: "Cold Plunge & Sauna Ritual",
    short: "Nordic contrast therapy — alternating ice baths and sauna guided by a wellness coach.",
    desc: "The physiological response to cold water immersion is one of the most powerful stress adaptation mechanisms the human body has. A 2-minute cold plunge produces a norepinephrine release equivalent to 300% of baseline — which translates to sustained energy, improved mood, reduced inflammation, and a measurably heightened sense of mental clarity that lasts for hours. Alternated with sauna heat in the Nordic contrast tradition, the effect compounds: your cardiovascular system is trained, your tolerance to physical stress increases, and your relationship with discomfort changes permanently.\n\nThomas is trained in the Wim Hof Method and has guided hundreds of first-timers through their first cold plunge experience. His approach is informed and compassionate — he explains the physiology, manages the breath, and makes the experience transformative rather than traumatic. The session follows a structured protocol: sauna heat to 80°C, cold plunge at 8-10°C, rest, repeat. Total session time is 2 hours with 4 complete cycles.\n\nMaximum 8 participants. Bring a swimsuit, two towels, and flip flops. The facility provides everything else. Contraindicated for certain cardiovascular conditions — full list available on booking. This experience consistently receives the highest rebooking rate of any session on the platform.",
    cat: "wellness", price: 6500, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-morning-yoga",
    hostKey: "wellness",
    title: "Morning Yoga Flow in Tiergarten",
    short: "Start your day with a 90-minute vinyasa yoga class in Berlin's central park.",
    desc: "The best yoga class of the week is the one that sets the tone for everything that follows. This 90-minute morning vinyasa in the Tiergarten — Berlin's equivalent of Central Park — begins at 7:30am, before the cyclists and the joggers arrive, when the park is still in possession of its quiet. The sequence is energising without being aggressive: sun salutations to wake the body, a balanced standing sequence to build heat and stability, and a seated closing practice to land in the day with intention.\n\nThomas teaches in the classical vinyasa tradition with an attention to alignment that makes his classes suitable for beginners and genuinely challenging for experienced practitioners. He does not teach to the room — he teaches to each person. The outdoor environment adds an element of unpredictability that sharpens attention in ways that studio practice cannot. Wind, light, temperature, and sound all become part of the practice.\n\nMats available to borrow. Bring water and a light layer in cooler months. The class runs throughout the year; outdoor yoga in a Berlin October morning, wrapped in merino, is an experience worth having. Drop-in bookings accepted; regular spots available for those who want to make this a weekly practice. Session size maximum 15.",
    cat: "wellness", price: 2000, max: 15, duration: 90, difficulty: "EASY" as const,
    location: "Berlin Tiergarten",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-aerial-yoga",
    hostKey: "wellness",
    title: "Aerial Yoga Introduction",
    short: "Suspend yourself in a silk hammock and explore yoga from a whole new angle.",
    desc: "Aerial yoga suspends you in a silk hammock hung from the ceiling, allowing your spine to decompress fully — something that conventional yoga on the ground cannot achieve, regardless of how flexibly or how long you practice. Inversions that would take years of floor practice to access safely become available in your first session because the fabric supports your body weight completely. The experience combines the structural benefits of yoga, the proprioceptive challenge of being upside down, and an element of pure play that most adult movement practices have forgotten.\n\nThomas trained in aerial yoga in New York and has taught it in Berlin since 2018. His introductory session covers: how to use the hammock safely, basic standing and seated postures using the fabric for support, a supported backbend sequence, and a full inversion that most participants achieve in their first class. The session ends with a deeply restorative Shavasana in the hammock, cocooned and fully supported, which is unlike any relaxation experience previously encountered.\n\nMaximum 8 participants due to rigging capacity. The fabric hammocks are weight-rated to 200kg and adjusted for individual height. Wear fitted clothing — loose garments tangle. Hair tied back required. Not suitable during pregnancy. The studio is in Prenzlauer Berg, 10 minutes from the U2. Block bookings of 5 sessions available at a reduced rate.",
    cat: "wellness", price: 5000, max: 8, duration: 90, difficulty: "MEDIUM" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-hot-yoga",
    hostKey: "wellness",
    title: "Hot Yoga Power Session",
    short: "Sweat through 26 postures in a heated studio — detoxify and energise.",
    desc: "Hot yoga in a room heated to 37°C and 40% humidity is a genuinely different physiological experience from room-temperature practice. The heat allows muscles to open further and more safely than in cold conditions, the cardiovascular demand is increased without adding physical load, and the sweating produces a detoxification effect that practitioners consistently report as one of the most cleansing experiences in their regular practice. This 75-minute session follows a fixed sequence of 26 postures and 2 breathing exercises — the classical Bikram series — taught by Thomas in the traditional format.\n\nThe fixed sequence matters: because you know what is coming next, the mind is freed from anticipation and can focus entirely on the present posture. This is what makes the practice meditative in a way that improvised sequences cannot be. Thomas teaches the series with exacting precision and without music — the breath and the instructor's voice are the only sounds. Beginners are welcome; the sequence is designed to be accessible, and the heat is the only challenge in the first few sessions.\n\nBring two towels (one for the mat, one for yourself), a water bottle minimum 1 litre, and form-fitting clothing. Mats provided. Do not eat within 2 hours of the class. Arrive 15 minutes early for acclimatisation. Contraindicated for certain cardiovascular conditions. The room is in Mitte, accessible from multiple U and S-Bahn lines.",
    cat: "wellness", price: 2800, max: 16, duration: 90, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-meditation",
    hostKey: "wellness",
    title: "Guided Meditation & Mindfulness",
    short: "One hour of guided breath-focused meditation for beginners and experienced alike.",
    desc: "Most people have tried meditation. Very few have been properly taught. This introductory session in Charlottenburg covers the three meditation techniques most strongly supported by neuroscience research: focused attention (the basis of traditional mindfulness), open monitoring (which trains metacognitive awareness), and loving-kindness (which has the most robust evidence base for mood improvement). Thomas teaches all three in a single 90-minute session, giving you enough direct experience of each to understand which resonates and practice it independently.\n\nThomas has a background in both Buddhist contemplative traditions and secular Mindfulness-Based Stress Reduction (MBSR) as developed at the University of Massachusetts. He teaches without dogma — the techniques are presented as tools with measurable outcomes rather than spiritual practices requiring any particular belief. The session includes a short theory portion, three guided practices of approximately 15 minutes each, and a discussion of home practice protocols.\n\nMaximum 10 participants. No equipment required — chairs available for anyone who finds floor sitting uncomfortable. The session runs in English and German. A four-week introductory programme based on this session is available for those who want to establish a regular practice with ongoing support. One of the most frequently gifted experiences on the platform.",
    cat: "wellness", price: 1800, max: 20, duration: 60, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg",
    images: [
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-pilates",
    hostKey: "wellness",
    title: "Reformer Pilates for Beginners",
    short: "Build core strength and mobility on the reformer machine in a small-group session.",
    desc: "Clinical pilates — as distinct from the gym mat classes that use the name — is a precise, individualised method of movement re-education based on the original work of Joseph Pilates and refined through physiotherapy research. It addresses the things that conventional exercise ignores: spinal alignment, deep stabiliser activation, breathing mechanics, and the neural patterning behind chronic muscular tension. Thomas trained under a clinical pilates physiotherapist and teaches in a way that is closer to rehabilitation than fitness class.\n\nThe introductory session establishes your baseline: posture assessment, breathing pattern, lumbar stability, and any asymmetries or restrictions in your movement. From this assessment, Thomas designs a personalised sequence for the remainder of the session and provides a take-home programme. The session uses a reformer (the primary pilates apparatus) supplemented with small equipment. You do not need any previous pilates experience.\n\nMaximum 4 participants per session due to equipment capacity. The studio in Mitte has 4 full reformers and a clinical assessment area. Wear fitted athletic clothing. Bare feet required on the reformer. The assessment information is kept strictly confidential. A 6-session programme designed from your assessment is available at a discounted package rate. Particularly recommended for those with sedentary jobs, past injuries, or chronic back tension.",
    cat: "wellness", price: 3500, max: 6, duration: 60, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-rooftop-yoga",
    hostKey: "wellness",
    title: "Rooftop Yoga at Sunrise",
    short: "Greet the day with yoga on a Berlin rooftop as the city wakes beneath you.",
    desc: "Yoga on a rooftop in Berlin is, on a clear morning, one of the city's finest experiences — the skyline from Fernsehturm to the Funkturm stretching out below you, the city going about its business 15 storeys below, and above you nothing but sky. This 75-minute flow class uses the rooftop setting deliberately: grounding postures become paradoxically more powerful when you can see the horizon in every direction, and the exposure to wind and open air makes the practice feel genuinely elemental. The seasonal morning light in Berlin is extraordinary.\n\nThomas has been running rooftop yoga since 2021, in partnership with a boutique hotel in Mitte that opens its roof terrace exclusively for these sessions on weekend mornings. The class is open to all levels. The sequence adapts to the weather and the light: on cooler mornings it builds more heat, on still summer mornings it goes longer into restoration. This is not a fixed-format class — it responds to the day.\n\nMaximum 15 participants. Mats provided. Bring an additional layer in shoulder seasons. The roof is only accessible via the hotel — arrive at reception on time, as the group enters together. Access confirmed 48 hours in advance based on weather. Cancellation policy: full refund if the session is cancelled due to weather.",
    cat: "wellness", price: 3500, max: 10, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1593895791195-2396ee58f10e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PROFESSIONAL  (10 experiences)
  // ════════════════════════════════════════════════════════════════════
  {
    id: "exp-pro-resume-workshop",
    hostKey: "professional",
    title: "Resume Workshop with a Senior Recruiter",
    short: "Two hours, your CV, brutally honest feedback from someone who reads 200 a week.",
    desc: "Most CVs are not read — they are scanned for 6 seconds before being filed or deleted. Understanding how recruitment works at the top end of the Berlin job market completely changes how you write your CV, your LinkedIn profile, and your covering letter. This workshop with Julia covers the psychology of hiring decisions, the specific formatting conventions that work in German-speaking markets, how to quantify achievements rather than describe responsibilities, and how to handle the gaps, pivots, and non-linear career histories that characterise most people's actual experience.\n\nJulia has hired over 200 people during her corporate career and coached over 300 through major career transitions. Her perspective is from both sides of the table, which makes her feedback genuinely useful rather than generically encouraging. Each participant brings their current CV; feedback is direct, specific, and immediately actionable. By the end of the session, you will have a rewritten summary statement and at least two overhauled experience entries.\n\nMaximum 10 participants. Bring your current CV digitally and a notepad. The session runs in English; German CV conventions are also covered. LinkedIn profile review is included. Participants frequently report receiving significantly more interview invitations within 4 weeks of implementing the workshop recommendations. Private 1-to-1 coaching sessions available for accelerated results.",
    cat: "professional", price: 12000, max: 4, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-public-speaking",
    hostKey: "professional",
    title: "Public Speaking & Presentation Coaching",
    short: "Master storytelling, slide design, and stage presence in one focused afternoon.",
    desc: "Fear of public speaking outranks fear of death in most surveys — which means most people would rather be in the coffin than giving the eulogy. This is a rational response to social threat that can be systematically dismantled. This intensive workshop uses a combination of cognitive-behavioural techniques, deliberate practice protocols, and real-time performance coaching to produce measurable improvements in speaking confidence within 3 hours. Every participant speaks at least 4 times during the session.\n\nJulia has given 2 TEDx talks and trained over 150 corporate speakers. Her approach is evidence-based and practically focused: the session covers the three most common performance errors (speed, eye contact, and filler words), how to structure a talk for maximum retention, and the specific physical and breathing techniques that reduce the cortisol response that causes voice shaking and mental blanking. Video feedback is used in the final session segment.\n\nMaximum 8 participants. The small group is essential — this is not a seminar, it is a practice environment. Bring a 2-minute story or talk you can deliver. Session runs in English; bilingual sessions available. Corporate versions for teams preparing for presentations, pitches, or board meetings are a core offering — ask about advance booking for groups.",
    cat: "professional", price: 15000, max: 6, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-linkedin",
    hostKey: "professional",
    title: "LinkedIn Profile & Personal Brand Masterclass",
    short: "Rewrite your profile live with a top-100 LinkedIn creator — results in one session.",
    desc: "LinkedIn has 930 million users and a remarkably low quality ceiling — which means a well-optimised profile stands out immediately and dramatically increases inbound opportunity. This workshop teaches you how the LinkedIn algorithm works and how to position yourself for the specific outcomes you want: whether that is being found by recruiters, building a professional network in a new city, attracting clients, or establishing thought leadership in your field. Every participant leaves with a fully rewritten profile.\n\nJulia generated over 2 million LinkedIn impressions in 2023 without paid promotion, and has coached executives at major Berlin tech companies on their personal brand strategy. Her approach is strategic rather than tactical — she helps you define what you want LinkedIn to do for you, then structures your profile accordingly. The session is hands-on: you write and update your profile during the workshop with Julia reviewing each section in real time.\n\nMaximum 8 participants. Bring a laptop or tablet. The session covers profile headline, About section, experience descriptions, skills, featured content, and activity strategy. Connection and content strategy are also addressed. Follow-up office hours via video call available 2 weeks after the session to review progress and adjust approach.",
    cat: "professional", price: 9500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg (Online available)",
    images: [
      "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-negotiation",
    hostKey: "professional",
    title: "Negotiation Skills Intensive",
    short: "Role-play real scenarios and learn frameworks used by top-tier dealmakers.",
    desc: "Most people negotiate once a year — their annual salary review — and lose thousands of euros because they have never been taught. This workshop covers the complete framework for high-stakes negotiation: BATNA analysis, anchoring strategy, concession sequencing, how to read the other party's constraints, and how to handle the specific dynamics of German professional negotiation culture, which differs significantly from American frameworks. Role-plays using real scenarios submitted by participants make the practice immediately relevant.\n\nJulia has negotiated contracts worth over €50M across her corporate career and teaches negotiation at the Humboldt University executive education programme. Her approach integrates principled negotiation theory with the tactical psychology research from behavioural economics. The workshop is intensely practical — every concept is followed immediately by a practice scenario. Feedback is candid and specific.\n\nMaximum 8 participants. Pre-session questionnaire collects your current negotiation challenges for anonymised use in role-plays. The session runs in English; Germany-specific negotiation norms are covered throughout. A follow-up resource pack including script templates and preparation frameworks is sent after the session. Corporate versions for sales, procurement, and HR teams are a major part of Julia's practice.",
    cat: "professional", price: 18000, max: 6, duration: 240, difficulty: "HARD" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-python",
    hostKey: "professional",
    title: "Python for Complete Beginners",
    short: "Write your first scripts, automate tasks, and understand programming logic in a day.",
    desc: "Python is the most widely-used programming language in data science, AI development, automation, and applied research. This beginner workshop teaches it the right way: not through abstract syntax tutorials, but through solving real problems that a non-programmer encounters in professional life. In 3 hours you will automate a repetitive spreadsheet task, scrape publicly available data from a website, and write a script that sorts, filters, and exports a dataset. These are the three most common use cases for Python in non-technical jobs.\n\nJulia designed this workshop specifically for professionals in data, marketing, operations, and research roles who know they should learn to code but have not found an accessible entry point. She teaches with the assumption that you are smart but have zero programming background, and structures the session so that you produce working outputs from the first 30 minutes. The code you write is yours to keep and adapt.\n\nMaximum 10 participants. Bring a laptop with Python 3 and VS Code installed — installation instructions sent on booking. No prior programming experience required. The session runs in English. A follow-up set of five increasingly complex exercises is sent by email after the session to reinforce the concepts. A 4-week programme for those who want to reach an intermediate level is offered twice annually.",
    cat: "professional", price: 14000, max: 6, duration: 480, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-ux-design",
    hostKey: "professional",
    title: "UX Design Sprint: From Idea to Prototype",
    short: "Build a clickable product prototype using real UX methods in one intensive workshop.",
    desc: "Every digital product you use was designed by someone — and that person learned a set of principles, methods, and tools that can be taught. This workshop introduces UX design not as a complete career path but as a practical skill set that improves the work of anyone who creates, commissions, or evaluates digital products: product managers, marketers, engineers, founders, and communications professionals. In 3 hours you will conduct a miniature user research session, identify the core usability problem in a real app, and sketch a redesign solution.\n\nJulia was VP of Product at a Berlin SaaS company for four years and has consulted on digital product strategy for over 40 organisations. Her workshop teaching is based on the Double Diamond design process and incorporates real-world case studies from Berlin's tech ecosystem. The session is highly interactive: you work in pairs throughout, which mirrors the collaborative reality of product development.\n\nMaximum 10 participants. A laptop is helpful but not essential. The session runs in English. A curated reading list and tool recommendations are provided after the session. Participants frequently use the workshop as preparation for moving into product management roles. A 2-day intensive for those wanting a more complete introduction to UX design practice is offered quarterly.",
    cat: "professional", price: 16000, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-financial-planning",
    hostKey: "professional",
    title: "Personal Finance & Investment Workshop",
    short: "Budgeting, ETFs, pension planning — a certified advisor demystifies your money.",
    desc: "Most professionals know they should be doing something smarter with their money and do nothing because the subject feels overwhelming. This workshop dismantles that paralysis. In 3 hours Julia covers — with a certified financial advisor as co-presenter — the exact steps for someone earning a professional salary in Germany: understanding the German pension system and its gaps, choosing between an ETF-based investment portfolio and a Riester product, the basics of tax-efficient investing as an employee, and what an emergency fund should actually look like in Berlin's cost of living context.\n\nJulia approached financial literacy as a personal project after a period of financial instability early in her career, and spent three years building genuine expertise before adding this workshop to her offering. The co-presenter is a licensed German financial advisor who is legally permitted to give the specific guidance that Julia cannot. All recommendations are personalised to the German regulatory context — this is not generic financial influencer content.\n\nMaximum 10 participants. Bring a current payslip and a rough sense of your monthly expenses — the advice is significantly more useful when grounded in real numbers. All discussion is confidential. No products are sold at the session. A recommended reading list and a spreadsheet budgeting template are sent after. Private advisory sessions available for those who want individualised portfolio planning.",
    cat: "professional", price: 11000, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-ai-productivity",
    hostKey: "professional",
    title: "AI Tools for Productivity & Work",
    short: "Master ChatGPT, Notion AI, and automation tools to cut your workload in half.",
    desc: "AI tools have changed the economics of knowledge work permanently. The professionals who will thrive are not those who understand AI theoretically but those who have integrated specific tools into specific workflows and measured the results. This workshop covers the five tools that have produced the most documented productivity gains for Berlin's professional community: Claude/ChatGPT for advanced reasoning tasks, Perplexity for research, Notion AI for knowledge management, Make for workflow automation, and Midjourney for visual content. Every tool is used during the session on real tasks.\n\nJulia has spent 18 months systematically testing AI productivity tools and documenting the results, and teaches from this empirical base rather than from tech enthusiasm. She is also explicit about what AI tools do badly and what the costs are — this is not an uncritical advocacy session. By the end of the workshop, each participant has identified 3 specific workflow integrations they can implement in the following week.\n\nMaximum 10 participants. Bring a laptop. The session covers both free and paid tool tiers. Prompt engineering fundamentals are taught as part of the workshop. A curated toolkit document with setup instructions for each tool is shared after. The session runs in English; German-language AI tool equivalents are also covered. One of the fastest-selling workshops on the platform.",
    cat: "professional", price: 8500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-freelancing",
    hostKey: "professional",
    title: "Freelancing Masterclass: Launch Your Business",
    short: "From finding clients to pricing and contracts — everything to go independent.",
    desc: "Going freelance in Germany is simultaneously one of the best career decisions many professionals will make and one of the most administratively complex. This masterclass covers everything: registration as a Freiberufler vs. Gewerbetreibender, the tax obligations and how to manage them, how to set a day rate that covers everything including pension, health insurance, and vacation time, how to find the first clients without a network, and how to write contracts that protect you. This is the workshop Julia wishes she had before she went independent.\n\nJulia has been running her own consulting practice for 7 years and has also managed freelancers as a corporate buyer. Both perspectives inform her teaching. The workshop is structured around the chronology of going freelance: from making the decision, through the administrative setup, to landing and executing the first contract. Legal and tax information is provided in practical terms rather than hedged generalities.\n\nMaximum 8 participants. The session runs in English with German administrative terminology covered. A legal and tax checklist specific to Berlin freelancers is provided. A recommended Steuerberater (accountant) network for the German freelance context is shared. Follow-up office hours at 30 and 90 days are available as an add-on for ongoing support through the transition.",
    cat: "professional", price: 13000, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Berlin Kreuzberg (Online available)",
    images: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-sales-psychology",
    hostKey: "professional",
    title: "Sales Psychology & Persuasion Workshop",
    short: "Understand buying decisions and learn ethical persuasion techniques that convert.",
    desc: "Selling is the most important professional skill that is almost never taught. Every professional sells — ideas to colleagues, proposals to clients, visions to investors, themselves to employers — and most do it intuitively and inconsistently. This workshop applies the best-established findings from behavioural economics and social psychology to professional selling: cognitive biases that affect buying decisions, how to structure a proposal for maximum persuasion, the role of framing and anchoring in pricing conversations, and the ethical limits of influence.\n\nJulia has built two sales organisations, trained over 60 sales professionals, and teaches sales psychology at a Berlin business school. She is particularly interested in the ethics of persuasion — her workshop spends significant time on the difference between ethical influence and manipulation, and why the distinction matters practically as well as morally. Every technique taught is explicitly ethical and long-term relationship-oriented.\n\nMaximum 8 participants. Pre-session questionnaire asks for a specific sales challenge you are currently facing — this becomes material for live coaching during the workshop. The session runs in English; German B2B and B2C sales context differences are covered. A framework document synthesising the workshop content is provided. Corporate sales training programmes for teams are Julia's most frequently booked offering.",
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

  // ── Demo hosts ────────────────────────────────────────────────────
  const hostMap: Record<string, { id: string }> = {};
  for (const h of HOSTS) {
    const created = await prisma.user.upsert({
      where: { clerkId: h.clerkId },
      update: { name: h.name, imageUrl: h.imageUrl },
      create: {
        clerkId: h.clerkId, role: "HOST",
        email: h.email, name: h.name, imageUrl: h.imageUrl,
        hostProfile: {
          create: { bio: h.bio, location: h.location, isVerified: true },
        },
        mollieConnect: {
          create: {
            accessTokenEnc: "test_enc", refreshTokenEnc: "test_enc",
            expiresAt: new Date(Date.now() + 86400_000 * 365),
            mollieProfileId: `pfl_${h.key}`, chargesEnabled: true, isOnboarded: true,
          },
        },
      },
    });
    hostMap[h.key] = created;
  }
  console.log(`✅ ${HOSTS.length} demo hosts`);

  // ── Experiences + time slots ──────────────────────────────────────
  for (const x of SAMPLE_EXPERIENCES) {
    const cat = await prisma.category.findUnique({ where: { slug: x.cat } });
    if (!cat) continue;
    const coords = COORDS[x.id];
    const exp = await prisma.experience.upsert({
      where: { id: x.id },
      update: {
        hostId: hostMap[x.hostKey].id,
        images: [...x.images], title: x.title, shortDescription: x.short,
        description: x.desc,
        ...(coords && { latitude: coords.lat, longitude: coords.lon }),
      },
      create: {
        id: x.id, hostId: hostMap[x.hostKey].id, categoryId: cat.id,
        title: x.title, shortDescription: x.short,
        description: x.desc,
        location: x.location, durationMinutes: x.duration,
        maxParticipants: x.max, difficulty: x.difficulty,
        currency: "EUR", basePriceCents: x.price,
        minPriceCents: x.price, maxPriceCents: x.price,
        timezone: "Europe/Berlin", isPublished: true,
        images: [...x.images],
        latitude: coords?.lat,
        longitude: coords?.lon,
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

  // ── Demo reviewers (6 personas with unique names + avatars) ──────────
  const REVIEWER_PERSONAS = [
    { clerkId: "demo_customer",   name: "Anna Schmidt",    email: "anna.schmidt@erlebnisly.test",   imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
    { clerkId: "demo_reviewer_2", name: "Lukas Müller",    email: "lukas.mueller@erlebnisly.test",  imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    { clerkId: "demo_reviewer_3", name: "Sophie Wagner",   email: "sophie.wagner@erlebnisly.test",  imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    { clerkId: "demo_reviewer_4", name: "Jonas Fischer",   email: "jonas.fischer@erlebnisly.test",  imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
    { clerkId: "demo_reviewer_5", name: "Elena Bauer",     email: "elena.bauer@erlebnisly.test",    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
    { clerkId: "demo_reviewer_6", name: "Marcus Hoffmann", email: "marcus.hoffmann@erlebnisly.test", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face" },
  ];

  const reviewerUsers = await Promise.all(
    REVIEWER_PERSONAS.map((p) =>
      prisma.user.upsert({
        where: { clerkId: p.clerkId },
        update: { name: p.name, imageUrl: p.imageUrl },
        create: { clerkId: p.clerkId, role: "CUSTOMER", email: p.email, name: p.name, imageUrl: p.imageUrl },
      })
    )
  );

  // Keep demoCustomer pointing to Anna Schmidt for backward compatibility
  const demoCustomer = reviewerUsers[0];

  const allExperiences = await prisma.experience.findMany({ include: { timeSlots: true } });
  const REVIEW_COMMENTS = [
    "Amazing experience — exactly what I needed. Would do again without hesitation.",
    "Our host was incredibly knowledgeable and made everyone feel welcome from the start.",
    "Great way to spend an afternoon in Berlin. Highly recommend to anyone visiting.",
    "Exceeded expectations in every way. The attention to detail was impressive.",
    "Perfectly organised, great value for money. Loved every moment.",
    "Will bring friends next time — one of the best things I've done in the city.",
    "Exceeded all my expectations. Already booked the next session.",
    "Incredibly well run. The host really knows their craft.",
    "One of the best things I've done in Berlin. Five stars without hesitation.",
    "Super fun, very professional. Came back feeling genuinely refreshed.",
    "Wonderful atmosphere and a brilliant host. Couldn't have asked for more.",
    "Really well thought-out experience. Learned a lot and had a great time.",
  ];

  // Track which (userId, experienceId) pairs already have a review this run
  const reviewedPairs = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const exp = allExperiences[i % allExperiences.length];
    if (!exp || exp.timeSlots.length === 0) continue;
    const reviewer = reviewerUsers[i % reviewerUsers.length];
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
        userId: reviewer.id, timeSlotId: pastSlot.id, status: "COMPLETED",
        participantCount: participants, currency: "EUR",
        subtotalCents: total, totalPriceCents: total,
        platformFeeCents: fee, hostPayoutCents: total - fee,
        molliePaymentId: `tr_demo_${Date.now()}_${i}`, molliePaymentStatus: "paid",
        createdAt: created,
      },
    });

    // One review per (reviewer, experience) — skip if already reviewed
    const pairKey = `${reviewer.id}:${exp.id}`;
    const alreadyReviewed = await prisma.review.findFirst({
      where: { userId: reviewer.id, experienceId: exp.id },
      select: { id: true },
    });
    if (!alreadyReviewed && !reviewedPairs.has(pairKey) && Math.random() < 0.75) {
      reviewedPairs.add(pairKey);
      await prisma.review.create({
        data: {
          bookingId: booking.id, userId: reviewer.id, experienceId: exp.id,
          rating: 4 + Math.floor(Math.random() * 2),
          comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
        },
      });
    }
  }

  console.log("✅ 100 demo bookings with reviews from 6 different personas");

  // ── Seed demo data for every real (non-demo) customer in the DB ───
  // This ensures any developer / tester account sees populated KPI cards.
  const realCustomers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      clerkId: { notIn: ["demo_host", "demo_customer", "demo_host_adventure", "demo_host_food", "demo_host_arts", "demo_host_wellness", "demo_host_pro", "demo_reviewer_2", "demo_reviewer_3", "demo_reviewer_4", "demo_reviewer_5", "demo_reviewer_6"] },
    },
  });

  for (const realUser of realCustomers) {
    // Skip if they already have bookings — don't overwrite real activity
    const existing = await prisma.booking.count({ where: { userId: realUser.id } });
    if (existing > 0) continue;

    console.log(`🌱 Seeding demo data for real user ${realUser.email ?? realUser.id}…`);

    // Pick 6 varied experiences spread across categories
    const picks = allExperiences.slice(0, 6);
    let bookingIdx = 0;

    for (const exp of picks) {
      // Past completed bookings (for KPI: completed count, spend, favourite category)
      const slotStart = subDays(new Date(), 10 + bookingIdx * 14);
      const slotEnd = new Date(slotStart.getTime() + exp.durationMinutes * 60_000);
      const pastSlot = await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime: slotStart, endTime: slotEnd },
      });
      const participants = 1 + (bookingIdx % 2);
      const total = exp.basePriceCents * participants;
      const fee = Math.round(total * 0.15);
      const completedBooking = await prisma.booking.create({
        data: {
          userId: realUser.id, timeSlotId: pastSlot.id, status: "COMPLETED",
          participantCount: participants, currency: "EUR",
          subtotalCents: total, totalPriceCents: total,
          platformFeeCents: fee, hostPayoutCents: total - fee,
          molliePaymentId: `tr_real_${realUser.id}_${Date.now()}_${bookingIdx}`,
          molliePaymentStatus: "paid",
          createdAt: slotStart,
        },
      });
      await prisma.review.create({
        data: {
          bookingId: completedBooking.id, userId: realUser.id, experienceId: exp.id,
          rating: 4 + (bookingIdx % 2),
          comment: REVIEW_COMMENTS[bookingIdx % REVIEW_COMMENTS.length],
        },
      });
      bookingIdx++;
    }

    // 2 upcoming confirmed bookings (for KPI: upcoming count + "Next Up" card)
    const upcomingExps = allExperiences.slice(6, 8);
    for (let u = 0; u < upcomingExps.length; u++) {
      const exp = upcomingExps[u];
      if (!exp) continue;
      const futureStart = setHours(addDays(new Date(), 10 + u * 7), 10);
      const futureEnd = new Date(futureStart.getTime() + exp.durationMinutes * 60_000);
      const futureSlot = await prisma.timeSlot.upsert({
        where: { experienceId_startTime: { experienceId: exp.id, startTime: futureStart } },
        update: {},
        create: { experienceId: exp.id, startTime: futureStart, endTime: futureEnd },
      });
      const participants = 2;
      const total = exp.basePriceCents * participants;
      const fee = Math.round(total * 0.15);
      await prisma.booking.create({
        data: {
          userId: realUser.id, timeSlotId: futureSlot.id, status: "CONFIRMED",
          participantCount: participants, currency: "EUR",
          subtotalCents: total, totalPriceCents: total,
          platformFeeCents: fee, hostPayoutCents: total - fee,
          molliePaymentId: `tr_real_upcoming_${realUser.id}_${Date.now()}_${u}`,
          molliePaymentStatus: "paid",
        },
      });
    }

    console.log(`  ✅ 6 completed + 2 upcoming bookings for ${realUser.name ?? realUser.email}`);
  }

  if (realCustomers.length === 0) {
    console.log("ℹ️  No real customer accounts found — sign up first, then re-run the seed.");
  }

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
