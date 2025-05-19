import os
from dotenv import load_dotenv
import subprocess
import sys

# Load environment variables
load_dotenv()

def create_virtualenv():
    """Create and activate virtual environment"""
    print("Creating virtual environment...")
    subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Activate virtual environment
    if os.name == 'nt':  # Windows
        activate_cmd = ["venv\\Scripts\\activate"]
    else:  # Unix/Linux/Mac
        activate_cmd = ["source", "venv/bin/activate"]
    
    print("Virtual environment created and activated")
    return activate_cmd

def install_dependencies():
    """Install project dependencies"""
    print("Installing dependencies...")
    subprocess.run(["pip", "install", "-r", "requirements.txt"])
    print("Dependencies installed successfully")

def setup_database():
    """Set up PostgreSQL database"""
    print("Setting up database...")
    
    # Create database and tables
    subprocess.run(["python", "setup_database.py"])
    print("Database setup complete")

def main():
    print("Starting project setup...")
    
    # Create virtual environment
    create_virtualenv()
    
    # Install dependencies
    install_dependencies()
    
    # Set up database
    setup_database()
    
    print("\nProject setup complete!")
    print("To start the application:")
    print("1. Activate the virtual environment:")
    print("   source venv/bin/activate")
    print("2. Run the application:")
    print("   streamlit run app.py")

if __name__ == "__main__":
    main()
