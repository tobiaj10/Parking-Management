# Parking Garage Management System - Migration Guide

This document outlines the migration process from the TypeScript backend to the Python backend.

## Migration Status

The migration of the backend from TypeScript (Node.js) to Python (Flask) is in progress. Both versions can currently be run simultaneously for testing and comparison.

### Completed Tasks

- ✅ Created Python server structure (models.py, database.py, app.py, run.py)
- ✅ Installed all required Python dependencies
- ✅ Implemented database models and connections
- ✅ Created API endpoints for all core functionality
  - Status check
  - Garage statistics
  - Ticket creation and retrieval
  - Exit processing with payment
  - Activity listing
- ✅ Added test scripts for validation
- ✅ Configured Python server to run on port 5001 (avoiding conflict with Node.js server on port 5000)

### Testing

The migration includes test scripts to validate API functionality:

```bash
# Test Node.js server (running on port 5000)
./python_server/test_server.sh

# Test Python server (running on port 5001)
./python_server/test_server.sh python
```

Or directly:

```bash
# Test Node.js server
API_PORT=5000 python python_server/test.py

# Test Python server
API_PORT=5001 python python_server/test.py
```

### Running the Servers

#### Node.js Server (Original)
```bash
npm run dev  # Runs on port 5000
```

#### Python Server (Migration Target)
```bash
cd python_server
python run.py  # Runs on port 5001
```

## Migration Plan

### Remaining Tasks

1. Create a workflow for the Python server
2. Switch the frontend to use the Python API instead of Node.js
3. Fully test the system with the new backend
4. Once validated, update the port in the Python server to use port 5000
5. Decommission the Node.js backend

### Migration Strategy

The migration is being performed with a phased approach:

1. **Parallel Implementation**: Both backends are maintained simultaneously
2. **Functional Parity**: Ensuring the Python backend matches all Node.js functionality
3. **Incremental Testing**: Testing each component as it's migrated
4. **Switchover**: Moving the frontend to the new backend once it's fully validated

## Database

Both backends use the same PostgreSQL database, ensuring data consistency during the migration period.

## Frontend

The frontend code does not need significant changes as the API interface remains the same. The only potential change would be updating the API port if needed during the testing phase.