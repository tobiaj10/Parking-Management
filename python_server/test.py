import requests
import json
import os

# Base URL for API requests
# Set API_PORT environment variable to switch between Node.js (5000) and Python (5001) servers
API_PORT = os.getenv('API_PORT', '5000')
BASE_URL = f'http://localhost:{API_PORT}/api'

def test_api_connection():
    """Test the API connection to ensure the server is running."""
    api_url = f'{BASE_URL}/status'
    try:
        response = requests.get(api_url)
        assert response.status_code == 200
        assert response.json()['status'] == 'ok'
        print(f"✓ API Connection Test Successful at {api_url}")
        print(f"  Running with FastAPI: {API_PORT == '5001'}")
        return True
    except Exception as e:
        print(f"✗ API Connection Test Failed: {e}")
        return False

def test_garage_stats():
    """Test retrieving garage statistics."""
    try:
        response = requests.get(f'{BASE_URL}/garage/stats')
        assert response.status_code == 200
        data = response.json()
        assert 'totalSpaces' in data
        assert 'occupiedSpaces' in data
        assert 'availableSpaces' in data
        print("✓ Garage Stats Test Successful")
        print(f"  Total Spaces: {data['totalSpaces']}")
        print(f"  Occupied Spaces: {data['occupiedSpaces']}")
        print(f"  Available Spaces: {data['availableSpaces']}")
        return True
    except Exception as e:
        print(f"✗ Garage Stats Test Failed: {e}")
        return False

def test_create_ticket():
    """Test creating a new parking ticket."""
    try:
        payload = {
            'licensePlate': 'TEST123',
            'vehicleType': 'Car'
        }
        response = requests.post(f'{BASE_URL}/tickets', json=payload)
        assert response.status_code == 201
        data = response.json()
        assert 'ticketNumber' in data
        assert data['licensePlate'] == 'TEST123'
        assert data['vehicleType'] == 'Car'
        assert data['status'] == 'active'
        print("✓ Create Ticket Test Successful")
        print(f"  Ticket Number: {data['ticketNumber']}")
        return data['ticketNumber']
    except Exception as e:
        print(f"✗ Create Ticket Test Failed: {e}")
        return None

def test_get_ticket(ticket_number):
    """Test retrieving a ticket by number."""
    try:
        response = requests.get(f'{BASE_URL}/tickets/{ticket_number}')
        assert response.status_code == 200
        data = response.json()
        assert data['ticketNumber'] == ticket_number
        print("✓ Get Ticket Test Successful")
        return True
    except Exception as e:
        print(f"✗ Get Ticket Test Failed: {e}")
        return False

def test_process_exit(ticket_number):
    """Test processing a vehicle exit."""
    try:
        payload = {
            'paymentMethod': 'Credit Card'
        }
        response = requests.put(f'{BASE_URL}/tickets/{ticket_number}/exit', json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data['ticketNumber'] == ticket_number
        assert data['status'] == 'completed'
        assert data['paymentMethod'] == 'Credit Card'
        assert data['amountPaid'] is not None
        print("✓ Process Exit Test Successful")
        print(f"  Duration: {data['durationMinutes']} minutes")
        print(f"  Amount Paid: ${data['amountPaid']/100:.2f}")
        return True
    except Exception as e:
        print(f"✗ Process Exit Test Failed: {e}")
        return False

def test_get_activities():
    """Test retrieving recent activities."""
    try:
        response = requests.get(f'{BASE_URL}/activities')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("✓ Get Activities Test Successful")
        print(f"  Activities retrieved: {len(data)}")
        return True
    except Exception as e:
        print(f"✗ Get Activities Test Failed: {e}")
        return False

def test_api_docs():
    """Test accessing API documentation (FastAPI specific)."""
    if API_PORT == '5001':  # Only test for FastAPI
        try:
            # Test OpenAPI docs endpoints
            docs_response = requests.get(f'http://localhost:{API_PORT}/docs')
            assert docs_response.status_code == 200
            
            openapi_response = requests.get(f'http://localhost:{API_PORT}/openapi.json')
            assert openapi_response.status_code == 200
            
            print("✓ API Documentation Test Successful")
            print("  Swagger UI and OpenAPI schema available")
            return True
        except Exception as e:
            print(f"✗ API Documentation Test Failed: {e}")
            return False
    return None  # Skip for non-FastAPI

def run_all_tests():
    """Run all API tests sequentially."""
    print(f"\n=== Running API Tests on port {API_PORT} ===\n")
    print(f"Backend: {'FastAPI' if API_PORT == '5001' else 'Express.js'}")
    
    # Test API connection
    if not test_api_connection():
        print(f"\n❌ API connection failed. Make sure the server is running on port {API_PORT}.")
        return
    
    # Test garage stats
    test_garage_stats()
    
    # Test ticket operations
    ticket_number = test_create_ticket()
    if ticket_number:
        test_get_ticket(ticket_number)
        test_process_exit(ticket_number)
    
    # Test activities
    test_get_activities()
    
    # Test FastAPI-specific features
    if API_PORT == '5001':
        test_api_docs()
    
    print(f"\n=== API Tests Complete (port {API_PORT}) ===\n")

if __name__ == "__main__":
    run_all_tests()