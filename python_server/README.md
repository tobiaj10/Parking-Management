# Parking Garage Management System - Python Backend

This is the Python backend for the Parking Garage Management System. It provides API endpoints for managing parking tickets, tracking vehicle entry/exit, and calculating fees.

## Overview

The Parking Garage Management System helps manage parking operations with the following features:
- Issue tickets for vehicles entering the garage
- Calculate fees based on duration ($10/hour)
- Process payments for exiting vehicles
- Track garage occupancy and statistics
- View activity history

## API Endpoints

### Status
- `GET /api/status` - Check API availability

### Garage Statistics
- `GET /api/garage/stats` - Get current garage statistics

### Tickets
- `POST /api/tickets` - Create a new ticket (vehicle entry)
- `GET /api/tickets/:ticketNumber` - Get ticket information
- `PUT /api/tickets/:ticketNumber/exit` - Process vehicle exit with payment

### Activities
- `GET /api/activities` - Get recent parking activities

## Database Models

- **User**: System users
- **Ticket**: Parking tickets with entry/exit information
- **GarageSetting**: Configuration for garage capacity and rates

## Running the Backend

To run the Python backend:

```bash
cd python_server
python run.py
```

## Testing

To test the API endpoints:

```bash
cd python_server
python test.py
```