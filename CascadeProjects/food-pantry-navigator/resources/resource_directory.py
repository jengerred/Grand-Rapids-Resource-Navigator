from typing import Dict, List
from dataclasses import dataclass
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class Resource:
    name: str
    description: str
    website: str
    phone: str
    email: str
    address: str
    hours: str
    eligibility: str
    requirements: List[str]
    categories: List[str]
    last_updated: datetime
    latitude: float
    longitude: float
    transportation_options: List[str]
    transit_routes: List[str]
    
    def get_transportation_options(self) -> List[Dict]:
        """Get formatted transportation options"""
        options = []
        for option in self.transportation_options:
            if option == 'bus':
                options.append({
                    'type': 'bus',
                    'name': 'The Rapid',
                    'website': 'https://www.the-rapid.org',
                    'routes': self.transit_routes
                })
            elif option == 'bike':
                options.append({
                    'type': 'bike',
                    'name': 'GR Bike Share',
                    'website': 'https://grbikeshare.org',
                    'stations': []  # To be populated with nearby stations
                })
            elif option == 'carshare':
                options.append({
                    'type': 'carshare',
                    'name': 'MDO Carshare',
                    'website': 'https://mdocarshare.com',
                    'locations': []  # To be populated with nearby locations
                })
            elif option == 'walk':
                options.append({
                    'type': 'walk',
                    'estimated_time': '',  # To be calculated
                    'distance': ''  # To be calculated
                })
        return options

@dataclass
class ResourceDirectory:
    def __init__(self):
        self.resources: Dict[str, Resource] = {
            # Housing Resources
            'mshda': Resource(
                name="Michigan State Housing Development Authority (MSHDA)",
                description="State agency providing housing assistance and resources",
                website="https://www.michigan.gov/mshda",
                phone="(517) 335-4100",
                email="",
                address="201 Townsend St, Lansing, MI 48933",
                hours="Mon-Fri 8:00 AM - 5:00 PM",
                eligibility="Low-income families, first-time homebuyers",
                requirements=[
                    "Proof of income",
                    "Credit check",
                    "Employment verification"
                ],
                categories=["Housing", "Financial Assistance"],
                last_updated=datetime.now()
            ),
            'hud': Resource(
                name="U.S. Department of Housing and Urban Development (HUD)",
                description="Federal agency providing housing assistance",
                website="https://www.hud.gov",
                phone="(800) 669-9777",
                email="",
                address="451 7th Street SW, Washington, DC 20410",
                hours="Mon-Fri 8:00 AM - 5:00 PM",
                eligibility="Low-income families, elderly, disabled",
                requirements=[
                    "Citizenship documentation",
                    "Income verification",
                    "Social Security number"
                ],
                categories=["Housing", "Federal Assistance"],
                last_updated=datetime.now()
            ),
            'gr_housing': Resource(
                name="Grand Rapids Housing Commission",
                description="Local housing authority providing affordable housing",
                website="https://www.grhc.org",
                phone="(616) 456-3500",
                email="",
                address="100 James Street SE, Grand Rapids, MI 49503",
                hours="Mon-Fri 8:00 AM - 5:00 PM",
                eligibility="Low-income families, elderly, disabled",
                requirements=[
                    "Income verification",
                    "Citizenship documentation",
                    "Application form"
                ],
                categories=["Housing", "Local Assistance"],
                last_updated=datetime.now()
            ),
            'kids_food_basket': Resource(
                name="Kids Food Basket",
                description="Provides healthy meals to children in need",
                website="https://kidsfoodbasket.org",
                phone="(616) 456-3500",
                email="",
                address="351 Leonard St NW, Grand Rapids, MI 49504",
                hours="Mon-Fri 8:00 AM - 5:00 PM",
                eligibility="Children in need of food assistance",
                requirements=[
                    "School enrollment",
                    "Parental consent",
                    "Application form"
                ],
                categories=["Food Assistance", "Children's Services"],
                last_updated=datetime.now()
            ),
            # Additional Housing Resources
            'gr_low_income_housing': Resource(
                name="Grand Rapids Low Income Housing",
                description="Directory of affordable housing options",
                website="https://www.grlowincomehousing.com",
                phone="",
                email="",
                address="",
                hours="Online",
                eligibility="Low-income families",
                requirements=["Income verification"],
                categories=["Housing", "Affordable Housing"],
                last_updated=datetime.now()
            ),
            'gr_housing_assistance': Resource(
                name="Grand Rapids Housing Assistance",
                description="Local housing assistance programs",
                website="https://www.grhousingassistance.org",
                phone="",
                email="",
                address="",
                hours="Online",
                eligibility="Various",
                requirements=["Application"],
                categories=["Housing", "Local Assistance"],
                last_updated=datetime.now()
            ),
            # Additional Food Resources
            'food_pantries': Resource(
                name="Grand Rapids Food Pantries",
                description="Directory of local food pantries",
                website="https://www.foodpantries.org/st/grand-rapids",
                phone="",
                email="",
                address="",
                hours="Varies by location",
                eligibility="Those in need of food assistance",
                requirements=["Photo ID"],
                categories=["Food Assistance", "Emergency Food"],
                last_updated=datetime.now()
            ),
            'meals_on_wheels': Resource(
                name="Meals on Wheels",
                description="Delivers meals to homebound individuals",
                website="https://www.mealsonwheelsamerica.org",
                phone="",
                email="",
                address="",
                hours="Varies by location",
                eligibility="Homebound elderly or disabled",
                requirements=["Application", "Medical documentation"],
                categories=["Food Assistance", "Home Delivery"],
                last_updated=datetime.now()
            )
        }

    def get_resource(self, resource_id: str) -> Resource:
        """Get specific resource by ID"""
        return self.resources.get(resource_id, None)

    def get_resources_by_category(self, category: str) -> List[Resource]:
        """Get all resources in a specific category"""
        return [r for r in self.resources.values() if category in r.categories]

    def get_all_resources(self) -> List[Resource]:
        """Get all resources"""
        return list(self.resources.values())

    def to_json(self) -> str:
        """Convert resource directory to JSON"""
        return json.dumps({
            resource_id: {
                'name': resource.name,
                'description': resource.description,
                'website': resource.website,
                'phone': resource.phone,
                'email': resource.email,
                'address': resource.address,
                'hours': resource.hours,
                'eligibility': resource.eligibility,
                'requirements': resource.requirements,
                'categories': resource.categories,
                'last_updated': resource.last_updated.isoformat()
            }
            for resource_id, resource in self.resources.items()
        }, indent=2)

    def save_to_file(self, filename: str = "resources.json"):
        """Save resource directory to file"""
        with open(filename, 'w') as f:
            f.write(self.to_json())

    def load_from_file(self, filename: str = "resources.json") -> bool:
        """Load resource directory from file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
                self.resources = {
                    resource_id: Resource(
                        name=resource['name'],
                        description=resource['description'],
                        website=resource['website'],
                        phone=resource['phone'],
                        email=resource['email'],
                        address=resource['address'],
                        hours=resource['hours'],
                        eligibility=resource['eligibility'],
                        requirements=resource['requirements'],
                        categories=resource['categories'],
                        last_updated=datetime.fromisoformat(resource['last_updated'])
                    )
                    for resource_id, resource in data.items()
                }
            return True
        except Exception as e:
            print(f"Error loading resources: {str(e)}")
            return False

if __name__ == "__main__":
    # Example usage
    directory = ResourceDirectory()
    
    # Save to file
    directory.save_to_file()
    
    # Load from file
    directory.load_from_file()
    
    # Get all housing resources
    housing_resources = directory.get_resources_by_category("Housing")
    
    # Get specific resource
    mshda = directory.get_resource("mshda")
    
    # Print all resources
    print(directory.to_json())
