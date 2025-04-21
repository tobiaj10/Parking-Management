import requests
import json

def test_api_connection():
    """Test the API connection to ensure the server is running."""
    try:
        response = requests.get('http://localhost:5000/api/status')
        assert response.status_code == 200
        assert response.json()['status'] == 'ok'
        print("✓ API Connection Test Successful")
        return True
    except Exception as e:
        print(f"✗ API Connection Test Failed: {e}")
        return False

def test_garage_stats():
    """Test retrieving garage statistics."""
    try:
        response = requests.get('http://localhost:5000/api/garage/stats')
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
        response = requests.post('http://localhost:5000/api/tickets', json=payload)
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
        response = requests.get(f'http://localhost:5000/api/tickets/{ticket_number}')
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
        response = requests.put(f'http://localhost:5000/api/tickets/{ticket_number}/exit', json=payload)
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
        response = requests.get('http://localhost:5000/api/activities')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("✓ Get Activities Test Successful")
        print(f"  Activities retrieved: {len(data)}")
        return True
    except Exception as e:
        print(f"✗ Get Activities Test Failed: {e}")
        return False

def run_all_tests():
    """Run all API tests sequentially."""
    print("\n=== Running Python Backend API Tests ===\n")
    
    # Test API connection
    if not test_api_connection():
        print("\n❌ API connection failed. Make sure the server is running.")
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
    
    print("\n=== Python Backend API Tests Complete ===\n")

if __name__ == "__main__":
    run_all_tests()