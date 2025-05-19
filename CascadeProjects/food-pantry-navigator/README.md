# AI-Powered Food Resource Navigator

An intelligent mapping tool for Grand Rapids food pantries and social services, leveraging AI for demand prediction and route optimization.

## Features

- Interactive map of Grand Rapids food pantries
- AI-powered demand prediction based on socioeconomic data
- Route optimization for users and volunteers
- Real-time traffic integration
- Weather impact analysis

## Tech Stack

- **Geospatial Analysis**: Geopandas, Folium, OSMnx
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-learn, TensorFlow
- **Web Interface**: Streamlit
- **Database**: PostgreSQL

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run the application:
```bash
streamlit run app.py
```

## Data Sources

- Food Pantry Locations: Feeding America West Michigan, Salvation Army Kent County
- Socioeconomic Data: Michigan Open Data Portal, Census Data
- Weather Data: OpenWeatherMap API
- Traffic Data: Mapbox API

## Project Structure

```
food-pantry-navigator/
├── data/              # Raw and processed data
├── notebooks/         # Jupyter notebooks for analysis
├── src/              # Source code
│   ├── data/         # Data processing modules
│   ├── models/       # Machine learning models
│   └── utils/        # Utility functions
├── app.py            # Streamlit application
└── requirements.txt  # Project dependencies
```
