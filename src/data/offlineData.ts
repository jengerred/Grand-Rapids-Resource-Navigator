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
    updatedAt: new Date(),
    details: "The Hispanic Center of Western Michigan is a cornerstone of the Latino community in Grand Rapids, offering comprehensive support services. Their culturally sensitive approach includes a food pantry with traditional Latin American ingredients, workforce development programs with bilingual staff, and immigration assistance. The center's youth programs focus on educational support and cultural preservation, while their health navigation services help connect community members with appropriate healthcare resources."
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
    updatedAt: new Date(),
    details: "Matthews House Ministry offers free food daily on a first-come, first-served basis with no sign-up required. Their welcoming food pantry provides fresh bread, produce, and essential groceries to anyone in need. The ministry focuses on nutritious options including fresh fruits, vegetables, and dairy products. In addition to food assistance, they operate a clothing closet and host community meals. Their dedicated volunteers create a supportive, no-questions-asked environment for all visitors."
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
    updatedAt: new Date(),
    details: "Northwest Food Pantry is a neighborhood-based food assistance program serving the Northwest Grand Rapids community. They provide a client-choice pantry model allowing individuals to select items that best fit their family's needs. The pantry emphasizes fresh produce and healthy food options, with special programs for seniors and families with young children. Their weekday morning hours make it convenient for working families to access services."
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
    updatedAt: new Date(),
    details: "Saint Mary Food Pantry, located within St. Mary Catholic Church, provides essential food assistance to the Grand Rapids community. They offer a variety of groceries including fresh produce, canned goods, and non-perishable items. The pantry operates on scheduled hours and serves individuals and families in need. Volunteers are available to assist with food selection and provide information about additional community resources. The welcoming atmosphere ensures dignity and respect for all visitors."
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
    updatedAt: new Date(),
    details: "The Downtown Food Pantry at Westminster Presbyterian Church serves the heart of Grand Rapids with weekly food distribution. They provide a variety of fresh produce, non-perishable items, and essential groceries to individuals and families facing food insecurity. The pantry operates every Thursday afternoon, offering a convenient mid-week option for those in need. Their dedicated volunteers ensure a smooth and respectful experience for all visitors, with special accommodations for seniors and individuals with disabilities."
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
    updatedAt: new Date(),
    details: "The Other Way Ministries operates a comprehensive Community Resource Center that serves as a vital hub for West Grand Rapids residents. Their food pantry offers fresh produce, dairy, and non-perishable items with extended hours on Tuesdays to accommodate working families. In addition to food assistance, they provide case management, life skills workshops, and youth programs. The center's welcoming environment and bilingual staff ensure accessibility for all community members, including Spanish-speaking families."
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
    updatedAt: new Date(),
    details: "North End Community Ministry, operating out of New City Church, provides essential food assistance to the North End neighborhood of Grand Rapids. Their client-choice pantry allows visitors to select items that best fit their family's needs, including fresh produce, dairy, and non-perishable goods. The ministry serves as both a food pantry and a community hub, offering additional support services and referrals. Their mid-morning hours make it convenient for seniors and families with young children to access services."
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
    updatedAt: new Date(),
    details: "The Grace Blessing Box is a 24/7, self-serve food pantry located in the Southeast Grand Rapids neighborhood. This outdoor pantry operates on a take-what-you-need, leave-what-you-can basis, providing immediate access to non-perishable food items, personal care products, and sometimes fresh produce. The box is regularly stocked by community donations and local organizations. This resource is particularly valuable for those who need assistance outside of traditional pantry hours or prefer anonymous access to supplemental food supplies."
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
    updatedAt: new Date(),
    details: "God's Kitchen, operated by Catholic Charities West Michigan, provides daily lunchtime meals and food distribution services in downtown Grand Rapids. Their Food Distribution Center offers a structured program where individuals and families can access fresh produce, dairy, and pantry staples during weekday afternoons. The center also provides information about additional social services available through Catholic Charities, including housing assistance and counseling. The welcoming staff and volunteers create a dignified environment for all who visit, with special attention to those experiencing homelessness or food insecurity."
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
    updatedAt: new Date(),
    details: "The Community Food Club offers a unique membership-based approach to food assistance in Grand Rapids. Members gain access to a grocery store-style shopping experience with a wide selection of fresh produce, dairy, meat, and pantry staples at significantly reduced prices. The club operates Tuesday through Friday with extended afternoon hours to accommodate various work schedules. This innovative model promotes dignity and choice while addressing food insecurity in the community. The organization also provides nutrition education and cooking demonstrations to help members make the most of their food selections."
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
    updatedAt: new Date(),
    details: "The Veteran Food/Pet Pantry is a specialized resource serving military veterans and their families in the Grand Rapids area. This unique pantry not only provides standard food assistance but also recognizes the importance of pets to veterans' well-being by offering pet food and supplies. The pantry stocks non-perishable food items, fresh produce when available, and personal care products. Veterans are encouraged to bring their DD-214 or other military ID for verification. The program operates by appointment to ensure personalized service and adequate supply availability."
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
    updatedAt: new Date(),
    details: "The Eastern Ave Christian Reformed Church hosts a weekly Saturday morning food program that serves the Grand Rapids community. This program provides fresh produce, bread, and non-perishable food items to individuals and families in need. The Saturday morning hours are particularly valuable for those who cannot access food assistance during the workweek. Volunteers from the church and local community help distribute food and offer a warm, welcoming environment. The program operates on a first-come, first-served basis with no appointment needed."
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
    updatedAt: new Date(),
    details: "The Pantry, located in the Towne & Country Shopping Center, serves the Southeast Grand Rapids community with a well-stocked food distribution center. They offer a client-choice model where visitors can select from a variety of fresh produce, dairy products, and pantry staples. The Pantry is known for its clean, well-organized space that provides a dignified shopping experience. They maintain flexible hours throughout the week to accommodate different schedules, with extended hours on Wednesdays and Thursdays. The organization also provides information about other community resources and assistance programs."
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
    updatedAt: new Date(),
    details: "Baxter Community Center is a comprehensive neighborhood hub that offers a food pantry as part of its broader community services. The center provides fresh produce, dairy, and non-perishable food items to residents of the Baxter neighborhood and surrounding areas. In addition to food distribution, the center offers educational programs, youth development initiatives, and family support services. The food pantry operates in conjunction with other social services, allowing clients to access multiple resources in one visit. The center's welcoming atmosphere and bilingual staff ensure accessibility for diverse community members."
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
    updatedAt: new Date(),
    details: "Addie's Pantry, located at Central Reformed Church, provides essential food assistance to the Grand Rapids community every Tuesday afternoon. The pantry offers a variety of fresh produce, dairy products, and non-perishable food items in a welcoming environment. The distribution operates on a first-come, first-served basis, with volunteers available to assist clients with their selections. The pantry is known for its friendly atmosphere and commitment to serving all community members with dignity and respect. Special accommodations are available for seniors and individuals with disabilities."
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
    updatedAt: new Date(),
    details: "Pleasant Hearts Pet Food Pantry is dedicated to helping pet owners in need by providing free pet food and supplies. This unique pantry helps ensure that families facing financial difficulties don't have to give up their beloved pets. They distribute a variety of pet food, including options for dogs, cats, and sometimes other small animals. The pantry operates on specific distribution days and welcomes both one-time visitors and regular clients. Volunteers are available to help carry supplies to vehicles for those who need assistance."
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
    updatedAt: new Date(),
    details: "Feeding America West Michigan is the region's leading hunger-relief organization, distributing millions of pounds of food annually through a network of partner agencies. Their main facility in Kentwood serves as both a food bank and distribution center, offering a wide variety of fresh produce, dairy, meat, and non-perishable items. The organization operates a choice-based food pantry where clients can select items that best meet their family's needs. They also provide nutrition education and food assistance programs for children, seniors, and families. Their professional staff and volunteers work to ensure that no one in West Michigan goes hungry."
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
    updatedAt: new Date(),
    details: "SECOM Resource Center serves the Southeast Grand Rapids community with a comprehensive food pantry and support services. Their client-choice model allows individuals and families to select from a variety of fresh produce, dairy, meat, and non-perishable items. The center also offers additional resources including clothing, household items, and personal care products. Their Tuesday and Wednesday afternoon hours make it convenient for working families to access services. The welcoming staff and volunteers provide a respectful and supportive environment for all visitors."
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
    updatedAt: new Date(),
    details: "The Salvation Army Kent County Food Pantry provides essential food assistance to individuals and families in need throughout the Grand Rapids area. Their spacious facility offers a wide selection of fresh produce, dairy products, meat, and non-perishable items. The pantry operates Monday through Friday with convenient daytime hours. In addition to food distribution, they offer case management services to help clients access other community resources. The professional staff and dedicated volunteers create a welcoming and supportive environment for all who visit."
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
    updatedAt: new Date(),
    details: "The East Church Food Pantry serves the Grand Rapids community on the second Tuesday of each month, offering both morning and afternoon distribution times. This monthly pantry provides fresh produce, dairy, and non-perishable food items to individuals and families in need. The church's welcoming atmosphere and caring volunteers create a supportive environment for all visitors. In addition to food distribution, they often have information available about other local resources and assistance programs. The pantry serves residents of the 49506 and 49507 zip codes, with proof of address required."
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
    updatedAt: new Date(),
    details: "The Meals on Wheels Western Michigan Senior Pantry is specifically designed to meet the nutritional needs of seniors in the Grand Rapids area. This pantry provides a variety of fresh produce, dairy, and shelf-stable food items tailored to senior dietary requirements. The facility is wheelchair accessible and staffed with knowledgeable volunteers who can assist with food selection and information about other senior services. The pantry operates on Wednesdays and Thursdays, with special accommodations available for homebound seniors through their delivery program."
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
    updatedAt: new Date(),
    details: "Saint Alphonsus Parish operates a combined food and clothing pantry that serves the Creston neighborhood of Grand Rapids. The pantry offers a welcoming environment where clients can select from a variety of fresh produce, dairy, and non-perishable food items. In addition to food assistance, they provide gently used clothing and household items. The pantry operates Monday through Thursday mornings, making it convenient for seniors and families with young children. The caring staff and volunteers are committed to treating all visitors with dignity and respect while providing essential resources to the community."
  }];

import { getMongoClient } from '../lib/mongodb';

export const seedResources = async () => {
  try {
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    console.log('Connected to MongoDB, starting seed...');
    
    // Drop existing collection if it exists
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    if (collections.length > 0) {
      console.log(`Dropping existing collection: ${COLLECTION_NAME}`);
      await db.dropCollection(COLLECTION_NAME);
    }

    // Insert new resources
    await collection.insertMany(offlineResources);

    console.log('Resources seeded successfully');
    await client.close();
  } catch (error) {
    console.error('Error seeding resources:', error);
  }
};

seedResources();