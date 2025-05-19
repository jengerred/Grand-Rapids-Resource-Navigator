import streamlit as st
import folium
from streamlit_folium import folium_static
import geopandas as gpd
import pandas as pd
from datetime import datetime
import requests
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
import json

# Load environment variables
load_dotenv()

# Initialize the app
st.set_page_config(page_title="Food Resource Navigator", layout="wide")

# App title and description
st.title("AI-Powered Food Resource Navigator")
st.markdown("""
Welcome to the Food Resource Navigator! This tool helps you find food pantries and social services in Grand Rapids, 
with AI-powered demand prediction and optimized routing.
""")

# Load data from PostgreSQL
def load_data():
    """Load social services data from PostgreSQL database"""
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    engine = create_engine(db_url)
    
    query = """
    SELECT 
        o.name as organization_name,
        o.type as organization_type,
        l.address,
        l.city,
        l.state,
        l.zip_code,
        l.latitude,
        l.longitude,
        l.hours,
        l.wheelchair_accessible,
        string_agg(s.name, ', ') as services,
        string_agg(r.requirement, ', ') as requirements
    FROM organizations o
    JOIN locations l ON o.id = l.organization_id
    LEFT JOIN organization_services os ON o.id = os.organization_id
    LEFT JOIN services s ON os.service_id = s.id
    LEFT JOIN requirements r ON o.id = r.organization_id AND s.id = r.service_id
    GROUP BY o.id, l.id
    ORDER BY o.type, o.name;
    """
    
    df = pd.read_sql(query, engine)
    return df

# Load service categories
def load_service_categories():
    """Load available service categories"""
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    engine = create_engine(db_url)
    
    query = "SELECT DISTINCT category FROM services ORDER BY category;"
    df = pd.read_sql(query, engine)
    return df['category'].tolist()

pantries = load_data()

# Create map
m = folium.Map(location=[42.9634, -85.6681], zoom_start=13)

# Add sidebar filters
with st.sidebar:
    st.header("Filters")
    
    # Service type filter
    service_categories = load_service_categories()
    selected_categories = st.multiselect(
        "Select Service Categories",
        service_categories,
        default=service_categories
    )
    
    # Organization type filter
    org_types = ['food_pantry', 'dhhs', 'ywca', 'salvation_army']
    selected_org_types = st.multiselect(
        "Select Organization Types",
        org_types,
        default=org_types
    )
    
    # Accessibility filter
    accessible_only = st.checkbox("Show only wheelchair accessible locations")

# Load and filter data
services_df = load_data()
filtered_df = services_df[
    (services_df['organization_type'].isin(selected_org_types)) &
    (services_df['wheelchair_accessible'] | ~accessible_only)
]

# Add markers to map
for _, row in filtered_df.iterrows():
    icon_color = 'green' if row['organization_type'] == 'food_pantry' \
        else 'blue' if row['organization_type'] == 'dhhs' \
        else 'purple' if row['organization_type'] == 'ywca' \
        else 'red'
    
    folium.Marker(
        [row['latitude'], row['longitude']],
        popup=f"{row['organization_name']}\n" +
              f"{row['address']}\n" +
              f"Hours: {row['hours']}\n" +
              f"Services: {row['services']}\n" +
              f"Requirements: {row['requirements']}",
        icon=folium.Icon(color=icon_color, icon='info-sign')
    ).add_to(m)

# Display map
st.markdown("### Social Services Map")
folium_static(m)

# Show filtered list
st.markdown("### Service Directory")
if len(filtered_df) > 0:
    st.dataframe(filtered_df[['organization_name', 'address', 'organization_type', 'services', 'hours']])
else:
    st.info("No services match your filters. Try adjusting the filters in the sidebar.")

# AI Demand Prediction
st.markdown("### AI-Powered Demand Prediction")
with st.expander("Predict Demand", expanded=True):
    col1, col2 = st.columns(2)
    
    with col1:
        date = st.date_input("Select Date", datetime.now().date())
        time = st.time_input("Select Time", datetime.now().time())
    
    with col2:
        weather = st.selectbox("Weather Condition", ["Sunny", "Rainy", "Snowy"])
        
    if st.button("Predict Demand"):
        # This will be replaced with actual prediction logic
        st.write("Predicted demand will be shown here")

# Route Optimization
st.markdown("### Route Optimization")
with st.expander("Find Optimal Route", expanded=True):
    start = st.text_input("Starting Location", "123 Main St")
    destination = st.selectbox("Select Service", filtered_df['organization_name'].tolist())
    
    if st.button("Find Route"):
        # This will be replaced with actual routing logic
        st.write("Optimal route will be shown here")

# Resource Directory
st.markdown("### Resource Directory")
with st.expander("View All Services", expanded=True):
    st.markdown("""
    This directory lists all available social services in Grand Rapids, organized by type:
    
    - 🍎 **Food Pantries**: Emergency food assistance
    - 🏥 **DHHS**: Government assistance programs
    - 🏠 **YWCA**: Women and family services
    - 🙏 **Salvation Army**: Emergency shelter and food services
    """)
    
    # Show services grouped by type
    for org_type in org_types:
        type_df = filtered_df[filtered_df['organization_type'] == org_type]
        if len(type_df) > 0:
            st.subheader(f"{org_type.replace('_', ' ').title()} ({len(type_df)})")
            st.dataframe(type_df[['organization_name', 'address', 'services', 'hours']])

# Route Optimization
st.markdown("### Route Optimization")
with st.expander("Find Optimal Route", expanded=True):
    start = st.text_input("Starting Location", "123 Main St")
    destination = st.selectbox("Select Food Pantry", pantries['name'].tolist())
    
    if st.button("Find Route"):
        # This will be replaced with actual routing logic
        st.write("Optimal route will be shown here")

# Footer
st.markdown("""---
Created for social good using AI and geospatial data. 
This project demonstrates technical capabilities in geospatial analysis, machine learning, and web development.
""")
