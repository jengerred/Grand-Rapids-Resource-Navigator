import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
from datetime import datetime
import requests
import json
import os

# Constants for feature engineering
HOLIDAYS = [
    (1, 1),  # New Year's Day
    (7, 4),  # Independence Day
    (12, 25),  # Christmas Day
]

WEATHER_CONDITIONS = {
    'clear': 0,
    'rain': 1,
    'snow': 2,
    'cloudy': 3,
    'thunderstorm': 4
}

class DemandPredictor:
    def __init__(self):
        """Initialize the demand prediction model"""
        self.model = None
        self.features = [
            'day_of_week',
            'hour_of_day',
            'is_holiday',
            'temperature',
            'weather_condition',
            'unemployment_rate',
            'poverty_rate'
        ]

    def get_weather_data(self, lat: float, lon: float, date: datetime) -> dict:
        """Get weather data from OpenWeatherMap API"""
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        if not api_key:
            raise ValueError("OPENWEATHERMAP_API_KEY not found in environment")
            
        url = f"http://api.openweathermap.org/data/2.5/weather?"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': api_key,
            'units': 'metric'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            return {
                'temperature': data['main']['temp'],
                'weather_condition': WEATHER_CONDITIONS.get(
                    data['weather'][0]['main'].lower(),
                    0
                )
            }
        except Exception as e:
            print(f"Error getting weather data: {str(e)}")
            return {'temperature': 20, 'weather_condition': 0}  # Default values

    def get_socioeconomic_data(self, lat: float, lon: float) -> dict:
        """Get socioeconomic data from local data sources"""
        # This would typically come from a local data source or API
        # For now, return mock data
        return {
            'unemployment_rate': 5.2,
            'poverty_rate': 18.5
        }

    def create_features(self, lat: float, lon: float, date: datetime) -> dict:
        """Create features for prediction"""
        # Get weather data
        weather_data = self.get_weather_data(lat, lon, date)
        
        # Get socioeconomic data
        socio_data = self.get_socioeconomic_data(lat, lon)
        
        # Create time-based features
        day_of_week = date.weekday()
        hour_of_day = date.hour
        is_holiday = 1 if (date.month, date.day) in HOLIDAYS else 0
        
        return {
            'day_of_week': day_of_week,
            'hour_of_day': hour_of_day,
            'is_holiday': is_holiday,
            'temperature': weather_data['temperature'],
            'weather_condition': weather_data['weather_condition'],
            'unemployment_rate': socio_data['unemployment_rate'],
            'poverty_rate': socio_data['poverty_rate']
        }

    def train_model(self, training_data: pd.DataFrame):
        """Train the demand prediction model"""
        X = training_data[self.features]
        y = training_data['demand']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        print(f"Model trained. MSE: {mse:.2f}")
        
        # Save model
        joblib.dump(self.model, 'models/demand_predictor_model.pkl')

    def predict_demand(self, lat: float, lon: float, date: datetime) -> float:
        """Predict demand for a specific location and time"""
        if not self.model:
            try:
                self.model = joblib.load('models/demand_predictor_model.pkl')
            except:
                raise ValueError("Model not found. Please train the model first.")
                
        features = self.create_features(lat, lon, date)
        X = pd.DataFrame([features])
        
        return self.model.predict(X)[0]

if __name__ == "__main__":
    # Example usage
    predictor = DemandPredictor()
    
    # Create mock training data
    np.random.seed(42)
    dates = pd.date_range(start='2024-01-01', end='2024-01-31', freq='H')
    
    training_data = pd.DataFrame({
        'date': dates,
        'day_of_week': [d.weekday() for d in dates],
        'hour_of_day': [d.hour for d in dates],
        'is_holiday': [1 if (d.month, d.day) in HOLIDAYS else 0 for d in dates],
        'temperature': np.random.normal(15, 5, len(dates)),
        'weather_condition': np.random.choice(list(WEATHER_CONDITIONS.values()), len(dates)),
        'unemployment_rate': np.random.normal(5.2, 0.5, len(dates)),
        'poverty_rate': np.random.normal(18.5, 2.0, len(dates)),
        'demand': np.random.normal(50, 10, len(dates))
    })
    
    # Train the model
    predictor.train_model(training_data)
    
    # Make a prediction
    lat = 42.9634  # Grand Rapids coordinates
    lon = -85.6681
    date = datetime(2024, 1, 15, 12)  # January 15th, 2024 at noon
    
    predicted_demand = predictor.predict_demand(lat, lon, date)
    print(f"Predicted demand: {predicted_demand:.2f}")
