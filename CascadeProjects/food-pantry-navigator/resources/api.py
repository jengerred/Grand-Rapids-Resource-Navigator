from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime
import os
from dotenv import load_dotenv
from .resource_directory import ResourceDirectory

# Load environment variables
load_dotenv()

app = FastAPI(title="Resource Directory API")

# Initialize resource directory
resource_directory = ResourceDirectory()

# Load resources from file
if not resource_directory.load_from_file():
    print("Warning: Could not load resources from file. Using default resources.")

class Resource(BaseModel):
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

class ResourceResponse(BaseModel):
    resources: List[Resource]
    total_count: int
    timestamp: datetime

@app.get("/api/resources", response_model=ResourceResponse)
async def get_resources(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: Optional[int] = 100
):
    """Get resources with optional filtering"""
    try:
        if category:
            resources = resource_directory.get_resources_by_category(category)
        else:
            resources = resource_directory.get_all_resources()
            
        if search:
            resources = [
                r for r in resources
                if (search.lower() in r.name.lower() or
                    search.lower() in r.description.lower() or
                    search.lower() in r.address.lower())
            ]
            
        if limit:
            resources = resources[:limit]
            
        return ResourceResponse(
            resources=resources,
            total_count=len(resources),
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{resource_id}", response_model=Resource)
async def get_resource(resource_id: str):
    """Get specific resource by ID"""
    resource = resource_directory.get_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@app.get("/api/categories")
async def get_categories():
    """Get all available categories"""
    categories = set()
    for resource in resource_directory.get_all_resources():
        categories.update(resource.categories)
    return list(categories)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "resources.api:app",
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', 8001)),
        reload=True
    )
