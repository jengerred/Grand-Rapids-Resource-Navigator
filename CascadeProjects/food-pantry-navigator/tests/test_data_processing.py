import pytest
import os
from src.data_processing.processor import DataProcessor
from datetime import datetime

@pytest.fixture
def processor():
    """Create a DataProcessor instance"""
    return DataProcessor()

def test_standardize_address(processor):
    """Test address standardization"""
    address = "123 Main St, Grand Rapids, MI"
    result = processor.standardize_address(address)
    
    assert result['address'] == address
    assert result['city'] == "Grand Rapids"
    assert result['state'] == "MI"
    assert result['latitude'] is not None
    assert result['longitude'] is not None

def test_standardize_hours(processor):
    """Test business hours standardization"""
    # Test regular hours
    hours = "9am-5pm"
    result = processor.standardize_hours(hours)
    assert result['monday'] == hours
    assert result['tuesday'] == hours
    
    # Test 24 hours
    hours = "24 hours"
    result = processor.standardize_hours(hours)
    assert result['monday'] == "24 hours"
    assert result['sunday'] == "24 hours"
    
    # Test closed
    hours = "Closed"
    result = processor.standardize_hours(hours)
    assert result['monday'] == ""
    assert result['sunday'] == ""

def test_standardize_services(processor):
    """Test service category standardization"""
    services = ["Food Pantry", "Housing Assistance", "Legal Aid"]
    result = processor.standardize_services(services)
    
    assert "food assistance" in result
    assert "housing" in result
    assert "legal" in result
    
    # Test unknown service
    services = ["Unknown Service"]
    result = processor.standardize_services(services)
    assert "Unknown Service" in result

def test_process_data(processor):
    """Test processing entire dataset"""
    test_data = [{
        'name': 'Test Location',
        'address': '123 Test St',
        'services': ['Food Pantry'],
        'hours': '9am-5pm',
        'source': 'test'
    }]
    
    result = processor.process_data(test_data)
    
    assert len(result) == 1
    processed = result[0]
    
    assert processed['name'] == 'Test Location'
    assert processed['address'] == '123 Test St'
    assert processed['services'] == ['food assistance']
    assert processed['hours']['monday'] == '9am-5pm'
    assert processed['source'] == 'test'
    assert processed['latitude'] is not None
    assert processed['longitude'] is not None

def test_save_processed_data(processor, tmp_path):
    """Test saving processed data"""
    test_data = [{
        'name': 'Test Location',
        'address': '123 Test St',
        'services': ['Food Pantry'],
        'hours': '9am-5pm',
        'source': 'test'
    }]
    
    # Create temporary directory
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    
    # Save data
    filename = "processed_test_data"
    processor.save_processed_data(test_data, filename)
    
    # Check files exist
    assert (data_dir / f"{filename}.csv").exists()
    assert (data_dir / f"{filename}.json").exists()
    
    # Check CSV content
    df = pd.read_csv(data_dir / f"{filename}.csv")
    assert len(df) == 1
    assert df['name'][0] == 'Test Location'
    
    # Check JSON content
    with open(data_dir / f"{filename}.json", 'r') as f:
        data = json.load(f)
        assert len(data) == 1
        assert data[0]['name'] == 'Test Location'
