import asyncio
import json
import logging
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from fastapi.websockets import WebSocketState
from redis import Redis
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Redis configuration
redis_host = os.getenv('REDIS_HOST', 'localhost')
redis_port = int(os.getenv('REDIS_PORT', 6379))
redis_db = int(os.getenv('REDIS_DB', 0))

# Set up Redis connection
redis_client = Redis(host=redis_host, port=redis_port, db=redis_db)

# Set up logger
logger = logging.getLogger(__name__)

# Store active connections
active_connections: Dict[str, Set[WebSocket]] = {}

async def get_redis_data(cache_key: str) -> Dict:
    """Get data from Redis cache"""
    try:
        data = redis_client.get(cache_key)
        if data:
            return json.loads(data)
        return {}
    except Exception as e:
        logger.error(
            "Error getting data from Redis",
            error=str(e)
        )
        return {}

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, location_id: str):
        """Connect a new websocket"""
        await websocket.accept()
        if location_id not in self.active_connections:
            self.active_connections[location_id] = set()
        self.active_connections[location_id].add(websocket)
        logger.info(
            "WebSocket connected",
            location_id=location_id,
            total_connections=len(self.active_connections[location_id])
        )
        
    def disconnect(self, websocket: WebSocket, location_id: str):
        """Disconnect a websocket"""
        if location_id in self.active_connections:
            self.active_connections[location_id].discard(websocket)
            logger.info(
                "WebSocket disconnected",
                location_id=location_id,
                total_connections=len(self.active_connections[location_id])
            )
            
    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        """Send message to a single connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(
                "Error sending personal message",
                error=str(e)
            )
            
    async def broadcast_message(self, message: Dict, location_id: str):
        """Broadcast message to all connections for a location"""
        if location_id in self.active_connections:
            for connection in self.active_connections[location_id]:
                if connection.application_state == WebSocketState.CONNECTED:
                    await self.send_personal_message(message, connection)

websocket_manager = WebSocketManager()

@router.websocket("/ws/{location_id}")
async def websocket_endpoint(websocket: WebSocket, location_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket_manager.connect(websocket, location_id)
    try:
        while True:
            # Get latest data from Redis
            foodbank_data = await get_redis_data('foodbank:inventory')
            weather_data = await get_redis_data(f'weather:{location_id}')
            queue_data = await get_redis_data(f'queue:{location_id}')
            
            # Send combined data
            data = {
                'timestamp': datetime.now().isoformat(),
                'foodbank': foodbank_data,
                'weather': weather_data,
                'queue': queue_data
            }
            
            await websocket_manager.send_personal_message(data, websocket)
            
            # Wait before next update
            await asyncio.sleep(30)  # Update every 30 seconds
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, location_id)
    except Exception as e:
        logger.error(
            "WebSocket error",
            error=str(e)
        )
        websocket_manager.disconnect(websocket, location_id)

async def update_websocket_clients():
    """Update all websocket clients with latest data"""
    while True:
        try:
            # Get all location IDs
            location_ids = redis_client.smembers('location_ids')
            
            # Update each location's clients
            for location_id in location_ids:
                foodbank_data = await get_redis_data('foodbank:inventory')
                weather_data = await get_redis_data(f'weather:{location_id}')
                queue_data = await get_redis_data(f'queue:{location_id}')
                
                # Send combined data
                data = {
                    'timestamp': datetime.now().isoformat(),
                    'foodbank': foodbank_data,
                    'weather': weather_data,
                    'queue': queue_data
                }
                
                await websocket_manager.broadcast_message(data, location_id)
                
            # Wait before next update
            await asyncio.sleep(30)  # Update every 30 seconds
            
        except Exception as e:
            logger.error(
                "Error updating websocket clients",
                error=str(e)
            )
            await asyncio.sleep(30)

# Start background task for updates
async def start_updates():
    task = asyncio.create_task(update_websocket_clients())
    return task
