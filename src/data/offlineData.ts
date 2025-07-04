import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://jengerred:qqDwlofCP7GoFZEH@cluster0.xkeshgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'resource-navigator';
const COLLECTION_NAME = 'resources';

export const offlineResources = [
  {
    id: new ObjectId().toString(),
    name: "Hispanic Center of Western MI",
    address: "1204 Cesar E. Chavez Ave SW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Community Services",
    services: [
      "Basic Needs Assistance",
      "Workforce Development",
      "Language Services",
      "Youth Education",
      "Community Outreach",
      "Food Pantry",
      "Financial Assistance",
      "Career Coaching",
      "GED Classes",
      "Language Classes",
      "Childcare Services",
      "Health Navigation"
    ],
    hours: "9 AM - 4:45 PM Mon-Fri",
    phone: "(616) 742-0200",
    website: "http://hispanic-center.org",
    geocodedCoordinates: {
      lat: 42.941425698017014,
      lng: -85.68243507883228
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Matthews House Ministry",
    address: "766 7th St NW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49504",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9:30 AM - 4:00 PM Mon-Fri",
    phone: "(616) 233-3006",
    website: "https://matthewshouseministry.org",
    geocodedCoordinates: {
      lat: 42.978223220213,
      lng: -85.68791973419839
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Northwest Food Pantry",
    address: "1224 Davis Ave NW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49504",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "Wednesday & Friday 9-11:45 AM",
    phone: "(616) 300-5079",
    website: "https://nwfoodpantry.org",
    geocodedCoordinates: {
      lat: 42.98738855705423,
      lng: -85.68549523698314
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Saint Mary Food Pantry",
    address: "423 First St NW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49504",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "TBD",
    phone: "(616) 459-7390",
    website: "https://stmarygr.org",
    geocodedCoordinates: {
      lat: 42.97247695020409,
      lng: -85.6791807028509
    },
    location: "St. Mary Catholic Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Downtown Food Pantry",
    address: "47 Jefferson Ave SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "Thursday 10:30 AM - 2:30 PM",
    phone: "(616) 456-6115",
    website: "https://westminstergr.org",
    geocodedCoordinates: {
      lat: 42.962592248660926,
      lng: -85.66488533161069
    },
    location: "Westminster Presbyterian Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "The Other Way Ministries - Community Resource Center",
    address: "710 Fulton St W",
    city: "Grand Rapids",
    state: "MI",
    zip: "49504",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "10 AM - 3 PM Mon, Wed, Thu; 10 AM - 6 PM Tue; 10 AM - 1 PM Fri",
    phone: "(616) 454-4011",
    website: "https://theotherway.org",
    geocodedCoordinates: {
      lat: 42.9633298,
      lng: -85.6853547
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "North End Community Ministry",
    address: "214 Spencer St NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49505",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 12:30 PM Tue, Wed, Thu",
    phone: "(616) 454-1097",
    website: "https://necmgr.org",
    geocodedCoordinates: {
      lat: 42.988962291854556,
      lng: -85.66490864695275
    },
    location: "New City Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Grace Blessing Box",
    address: "100 Buckley St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "24 hours",
    geocodedCoordinates: {
      lat: 42.9536508592264,
      lng: -85.66556864695268
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "God's Kitchen - Food Distribution Center",
    address: "303 Division Ave S",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "12:30 PM - 2 PM Mon-Fri",
    phone: "(616) 454-4110",
    website: "https://ccwestmi.org",
    geocodedCoordinates: {
      lat: 42.95820513509375,
      lng: -85.66792899076444
    },
    location: "Catholic Charities West Michigan",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Community Food Club",
    address: "1100 Division Ave S",
    city: "Grand Rapids",
    state: "MI",
    zip: "49507",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "10 AM - 5 PM Tue-Fri",
    phone: "(616) 288-5550",
    website: "https://communityfoodclubgr.org",
    geocodedCoordinates: {
      lat: 42.94388158598184,
      lng: -85.66651278447738
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Veteran Food/Pet Pantry",
    address: "620 Century Ave SW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce", "Pet Food"],
    hours: "TBD",
    geocodedCoordinates: {
      lat: 42.95239444794772,
      lng: -85.67346506988659
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Eastern Ave Christian Reformed Church Saturday Food Program",
    address: "514 Eastern Ave SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "Saturday 9:30 AM - 11:00 AM",
    phone: "(616) 454-4888",
    website: "https://eacrc.org",
    geocodedCoordinates: {
      lat: 42.95399871405702,
      lng: -85.64824081682221
    },
    location: "Eastern Avenue Christian Reformed Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "The Pantry",
    address: "4307 Kalamazoo Ave SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49508",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 1 PM Tue, 9 AM - 3 PM Wed, Thu",
    phone: "(616) 455-9411",
    website: "https://thegreenapplepantry.org",
    geocodedCoordinates: {
      lat: 42.886240225543894,
      lng: -85.62824970832084
    },
    location: "Towne & Country Shopping Center",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Baxter Community Center",
    address: "935 Baxter St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49506",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "TBD",
    phone: "(616) 456-8593",
    website: "https://wearebaxter.org",
    geocodedCoordinates: {
      lat: 42.95366170746263,
      lng: -85.64512923161067
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Addie's Pantry - Food Distribution Center",
    address: "10 College Ave NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "1 PM - 3 PM Tue",
    phone: "(616) 456-1773",
    website: "TBD",
    geocodedCoordinates: {
      lat: 42.964082128506426,
      lng: -85.65672077763676
    },
    location: "Central Reformed Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Pleasant Hearts Pet Food Pantry",
    address: "1035 Godfrey Ave SW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Pet Food", "Food Distribution"],
    website: "https://pleasantheartspetfoodpantry.org",
    geocodedCoordinates: {
      lat: 42.944749160165145,
      lng: -85.68482423161072
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Feeding America West Michigan",
    address: "3070 Shaffer Ave SE",
    city: "Kentwood",
    state: "MI",
    zip: "49512",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "8 AM - 4 PM Tue-Fri",
    phone: "(616) 784-3250",
    website: "https://feedwm.org",
    geocodedCoordinates: {
      lat: 42.90824611777697,
      lng: -85.5868649929788
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "SECOM Resource Center",
    address: "1545 Buchanan Ave SW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49507",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 3 PM Tue, Wed; 9 AM - 12 PM Fri",
    phone: "(616) 452-7684",
    website: "https://secomresourcecenter.org",
    geocodedCoordinates: {
      lat: 42.936252462747674,
      lng: -85.6724317469527
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Salvation Army Kent County Food Pantry",
    address: "1215 Fulton St E",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 4 PM Mon-Fri",
    phone: "(616) 459-9468",
    website: "https://centralusa.salvationarmy.org",
    geocodedCoordinates: {
      lat: 42.96409000829732,
      lng: -85.63893953955846
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "East Church Food Pantry",
    address: "1005 Giddings Ave SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49506",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "2nd Tuesday of each month: 10 AM - 12 PM & 1 PM - 3 PM",
    phone: "(616) 245-0578",
    website: "https://eastchurchgr.org",
    geocodedCoordinates: {
      lat: 42.94469714589993,
      lng: -85.63526786229474
    },
    location: "East Church, United Church of Christ",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Meals on Wheels Western Michigan Senior Pantry",
    address: "1954 Fuller Ave NE # B",
    city: "Grand Rapids",
    state: "MI",
    zip: "49505",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 3 PM Wed, Thu",
    phone: "(616) 459-3111 ext. 3",
    website: "https://mealsonwheelswesternmichigan.org",
    geocodedCoordinates: {
      lat: 42.998519512717415,
      lng: -85.63935161626866
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "South End Community Outreach Ministries - Food Distribution Center",
    address: "1545 Buchanan Ave SW",
    city: "Grand Rapids",
    state: "MI",
    zip: "49507",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 3 PM Tue, Wed; 9 AM - 12 PM Fri",
    phone: "(616) 452-7684",
    website: "https://secomministries.org",
    geocodedCoordinates: {
      lat: 42.93616790602513,
      lng: -85.67201422421645
    },
    location: "SECOM Resource Center",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Catholic Charities West Michigan, God's Kitchen",
    address: "303 Division Ave S",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "12:30 PM - 2 PM Mon-Fri",
    phone: "(616) 224-0217",
    website: "https://ccwestmi.org",
    geocodedCoordinates: {
      lat: 42.95835616623944,
      lng: -85.66795211626867
    },
    location: "Catholic Charities West Michigan",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Family Network",
    address: "1029 44th St SW",
    city: "Wyoming",
    state: "MI",
    zip: "49509",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 5 PM Mon-Fri",
    phone: "(616) 885-9919",
    website: "https://fntw.org",
    geocodedCoordinates: {
      lat: 42.88541562105398,
      lng: -85.6902203395585
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "First Church Food Pantry",
    address: "651 M.L.K. Jr St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    phone: "(616) 452-4370",
    geocodedCoordinates: {
      lat: 42.949367289893225,
      lng: -85.65245992421643
    },
    location: "First Christian Reformed Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Calvary Undenominational Church Food Pantry",
    address: "707 E Beltline Ave NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49525",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "TBD",
    phone: "(616) 956-9377",
    website: "https://calvarygr.org",
    geocodedCoordinates: {
      lat: 42.97605217088623,
      lng: -85.5937776009266
    },
    location: "Calvary Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Grace Christian Reformed Church Food Pantry",
    address: "100 Buckley St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 1 PM Tue-Wed-Thu; Closed Mon, Fri, Sat, Sun",
    phone: "(616) 452-8920",
    website: "https://gracegr.org",
    geocodedCoordinates: {
      lat: 42.953482319723534,
      lng: -85.66522500887443
    },
    location: "Grace Christian Reformed Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Streams Food Pantry",
    address: "280 60th St SE Suite 100",
    city: "Grand Rapids",
    state: "MI",
    zip: "49548",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "8 AM - 8 PM Mon-Thu; 8 AM - 5 PM Fri; Closed Sat, Sun",
    phone: "(616) 272-3634",
    website: "https://streamsgr.org",
    geocodedCoordinates: {
      lat: 42.85462856426535,
      lng: -85.65730566229475
    },
    location: "Streams",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "First Community Church Food Pantry",
    address: "500 James Ave SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    phone: "(616) 459-0151",
    website: "https://fcame.org",
    geocodedCoordinates: {
      lat: 42.95418576203981,
      lng: -85.65270171626864
    },
    location: "First Community Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Anointed Life Ministries Food Pantry",
    address: "23 Pleasant St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "Open 24 hours Mon-Fri; Closed Sat, Sun",
    phone: "(616) 458-2808",
    website: "https://anointedlifeministries.org",
    geocodedCoordinates: {
      lat: 42.95243287680132,
      lng: -85.66632130887446
    },
    location: "Anointed Life Ministries",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "The Salvation Army Grand Valley Area Command",
    address: "1215 Fulton St E",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "8:30 AM - 4:30 PM Mon-Fri",
    phone: "(616) 459-3433",
    website: "https://centralusa.salvationarmy.org",
    geocodedCoordinates: {
      lat: 42.96409532328098,
      lng: -85.63913483161069
    },
    location: "The Salvation Army",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "The Green Apple Pantry - Food Distribution Site",
    address: "4307 Kalamazoo Ave SE",
    city: "Kentwood",
    state: "MI",
    zip: "49508",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 1 PM Mon-Tue; 9 AM - 3 PM Wed-Thu; Closed Fri-Sun",
    phone: "(616) 455-9411",
    website: "https://thegreenapplepantry.org",
    geocodedCoordinates: {
      lat: 42.88595722579116,
      lng: -85.62824970832084
    },
    location: "Towne & Country Shopping Center",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Buist Community Assistance Center",
    address: "870 74th St SW Ste B",
    city: "Byron Center",
    state: "MI",
    zip: "49315",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "10:30 AM - 2:30 PM Mon-Wed-Fri; 12 PM - 5:15 PM Tue-Thu; Closed Sat-Sun",
    phone: "(616) 583-4080",
    website: "https://buistcac.org",
    geocodedCoordinates: {
      lat: 42.83029715593446,
      lng: -85.68545370092662
    },
    location: "InSpirit Church",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // {
  //   id: new ObjectId().toString(),
  //   name: "Access of West Michigan",
  //   category: "Food Pantry",
  //   services: ["Food Distribution", "Grocery", "Fresh Produce"],
  //   hours: "9 AM - 4 PM Mon-Fri",
  //   phone: "(616) 774-2175",
  //   website: "https://accessofwestmichigan.org",
  //   geocodedCoordinates: {
  //     lat: null,
  //     lng: null
  //   },
  //   location: "Location not provided (privacy preference)",
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  // },
  {
    id: new ObjectId().toString(),
    name: "Baxter Community Center - Food Distribution Center",
    address: "935 Baxter St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49506",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    phone: "(616) 456-8593",
    website: "https://wearebaxter.org",
    geocodedCoordinates: {
      lat: 42.95340556861011,
      lng: -85.64529240832087
    },
    location: "Jubilee Jobs GR",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Baxter Community Center - Marketplace Food & Clothing Pantry",
    address: "935 Baxter St SE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49506",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce", "Clothing"],
    hours: "9 AM - 6 PM Mon-Tue-Wed-Thu; 9 AM - 1 PM Fri",
    phone: "(616) 456-6610",
    website: "https://wearebaxter.org",
    geocodedCoordinates: {
      lat: 42.953625438823096,
      lng: -85.64503491626868
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Grand Rapids Center For Ecumenism - Food Distribution Center",
    address: "183 Lakeside Dr NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    geocodedCoordinates: {
      lat: 42.966475077134156,
      lng: -85.61793399297885
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Streams of Hope - Food Distribution Center",
    address: "280 60th St SE Suite 100",
    city: "Grand Rapids",
    state: "MI",
    zip: "49548",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "6 PM - 8 PM Tue; 11 AM - 1 PM Thu; 6 PM - 8 PM Thu",
    phone: "(616) 272-3634",
    website: "https://streamsgr.org",
    geocodedCoordinates: {
      lat: 42.854436105567004,
      lng: -85.65720455490049
    },
    location: "Streams",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Senior Meals Program Food Pantry",
    address: "1954 Fuller Ave NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49505",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "11 AM - 4:30 PM Mon; 9:30 AM - 3 PM Tue-Wed; 8:30 AM - 2:30 PM Thu",
    phone: "(616) 459-3111",
    website: "https://mealsonwheelswesternmichigan.org",
    geocodedCoordinates: {
      lat: 42.998446826111454,
      lng: -85.63942360832085
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Temple Emanuel Food Pantry",
    address: "1715 Fulton St E",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    phone: "(616) 459-5976",
    website: "https://grtemple.org",
    geocodedCoordinates: {
      lat: 42.964272101313206,
      lng: -85.62676083161067
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: new ObjectId().toString(),
    name: "Saint Alphonsus Parish Food & Clothing Store - Food Pantry",
    address: "228 Carrier St NE",
    city: "Grand Rapids",
    state: "MI",
    zip: "49505",
    category: "Food Pantry",
    services: ["Food Distribution", "Grocery", "Fresh Produce"],
    hours: "9 AM - 1 PM Mon-Thu",
    phone: "(616) 913-4404",
    website: "https://stalphonsusgr.org",
    geocodedCoordinates: {
      lat: 42.9857735959473,
      lng: -85.6623554707961
    },
    location: "Catherine's Health Center Creston",
    createdAt: new Date(),
    updatedAt: new Date()
  }];

const seedResources = async () => {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Drop existing collection
    await collection.drop().catch(() => {});

    // Insert new resources
    await collection.insertMany(offlineResources);

    console.log('Resources seeded successfully');
    await client.close();
  } catch (error) {
    console.error('Error seeding resources:', error);
  }
};

seedResources();