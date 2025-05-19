import pytest
import os
from src.data_collection.feeder import ServiceFeeder
from datetime import datetime

@pytest.fixture
def feeder():
    """Create a ServiceFeeder instance"""
    return ServiceFeeder()

def test_standardize_address(feeder):
    """Test address standardization"""
    address = "123 Main St, Grand Rapids, MI"
    result = feeder.standardize_address(address)
    
    assert result['address'] == address
    assert result['city'] == "Grand Rapids"
    assert result['state'] == "MI"
    assert result['latitude'] is not None
    assert result['longitude'] is not None

def test_standardize_hours(feeder):
    """Test business hours standardization"""
    # Test regular hours
    hours = "9am-5pm"
    result = feeder.standardize_hours(hours)
    assert result['monday'] == hours
    assert result['tuesday'] == hours
    
    # Test 24 hours
    hours = "24 hours"
    result = feeder.standardize_hours(hours)
    assert result['monday'] == "24 hours"
    assert result['sunday'] == "24 hours"
    
    # Test closed
    hours = "Closed"
    result = feeder.standardize_hours(hours)
    assert result['monday'] == ""
    assert result['sunday'] == ""

def test_standardize_services(feeder):
    """Test service category standardization"""
    services = ["Food Pantry", "Housing Assistance", "Legal Aid"]
    result = feeder.standardize_services(services)
    
    assert "food assistance" in result
    assert "housing" in result
    assert "legal" in result
    
    # Test unknown service
    services = ["Unknown Service"]
    result = feeder.standardize_services(services)
    assert "Unknown Service" in result

def test_collect_all_data(feeder, monkeypatch):
    """Test collecting data from all sources"""
    # Mock the data collection methods
    mock_data = [{
        'name': 'Test Location',
        'address': '123 Test St',
        'services': ['Test Service'],
        'hours': '9am-5pm'
    }]
    
    monkeypatch.setattr(feeder, 'get_feeding_wm_data', lambda: mock_data)
    monkeypatch.setattr(feeder, 'get_salvation_army_data', lambda: mock_data)
    monkeypatch.setattr(feeder, 'get_dhhs_data', lambda: mock_data)
    monkeypatch.setattr(feeder, 'get_ywca_data', lambda: mock_data)
    
    result = feeder.collect_all_data()
    
    assert len(result) == 4  # One from each source
    for item in result:
        assert 'source' in item
        assert 'name' in item
        assert 'address' in item

def test_save_data(feeder, tmp_path):
    """Test saving data to files"""
    test_data = [{
        'name': 'Test Location',
        'address': '123 Test St',
        'services': ['Test Service'],
        'hours': '9am-5pm'
    }]
    
    # Create temporary directory
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    
    # Save data
    filename = "test_data"
    feeder.save_data(test_data, filename)
    
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
