from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .websocket_handler import router as websocket_router
from .websocket_handler import start_updates
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Food Pantry Navigator Real-time API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include websocket router
app.include_router(websocket_router)

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting real-time data collection")
    # Start websocket updates
    asyncio.create_task(start_updates())

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Food Pantry Navigator Real-time API"}

if __name__ == "__main__":
    uvicorn.run(
        "realtime:app",
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', 8000)),
        reload=True
    )
