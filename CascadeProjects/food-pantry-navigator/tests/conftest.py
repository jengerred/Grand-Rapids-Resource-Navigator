import pytest
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

# Load environment variables
load_dotenv()

def pytest_configure(config):
    """Configure pytest settings"""
    # Set test database URL
    os.environ['DATABASE_URL'] = 'postgresql://user:password@localhost:5432/social_services_test'

def pytest_sessionstart(session):
    """Create test database before test session starts"""
    db_url = os.getenv('DATABASE_URL')
    engine = create_engine(db_url)
    
    if not database_exists(engine.url):
        create_database(engine.url)
        
    # Create tables using schema.sql
    with open('../schema.sql', 'r') as f:
        sql_commands = f.read()
        
    with engine.connect() as connection:
        connection.execute(sql_commands)

def pytest_sessionfinish(session, exitstatus):
    """Drop test database after test session finishes"""
    db_url = os.getenv('DATABASE_URL')
    engine = create_engine(db_url)
    
    if database_exists(engine.url):
        engine.dispose()
        os.system(f'dropdb {db_url.split("/")[-1]}')

@pytest.fixture(scope='session')
def test_engine():
    """Create a test database engine"""
    db_url = os.getenv('DATABASE_URL')
    engine = create_engine(db_url)
    return engine

@pytest.fixture(scope='function')
def test_db(test_engine):
    """Provide a clean database for each test"""
    # Start transaction
    connection = test_engine.connect()
    transaction = connection.begin()
    
    # Yield connection
    yield connection
    
    # Rollback transaction after test
    transaction.rollback()
    connection.close()
