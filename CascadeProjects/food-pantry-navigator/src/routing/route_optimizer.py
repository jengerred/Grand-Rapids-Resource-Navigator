import osmnx as ox
import networkx as nx
from geopy.geocoders import Nominatim
import time
from datetime import datetime
from typing import Tuple

# Initialize geolocator
geolocator = Nominatim(user_agent="food_pantry_navigator")

class RouteOptimizer:
    def __init__(self):
        """Initialize the route optimizer with Grand Rapids graph"""
        # Load the street network for Grand Rapids
        self.graph = ox.graph_from_place(
            "Grand Rapids, Michigan",
            network_type="drive",
            simplify=True
        )
        
        # Add edge speeds and calculate travel times
        self.graph = ox.add_edge_speeds(self.graph)
        self.graph = ox.add_edge_travel_times(self.graph)

    def geocode_address(self, address: str) -> Tuple[float, float]:
        """Geocode an address to latitude and longitude"""
        try:
            location = geolocator.geocode(address)
            if location:
                return location.latitude, location.longitude
            raise ValueError("Address not found")
        except Exception as e:
            raise ValueError(f"Error geocoding address: {str(e)}")

    def get_nearest_node(self, lat: float, lon: float) -> int:
        """Get the nearest node in the graph to the given coordinates"""
        return ox.distance.nearest_nodes(self.graph, lon, lat)

    def calculate_route(self, start_address: str, end_address: str) -> dict:
        """Calculate the optimal route between two addresses"""
        try:
            # Geocode addresses
            start_lat, start_lon = self.geocode_address(start_address)
            end_lat, end_lon = self.geocode_address(end_address)
            
            # Get nearest nodes
            start_node = self.get_nearest_node(start_lat, start_lon)
            end_node = self.get_nearest_node(end_lat, end_lon)
            
            # Calculate shortest path
            route = nx.shortest_path(
                self.graph,
                source=start_node,
                target=end_node,
                weight='travel_time'
            )
            
            # Get route details
            route_details = {
                'route': route,
                'length': nx.shortest_path_length(
                    self.graph,
                    source=start_node,
                    target=end_node,
                    weight='length'
                ),
                'time': nx.shortest_path_length(
                    self.graph,
                    source=start_node,
                    target=end_node,
                    weight='travel_time'
                ),
                'coordinates': ox.utils_graph.get_route_edge_attributes(
                    self.graph,
                    route,
                    'geometry'
                )
            }
            
            return route_details
            
        except Exception as e:
            raise ValueError(f"Error calculating route: {str(e)}")

    def get_route_map(self, route_details: dict) -> folium.Map:
        """Create a Folium map showing the route"""
        # Create map centered on the route
        start_lat = route_details['coordinates'][0].coords[0][1]
        start_lon = route_details['coordinates'][0].coords[0][0]
        
        m = folium.Map(location=[start_lat, start_lon], zoom_start=14)
        
        # Add route to map
        folium.PolyLine(
            locations=[(coord[1], coord[0]) for coord in route_details['coordinates']],
            color="blue",
            weight=5,
            opacity=0.7
        ).add_to(m)
        
        return m

if __name__ == "__main__":
    # Example usage
    optimizer = RouteOptimizer()
    start = "123 Main St, Grand Rapids, MI"
    end = "456 Oak Ave, Grand Rapids, MI"
    
    try:
        route_details = optimizer.calculate_route(start, end)
        print(f"Route length: {route_details['length']:.2f} meters")
        print(f"Travel time: {route_details['time']:.2f} seconds")
        
        # Create and save map
        route_map = optimizer.get_route_map(route_details)
        route_map.save("route_map.html")
        
    except Exception as e:
        print(f"Error: {str(e)}")
