import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

# Load environment variables
load_dotenv()

def setup_database():
    """Set up the PostgreSQL database and create tables"""
    # Get database URL from environment
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found in environment variables")

    # Create engine
    engine = create_engine(db_url)

    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        print("Database created successfully!")
    else:
        print("Database already exists")

    # Create tables using schema.sql
    with open('schema.sql', 'r') as f:
        sql_commands = f.read()
        
    # Execute SQL commands
    with engine.connect() as connection:
        connection.execute(sql_commands)
        print("Tables created successfully!")

    print("Database setup complete!")

if __name__ == "__main__":
    setup_database()
