import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getTranslation, formatTranslation } from '@/lib/appTranslations';
import { Document } from 'mongodb';

// Define the resource type that extends MongoDB Document
interface Resource extends Document {
  _id: string;
  name: string;
  address: string;
  city: string;
  services: string[];
  details?: string;
  phone?: string;
  website?: string;
  category?: string;
  language?: string;
}

// MongoDB connection helper
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }
  
  const client = await MongoClient.connect(uri);
  const db = client.db(process.env.MONGODB_DB || 'resource-navigator');
  return { client, db };
}

// Helper function to generate a conversational response
async function generateResponse(question: string, resources: Resource[], language: string = 'en'): Promise<string> {
  // Convert question to lowercase for case-insensitive matching
  const questionLower = question.toLowerCase();
  
  // Greetings and follow-ups
  const greetings = [
    getTranslatedText('response.greeting', language),
    getTranslatedText('response.help.other', language)
  ];
  
  const followUps = [
    getTranslatedText('response.followup.1', language),
    getTranslatedText('response.followup.2', language),
    getTranslatedText('response.followup.3', language)
  ];
  
  // Check for greeting
  if (/(hi|hello|hey|greetings)/i.test(questionLower)) {
    return getTranslatedText('response.greeting.full', language);
  }
  
  // Check for thank you
  if (/(thanks|thank you|gracias)/i.test(questionLower)) {
    return getTranslatedText('response.thanks', language) + " " + getTranslatedText('response.followup.random', language, { followUp: followUps[Math.floor(Math.random() * followUps.length)] });
  }
  
  // Check for family hunger first
  const familyHungerRegex = /(my|our) (kids?|children|family|mom|mother|dad|father|husband|wife|partner|baby|babies|toddler|son|daughter) (is|are|'?s|is feeling|are feeling) (hungry|starving|famished)/i;
  const isFamilyHunger = familyHungerRegex.test(questionLower);
  
  // Check for other hunger phrases
  const personalHungerPhrases = [
    // Personal hunger
    /(i'?m|i am|i'm) (hungry|starving|famished|really hungry|so hungry)/i,
    // Need food
    /(need|needs|needing|want|wants|wanting|gotta|got to|have to|must) (get|find|eat|have) (food|a meal|meals|something to eat|dinner|lunch|breakfast|snack)/i,
    // No food
    /(don'?t|do not) have (any |some )?(food|meals|snacks|groceries)/i,
    // Specific meal times
    /(haven'?t|have not|didn'?t|did not) (eat|had) (breakfast|lunch|dinner|today|yesterday)/i
  ];
  
  if (isFamilyHunger || personalHungerPhrases.some(regex => regex.test(questionLower))) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    let immediateOptions = [];
    
    // Food bank information
    const foodBanks = [
      "• Feeding America West Michigan Food Bank (3070 Shaffer Ave SE) - Mon-Fri 8 AM-4 PM, Sat 9 AM-12 PM (ID required)",
      "• North End Community Ministry (1005 Leonard St NE) - Food pantry: Tues & Thurs 10 AM-2 PM",
      "• The Green Apple Pantry (4307 Kalamazoo Ave SE) - Wed & Fri 10 AM-2 PM (ID required)",
      "• South End Community Outreach (1534 Jefferson Ave SE) - Food pantry: Mon & Wed 10 AM-2 PM"
    ];
    
    // Add Matthew's House food bank info (separate from their daily lunch)
    foodBanks.unshift("• Matthews House Ministry (766 7th St NW, Grand Rapids, MI 49504) - Food pantry with fresh bread, produce, and groceries (ID may be required for food bank services)");
    
    // Immediate meal options based on time of day
    if (currentHour >= 10 && currentHour < 14) { // Morning to early afternoon
      immediateOptions.push("• Matthews House Ministry (766 7th St NW) - Free lunch served daily around 12 PM (no ID or documents needed)");
      immediateOptions.push("• Heartside Ministry (54 S. Division Ave) - Breakfast 8-9:30 AM, Lunch 12-1 PM (no ID required)");
    } else if (currentHour >= 16 && currentHour < 18) { // Late afternoon/evening
      immediateOptions.push("• Degage Ministries (144 S. Division Ave) - Dinner served at 5 PM (no ID required)");
      immediateOptions.push("• Mel Trotter Ministries (225 Commerce Ave SW) - Dinner served at 5:30 PM");
    } else {
      immediateOptions.push("• Many local churches offer free community meals - call 211 for the nearest one open today");
      immediateOptions.push("• Hospital cafeterias often have affordable meal options");
    }

    // Check if any food banks are currently open
    const isWeekday = currentDay > 0 && currentDay < 6; // Monday to Friday
    const isSaturday = currentDay === 6;
    let openNow = [];

    if (isWeekday && currentHour >= 8 && currentHour < 16) {
      openNow.push("• Feeding America West Michigan Food Bank is open until 4 PM today");
    }
    if (isWeekday && currentHour >= 10 && currentHour < 14) {
      openNow.push("• North End Community Ministry is open until 2 PM today");
      openNow.push("• The Green Apple Pantry is open until 2 PM today");
      openNow.push("• South End Community Outreach is open until 2 PM today");
    }
    if (isSaturday && currentHour >= 9 && currentHour < 12) {
      openNow.push("• Feeding America West Michigan Food Bank is open until 12 PM today");
    }

    let response = '';
    
    if (isFamilyHunger) {
      response = `I'm so sorry to hear about your situation. No one should have to go hungry, especially not families. Grand Rapids has many resources that can help. Here are some immediate options:\n\n${immediateOptions.join('\n')}`;
    } else {
      response = `I'm really sorry to hear you're feeling hungry. Here are some immediate options in Grand Rapids:\n\n${immediateOptions.join('\n')}`;
    }
    
    if (openNow.length > 0) {
      response += `\n\nThese food banks are open right now:\n${openNow.join('\n')}`;
    } else {
      response += "\n\nI don't see any food banks open right now, but here are some that will be open soon:"
    }
    
    response += `\n\nHere are food banks in Grand Rapids and their regular hours (ID may be required):\n${foodBanks.join('\n')}\n\nWould you like me to help you find the nearest one to your location?`;
    
    return response;
  }
  
  // Common phrases and their associated service types and items
  const serviceKeywords: Record<string, string[]> = {
    'food': ['food', 'meal', 'eat', 'hungry', 'groceries', 'pantry', 'soup kitchen', 'food bank'],
    'shelter': ['shelter', 'housing', 'homeless', 'stay', 'live', 'sleep'],
    'clothing': ['clothes', 'clothing', 'coat', 'jacket', 'shoes', 'pants', 'shirt', 'diaper', 'diapers', 'underwear', 'socks'],
    'medical': ['medical', 'health', 'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy'],
    'baby': ['baby', 'infant', 'toddler', 'diaper', 'formula', 'wipes', 'stroller', 'crib'],
    'assistance': ['help', 'assistance', 'support', 'aid', 'need', 'find', 'where', 'how']
  };

  // Find all matching service types
  const matchedServices = Object.entries(serviceKeywords)
    .filter(([_, keywords]) => 
      keywords.some(keyword => questionLower.includes(keyword))
    )
    .map(([service]) => service);

  // If no services matched, but we have resources, show them anyway
  if (matchedServices.length === 0 && resources.length > 0) {
    console.log('No specific services matched, but showing available resources');
    // Continue to show resources
  } else if (matchedServices.length === 0) {
    return "I'm here to help you find resources in Grand Rapids. Could you tell me what kind of assistance you're looking for? For example, you could ask about food, shelter, or medical assistance.";
  }

  // Find matching resources based on services and details
  let matchedResources = resources;
  
  if (matchedServices.length > 0) {
    matchedResources = resources.filter(resource => {
      // Check services
      const serviceMatch = resource.services.some(service => 
        matchedServices.some(serviceType => 
          service.toLowerCase().includes(serviceType)
        )
      );
      
      // Check details if no service match
      if (!serviceMatch && resource.details) {
        const detailsLower = resource.details.toLowerCase();
        return matchedServices.some(serviceType => 
          serviceKeywords[serviceType].some(keyword => 
            detailsLower.includes(keyword)
          )
        );
      }
      
      return serviceMatch;
    });
  }
  
  // If no resources matched but we have some, show them all
  if (matchedResources.length === 0 && resources.length > 0) {
    console.log('No specific matches, showing all available resources');
    matchedResources = resources;
  }
  
  // Limit to 5 resources for better readability
  const resourcesToShow = matchedResources.slice(0, 5);
  
  // Format resources into a clean list
  const resourceList = resourcesToShow.map(resource => {
    return `• ${resource.name}\n  📍 ${resource.address}, ${resource.city}\n  📞 ${resource.phone || 'Phone not available'}\n  ${resource.website ? `🌐 ${resource.website}` : ''}`;
  }).join('\n\n');
  
  // Custom responses for specific needs
  let response = '';
  const followUp = followUps[Math.floor(Math.random() * followUps.length)];
  
  // Check for specific needs and craft custom responses
  if (matchedServices.includes('baby') || questionLower.includes('diaper') || questionLower.includes('baby')) {
    response = getTranslatedText('response.baby', language);
  } 
  else if (matchedServices.includes('food')) {
    response = getTranslatedText('response.food', language);
  }
  else if (matchedServices.includes('shelter')) {
    response = getTranslatedText('response.shelter', language);
  }
  else if (matchedServices.includes('clothing')) {
    response = getTranslatedText('response.clothing', language);
  }
  else if (matchedServices.includes('medical')) {
    response = getTranslatedText('response.medical', language);
  }
  else {
    // Default response
    response = getTranslatedText('response.default', language);
  }
  
  // Format the response with proper spacing and structure
  const sections: string[] = [response];
  
  // Add resources if available
  if (resourceList) {
    sections.push('', resourceList); // Add empty line before resources
  }
  
  // Add directions prompt if we have resources
  if (resources.length > 0) {
    const directionsPrompt = resources.length === 1
      ? getTranslatedText('response.directions.single', language, { resourceName: resources[0].name })
      : getTranslatedText('response.directions.multiple', language);
    
    sections.push('', directionsPrompt); // Add empty line before directions
  }
  
  // Add follow-up question
  if (followUp) {
    sections.push('', followUp); // Add empty line before follow-up
  }
  
  // Join all sections with double newlines for better spacing
  return sections.join('\n\n');
}

// Helper function to format resources into context
function createContextFromResources(resources: Resource[], language: string = 'en') {
  // Group resources by service for better context
  const services: Record<string, string[]> = {};
  
  resources.forEach(resource => {
    resource.services?.forEach(service => {
      if (!services[service]) {
        services[service] = [];
      }
      services[service].push(resource.name);
    });
  });

  // Create a more structured context
  let context = 'Available services and their providers:\n\n';
  
  // Add services section
  context += 'SERVICES AND PROVIDERS:\n';
  
  // Add services and their providers
  Object.entries(services).forEach(([service, providers]) => {
    context += `- ${service}: ${providers.join(', ')}\n`;
  });

  // Add detailed resource information
  context += '\nDETAILED RESOURCE INFORMATION:\n';
  
  resources.forEach(resource => {
    context += `\nRESOURCE: ${resource.name}\n`;
    context += `Location: ${resource.address}, ${resource.city}\n`;
    if (resource.phone) context += `Phone: ${resource.phone}\n`;
    if (resource.website) context += `Website: ${resource.website}\n`;
    if (resource.details) context += `Details: ${resource.details}\n`;
    context += `Services: ${resource.services?.join(', ') || 'Various services'}\n`;
  });

  return context;
}

// Helper function to get translation with proper typing and fallback
const getTranslatedText = (key: string, language: string = 'en', params: Record<string, string> = {}) => {
  try {
    console.log(`[getTranslatedText] Getting translation for key: ${key}, language: ${language}`);
    
    // First try to get the translation in the requested language
    let translation = getTranslation(key, language as any);
    
    // If translation not found, fall back to English
    if (translation === key && language !== 'en') {
      console.warn(`[getTranslatedText] Translation not found for key: ${key} in language: ${language}, falling back to English`);
      translation = getTranslation(key, 'en');
    }
    
    // If still not found, return a helpful message
    if (translation === key) {
      console.error(`[getTranslatedText] Translation not found for key: ${key} in any language`);
      return `[Missing translation: ${key}]`;
    }
    
    // Replace placeholders with actual values
    let result = translation;
    Object.entries(params).forEach(([param, value]) => {
      const placeholder = `{${param}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder, 'g'), value);
      } else {
        console.warn(`[getTranslatedText] Placeholder ${placeholder} not found in translation for key: ${key}`);
      }
    });
    
    console.log(`[getTranslatedText] Successfully translated to: ${result}`);
    return result;
  } catch (error) {
    console.error(`[getTranslatedText] Error translating key ${key}:`, error);
    return `[Error: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
};

export async function POST(request: Request) {
  try {
    const { question, language = 'en' } = await request.json();

    if (!question) {
      return NextResponse.json(
        { 
          success: false,
          error: getTranslatedText('error.required', language)
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { client, db } = await connectToDatabase();

    try {
      // Get all resources from MongoDB with proper typing
      const resources = await db.collection<Resource>('resources').find({}).toArray();

      if (!resources || resources.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: getTranslatedText('error.noResources', language)
          },
          { status: 404 }
        );
      }

      // Generate a response based on the question and resources
      const answer = await generateResponse(question, resources, language);
      
      // Find relevant resources based on the question
      const questionLower = question.toLowerCase();

      // Debug: Log all resources and their services
      console.log('All resources:', resources.map(r => ({
        name: r.name,
        services: r.services,
        address: r.address,
        city: r.city
      })));

      // Enhanced resource matching logic
      const matchedResources = new Set<Resource>();
      const questionWords = questionLower.split(/\s+/).filter((w: string) => w.length > 3);

      resources.forEach((resource: Resource) => {
        // 1. Match by services (check if any service contains any question word)
        const serviceMatch = resource.services.some((service: string) => {
          const serviceLower = service.toLowerCase();
          return questionWords.some((word: string) => 
            serviceLower.includes(word.toLowerCase())
          );
        });

        if (serviceMatch) {
          matchedResources.add(resource);
          return;
        }

        // 2. Match by resource name (check if any word in the name matches any question word)
        const nameWords = resource.name.toLowerCase().split(/\s+/);
        const nameMatch = questionWords.some((word: string) => 
          nameWords.some((nw: string) => nw.includes(word.toLowerCase()))
        );

        if (nameMatch) {
          matchedResources.add(resource);
          return;
        }

        // 3. Match by category (if available)
        if (resource.category) {
          const categoryWords = resource.category.toLowerCase().split(/\s+/);
          const categoryMatch = questionWords.some((word: string) =>
            categoryWords.some((cw: string) => cw.includes(word.toLowerCase()))
          );

          if (categoryMatch) {
            matchedResources.add(resource);
            return;
          }
        }

        // 4. Match by any word in the question against the full text of the resource
        const resourceText = [
          resource.name,
          resource.category,
          resource.services?.join(' '),
          resource.details
        ].filter(Boolean).join(' ').toLowerCase();

        const textMatch = questionWords.some((word: string) => 
          resourceText.includes(word.toLowerCase())
        );

        if (textMatch) {
          matchedResources.add(resource);
        }
      });
      
      const relevantResources: Resource[] = Array.from(matchedResources);
      console.log('Matched resources:', relevantResources);

      // Just use the answer as is - directions will be handled in the frontend
      const finalAnswer = answer;
      console.log('Using generated answer with resources');

      // Return the response with the answer and relevant resources
      return NextResponse.json({
        success: true,
        answer: finalAnswer,
        relevantResources: relevantResources.map(r => ({
          id: r._id,
          name: r.name,
          address: r.address,
          city: r.city,
          services: r.services,
          phone: r.phone,
          website: r.website
        })),
        confidence: 1.0
      });
      
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        help: 'Check the server logs for more details'
      },
      { status: 500 }
    );
  }
}