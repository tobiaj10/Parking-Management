# Parking Garage Management System - Design Document

## 1. System Overview

The Parking Garage Management System is a web application designed to manage parking operations for a garage with the following core functionality:
- Tracking available parking spaces
- Issuing tickets when vehicles enter
- Processing payments upon exit ($10 per hour)
- Monitoring garage occupancy and revenue

### 1.1 Architecture Overview

```
┌─────────────────┐     HTTP      ┌─────────────────┐     SQL      ┌─────────────────┐
│                 │   Requests    │                 │    Queries   │                 │
│  React Frontend │ ◄───────────► │ FastAPI Backend │ ◄───────────►│   PostgreSQL    │
│    (Browser)    │               │    (Python)     │              │    Database     │
│                 │               │                 │              │                 │
└─────────────────┘               └─────────────────┘              └─────────────────┘
```

The system follows a standard three-tier architecture:
1. **Presentation Layer**: React frontend with UI components
2. **Application Layer**: FastAPI backend implementing business logic and API endpoints
3. **Data Layer**: PostgreSQL database for persistent storage

## 2. Python Backend Implementation

### 2.1 Core Components

The Python backend consists of five main components:

1. **app.py**: Main application file with FastAPI routes and business logic
2. **models.py**: Database models using SQLAlchemy ORM
3. **schemas.py**: Pydantic models for request/response validation and documentation
4. **database.py**: Database connection setup and session management
5. **run.py**: Application entry point and server configuration

### 2.2 Component Relationships

```
┌───────────────────────────────────────────────────────────────────────────┐
│ run.py                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │ app.py                                                           │     │
│  │  ┌────────────────────────┐      ┌─────────────────────┐        │     │
│  │  │ API Endpoints/Routes   │ ──► │ Business Logic      │        │     │
│  │  └────────────────────────┘      └─────────────────────┘        │     │
│  │               │                            │                     │     │
│  └───────────────┼────────────────────────────┼─────────────────────┘     │
│                  ▼                            ▼                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │ schemas.py                                                       │     │
│  │  ┌────────────────────────┐      ┌─────────────────────┐        │     │
│  │  │ Pydantic Models        │ ◄──► │ Data Validation    │        │     │
│  │  └────────────────────────┘      └─────────────────────┘        │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                  │                            │                            │
│                  ▼                            ▼                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │ models.py                                                        │     │
│  │  ┌────────────────────────┐      ┌─────────────────────┐        │     │
│  │  │ SQLAlchemy Models      │ ◄──► │ Data Persistence   │        │     │
│  │  └────────────────────────┘      └─────────────────────┘        │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                               │                                            │
└───────────────────────────────┼────────────────────────────────────────────┘
                                ▼                                     
  ┌──────────────────────────────────────────────────────────────────┐     
  │ database.py                                                      │     
  │  ┌────────────────────────┐      ┌─────────────────────┐        │     
  │  │ DB Connection          │ ◄──► │ Session Management │        │     
  │  └────────────────────────┘      └─────────────────────┘        │     
  └──────────────────────────────────────────────────────────────────┘     
```

### 2.3 Detailed Component Descriptions

#### 2.3.1 app.py

This is the core application file containing the FastAPI application instance, API routes, and business logic.

**Key Functions:**

1. **initialize_garage_settings()** (Lines 44-53):
   - Creates default garage settings if none exist
   - Sets up 140 total spaces and $10/hour rate
   - Called on application initialization

2. **http_exception_handler()** (Lines 59-64):
   - Custom exception handler for HTTP errors
   - Returns standardized JSON error responses

3. **validation_exception_handler()** (Lines 66-71):
   - Custom handler for request validation errors
   - Returns detailed validation error messages

4. **status()** (Lines 80-82):
   - Simple health check endpoint
   - Returns standardized status response

5. **get_garage_stats()** (Lines 84-133):
   - Returns garage statistics including:
     - Total/occupied/available spaces
     - Occupancy percentages
     - Today's revenue
     - Vehicles processed today
     - Average stay time
   - Performs calculations based on ticket data
   - Returns typed response with GarageStatsResponse model

6. **create_ticket()** (Lines 135-157):
   - Creates a new parking ticket
   - Validates input with TicketCreate schema
   - Generates unique ticket number
   - Returns typed response with TicketResponse model

7. **get_ticket()** (Lines 159-172):
   - Retrieves ticket information by ticket number
   - Returns 404 HTTPException if ticket not found
   - Returns typed response with TicketResponse model

8. **process_exit()** (Lines 174-216):
   - Processes vehicle exit
   - Validates input with ExitRequest schema
   - Validates ticket exists and is active
   - Calculates duration and payment amount
   - Updates ticket with exit information
   - Returns typed response with TicketResponse model

9. **get_activities()** (Lines 218-241):
   - Returns recent parking activities
   - Optional limit parameter (default 10)
   - Returns typed response with list of ActivityResponse models

10. **serve_frontend()** (Lines 244-259):
    - Serves static frontend assets
    - Handles SPA routing by returning index.html for client routes
    - Uses FileResponse for efficient file serving

11. **db_session_middleware()** (Lines 262-269):
    - Middleware for cleaning up database sessions
    - Ensures proper resource management with session cleanup

**Routes:**

| Endpoint | Method | Description | Response Model |
|----------|--------|-------------|----------------|
| `/api/status` | GET | Health check endpoint | StatusResponse |
| `/api/garage/stats` | GET | Retrieves garage statistics | GarageStatsResponse |
| `/api/tickets` | POST | Creates a new parking ticket | TicketResponse |
| `/api/tickets/{ticket_number}` | GET | Gets ticket by number | TicketResponse |
| `/api/tickets/{ticket_number}/exit` | PUT | Processes vehicle exit | TicketResponse |
| `/api/activities` | GET | Lists recent parking activities | List[ActivityResponse] |
| `/{full_path:path}` | GET | Serves frontend static files | FileResponse |

#### 2.3.2 schemas.py

Defines Pydantic models used for request/response validation and API documentation.

**Models:**

1. **TicketCreate** (Lines 4-6):
   - Request model for creating tickets
   - Fields: licensePlate, vehicleType
   - Used for validating POST requests to /api/tickets

2. **TicketResponse** (Lines 8-18):
   - Response model for ticket operations
   - Fields: id, ticketNumber, licensePlate, vehicleType, entryTime, exitTime, durationMinutes, amountPaid, status, paymentMethod
   - Used for standardizing ticket-related API responses

3. **ExitRequest** (Lines 20-21):
   - Request model for exit processing
   - Fields: paymentMethod
   - Used for validating PUT requests to /api/tickets/{ticket_number}/exit

4. **ActivityResponse** (Lines 23-31):
   - Response model for activity list
   - Fields: id, ticketNumber, licensePlate, entryTime, exitTime, durationMinutes, amount, status
   - Used for standardizing activity-related API responses

5. **GarageStatsResponse** (Lines 33-41):
   - Response model for garage statistics
   - Fields: totalSpaces, occupiedSpaces, availableSpaces, occupiedSpacesPercentage, availableSpacesPercentage, hourlyRate, todaysRevenue, vehiclesProcessedToday, averageStayTime
   - Used for standardizing garage stats API response

6. **StatusResponse** (Lines 43-44):
   - Simple status response model
   - Field: status (default "ok")
   - Used for health check endpoint

7. **ErrorResponse** (Lines 46-47):
   - Error response model
   - Field: message
   - Used for standardizing error responses

#### 2.3.3 models.py

Defines SQLAlchemy database models representing the application's data structures.

**Models:**

1. **User** (Lines 6-17):
   - User accounts (currently not used in the main application flow)
   - Fields: id, username, password
   - Method: to_dict() for serialization

2. **Ticket** (Lines 19-45):
   - Core entity representing parking tickets
   - Fields:
     - id: Primary key
     - ticket_number: Unique ticket identifier (e.g., "PS-1234")
     - license_plate: Vehicle license plate
     - vehicle_type: Type of vehicle
     - entry_time: Timestamp when vehicle entered
     - exit_time: Timestamp when vehicle exited (nullable)
     - duration_minutes: Parking duration in minutes (nullable)
     - amount_paid: Payment amount in cents (nullable)
     - status: Ticket status ("active" or "completed")
     - payment_method: Method of payment (nullable)
   - Method: to_dict() for serialization

3. **GarageSetting** (Lines 47-59):
   - Stores garage configuration
   - Fields:
     - id: Primary key
     - total_spaces: Total number of parking spaces
     - hourly_rate: Rate in cents per hour
   - Method: to_dict() for serialization

#### 2.3.4 database.py

Handles database connection setup and session management.

**Key Components:**

1. **Database Connection** (Lines 10-17):
   - Loads DATABASE_URL from environment variables
   - Creates SQLAlchemy engine for PostgreSQL connection

2. **Session Management** (Lines 20-26):
   - Creates scoped session with sessionmaker
   - Sets up query property on Base

3. **init_db()** (Lines 28-32):
   - Initializes database schema
   - Creates tables based on imported models

4. **shutdown_session()** (Lines 34-36):
   - Removes session at the end of requests
   - Prevents resource leaks

#### 2.3.5 run.py

Application entry point and server configuration.

**Key Components:**

1. **Server Configuration** (Lines 4-7):
   - Sets host to 0.0.0.0 (accessible from any IP)
   - Sets port to 5001 (avoiding conflict with TypeScript server on 5000)
   - Enables reload mode for development
   - Uses uvicorn ASGI server for running the application

## 3. Database Schema

### 3.1 Schema Diagram

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    users       │     │    tickets     │     │ garage_settings│
├────────────────┤     ├────────────────┤     ├────────────────┤
│ id (PK)        │     │ id (PK)        │     │ id (PK)        │
│ username       │     │ ticket_number  │     │ total_spaces   │
│ password       │     │ license_plate  │     │ hourly_rate    │
│                │     │ vehicle_type   │     │                │
│                │     │ entry_time     │     │                │
│                │     │ exit_time      │     │                │
│                │     │ duration_minutes│    │                │
│                │     │ amount_paid    │     │                │
│                │     │ status         │     │                │
│                │     │ payment_method │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### 3.2 Schema Design Decisions

1. **Monetary Values**: Stored as integers in cents to avoid floating-point errors
2. **Status Field**: Uses string values ("active"/"completed") for readability and extensibility
3. **Ticket Number Format**: "PS-XXXX" format for user-friendly identification
4. **Time Storage**: Uses DateTime objects for precise time calculations
5. **Settings Table**: Single-row table with configuration values

## 4. API Design

### 4.1 API Endpoints

The API follows RESTful principles with these main endpoints:

#### GET /api/status
- **Purpose**: Health check endpoint
- **Response Model**: StatusResponse
- **Response**: `{ "status": "ok" }`
- **Usage**: Used by monitoring systems and tests to verify the API is operational

#### GET /api/garage/stats
- **Purpose**: Retrieve garage statistics
- **Response Model**: GarageStatsResponse
- **Response**: Complex JSON object with garage metrics
- **Usage**: Dashboard display on frontend

#### POST /api/tickets
- **Purpose**: Create a new ticket when vehicle enters
- **Request Model**: TicketCreate
- **Request Body**: `{ "licensePlate": "ABC123", "vehicleType": "Car" }`
- **Response Model**: TicketResponse
- **Response**: Complete ticket object
- **Usage**: Entry form submission

#### GET /api/tickets/{ticketNumber}
- **Purpose**: Retrieve ticket information
- **Parameters**: ticketNumber in URL path
- **Response Model**: TicketResponse
- **Response**: Complete ticket object
- **Usage**: Ticket lookup on exit

#### PUT /api/tickets/{ticketNumber}/exit
- **Purpose**: Process vehicle exit and payment
- **Parameters**: ticketNumber in URL path
- **Request Model**: ExitRequest
- **Request Body**: `{ "paymentMethod": "Credit Card" }`
- **Response Model**: TicketResponse
- **Response**: Updated ticket with payment information
- **Usage**: Exit form submission

#### GET /api/activities
- **Purpose**: List recent parking activities
- **Query Parameters**: limit (optional, default 10)
- **Response Model**: List[ActivityResponse]
- **Response**: Array of ticket/activity objects
- **Usage**: Activity list on dashboard

### 4.2 API Documentation

FastAPI automatically generates API documentation based on the endpoint declarations and schema models:

- **Swagger UI**: Available at `/docs` endpoint
- **ReDoc**: Available at `/redoc` endpoint
- **OpenAPI Schema**: Available at `/openapi.json` endpoint

These provide interactive documentation that allows:
- Exploring all available endpoints
- Seeing request/response models
- Testing API calls directly from the browser
- Understanding validation rules

### 4.3 Error Handling

The API implements consistent error handling with custom exception handlers:

1. HTTPException handling for standard error cases:
   - 400: Bad Request (client error)
   - 404: Not Found
   - 500: Internal Server Error

2. RequestValidationError handling for request validation failures:
   - Detailed information about validation failures
   - Clear messages about what fields failed validation and why

3. Error responses include a standardized format:
   ```json
   { "message": "Detailed error description" }
   ```

4. Detailed error logging to the console for debugging

## 5. Frontend Integration

While focusing on the backend, it's important to understand how the frontend interacts with it:

### 5.1 React Components

The frontend is organized around several key components:

1. **Dashboard.tsx**: Main interface showing statistics and recent activities
2. **EntryForm.tsx**: Form for creating new tickets when vehicles enter
3. **ExitForm.tsx**: Form for processing exits and payments
4. **ActivityTable.tsx**: Displays recent parking activities
5. **StatusCard.tsx**: Shows individual statistics like occupancy, revenue, etc.

### 5.2 API Integration

The frontend uses React Query for data fetching:

1. **useGarage.ts** hook: Centralizes API calls to the backend
2. Queries automatically refresh to keep dashboard data current
3. Forms use mutations to create/update tickets

### 5.3 Data Flow

```
┌─────────────────────────────────────┐
│ React Components                    │
│  ┌─────────────┐   ┌─────────────┐  │
│  │ EntryForm   │   │ ExitForm    │  │
│  └─────────────┘   └─────────────┘  │
│          │               │          │
│          ▼               ▼          │
│  ┌───────────────────────────────┐  │
│  │ useGarage Hook (React Query)  │  │
│  └───────────────────────────────┘  │
│                  │                  │
└──────────────────┼──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│ Python FastAPI Backend              │
│  ┌─────────────┐   ┌─────────────┐  │
│  │ API Routes  │──►│ Controllers │  │
│  └─────────────┘   └─────────────┘  │
│          │               │          │
│          ▼               ▼          │
│  ┌─────────────┐   ┌─────────────┐  │
│  │ Pydantic    │   │ SQLAlchemy  │  │
│  │ Schemas     │   │ Models      │  │
│  └─────────────┘   └─────────────┘  │
│                  │                  │
└──────────────────┼──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│ PostgreSQL Database                 │
└─────────────────────────────────────┘
```

## 6. Development Environment

### 6.1 Local Development Setup

The development environment runs on a single machine with:

1. **Python FastAPI Backend**:
   - Port: 5001
   - Entry point: `python python_server/run.py`
   - ASGI Server: Uvicorn
   - Environment variables:
     - DATABASE_URL: PostgreSQL connection string
     - PORT: Server port (default 5001)

2. **React Frontend**:
   - Built with Vite
   - Proxies API requests to the backend
   - Hot module replacement for rapid development

3. **PostgreSQL Database**:
   - Persistent storage for all application data
   - Accessed via connection string in DATABASE_URL

### 6.2 Testing

Tests are implemented in `test.py` and validate all API endpoints:

1. **test_api_connection()**: Verifies the API is accessible
2. **test_garage_stats()**: Tests statistics endpoint
3. **test_create_ticket()**: Tests ticket creation
4. **test_get_ticket()**: Tests ticket retrieval
5. **test_process_exit()**: Tests exit processing and payment
6. **test_get_activities()**: Tests activity listing
7. **test_api_docs()**: Tests FastAPI documentation endpoints (FastAPI-specific)

Tests can be run against either backend by setting the `API_PORT` environment variable, with enhanced testing for FastAPI-specific features.

## 7. Production Deployment

### 7.1 Deployment Options

#### Option 1: Single-Server Deployment (Recommended for Small Scale)

This option involves deploying the entire application on a single server:

```
┌─────────────────────────────────────────────────────────┐
│ EC2 Instance or VM                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Nginx       │──│ Uvicorn     │──│ FastAPI App │     │
│  │ Web Server  │  │ ASGI Server │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                        │                │
│                                        ▼                │
│                         ┌─────────────────────────┐    │
│                         │ PostgreSQL Database     │    │
│                         └─────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Steps:**
1. Provision an AWS EC2 instance (t3.small or larger)
2. Install Nginx as a reverse proxy
3. Set up Uvicorn as an ASGI server
4. Configure PostgreSQL database
5. Set up systemd service for application management
6. Install SSL certificate (via Let's Encrypt)

**Advantages:**
- Simpler setup
- Lower cost
- Easier maintenance
- Suitable for low to moderate traffic

#### Option 2: Containerized Deployment

This option uses Docker and potentially Kubernetes for a more scalable deployment:

```
┌────────────────────────────────────────────────────────────────┐
│ Kubernetes Cluster                                             │
│  ┌─────────────┐   ┌─────────────────────────────────────┐    │
│  │ Ingress     │──►│ FastAPI App Pods (Multiple Replicas)│    │
│  │ Controller  │   └─────────────────────────────────────┘    │
│  └─────────────┘                     │                         │
│                                      ▼                         │
│                       ┌─────────────────────────────────┐     │
│                       │ PostgreSQL StatefulSet          │     │
│                       └─────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

**Steps:**
1. Containerize the application with Docker
2. Set up Kubernetes cluster (EKS on AWS or equivalent)
3. Deploy application using Kubernetes manifests
4. Configure ingress for external access
5. Set up PostgreSQL with persistent storage
6. Configure monitoring and scaling policies

**Advantages:**
- Highly scalable
- Better reliability and fault tolerance
- Easier horizontal scaling
- Better suited for high traffic or enterprise deployments

### 7.2 Production Configuration Checklist

1. **Security:**
   - Configure proper CORS settings
   - Set secure HTTP headers
   - Implement rate limiting
   - Use HTTPS only
   - Secure database credentials
   - Implement proper authentication (not currently in the code)

2. **Performance:**
   - Configure Uvicorn workers appropriately
   - Set worker processes based on CPU cores
   - Optimize database queries with indexes
   - Implement caching for statistics

3. **Monitoring:**
   - Set up application logging
   - Implement health checks
   - Configure performance monitoring
   - Set up alerts for errors or high resource usage

4. **Database:**
   - Regular backups
   - Consider read replicas for scaling
   - Implement connection pooling
   - Monitor query performance

5. **DevOps:**
   - Implement CI/CD pipeline
   - Automate deployment process
   - Set up blue/green deployment strategy

## 8. Design Decisions and Rationale

### 8.1 FastAPI vs. Flask

**Decision:** Use FastAPI instead of Flask

**Rationale:**
- Native async/await support for better performance
- Automatic API documentation with OpenAPI
- Built-in request validation with Pydantic
- Type hints for better code quality and tooling
- More modern framework with higher performance
- Simpler dependency injection system

### 8.2 Pydantic for Schema Validation

**Decision:** Use Pydantic models for request/response validation

**Rationale:**
- Integrates seamlessly with FastAPI
- Provides automatic request validation
- Generates comprehensive API documentation
- Type hints improve development experience
- Clear separation between API contract and data model

### 8.3 SQLAlchemy ORM vs. Raw SQL

**Decision:** Use SQLAlchemy ORM for database interactions

**Rationale:**
- Better code organization and maintainability
- SQL injection protection
- Database schema version independence
- Object-oriented approach matches application structure

### 8.4 Monetary Storage as Integers

**Decision:** Store monetary values as integers (cents) rather than floats

**Rationale:**
- Avoids floating-point precision errors
- Standard practice for financial applications
- Consistent with frontend expectations
- Front-end handles formatting for display

### 8.5 Uvicorn as ASGI Server

**Decision:** Use Uvicorn instead of traditional WSGI servers

**Rationale:**
- Better performance for async applications
- Native support for FastAPI
- Designed for modern Python async frameworks
- Supports HTTP/2 and WebSockets

### 8.6 Dual Backend Implementation

**Decision:** Maintain both TypeScript and Python implementations simultaneously during migration

**Rationale:**
- Reduces risk during migration
- Enables direct feature and performance comparison
- Provides fallback if issues arise
- Allows gradual transition without service disruption

## 9. Deployment and Portability

The system supports multiple deployment options for different environments.

### 9.1 Deployment Options

1. **Replit Environment**
   - Utilizes `.replit` configuration
   - Workflows defined in Replit interface
   - Automatic environment setup

2. **Local Development with Make**
   - Makefile included for common operations
   - Cross-platform support with conditional commands
   - Unified command interface
   - See `make help` for available commands

3. **Containerized with Docker**
   - Complete docker-compose setup
   - Separate containers for PostgreSQL, Node.js, and Python services
   - Volume persistence for database
   - Environment variable configuration

### 9.2 Docker Configuration

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Node Container │ ◄───┤  Python Container│ ◄───┤   PostgreSQL   │
│    (Port 5000)  │     │    (Port 5001)  │     │  (Port 5432)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Network                             │
└─────────────────────────────────────────────────────────────────┘
```

The Docker setup includes:
- **Dockerfile.node**: Node.js backend container
- **Dockerfile.python**: Python/FastAPI backend container  
- **docker-compose.yml**: Service orchestration and networking
- **.dockerignore**: Optimized Docker builds

For complete setup instructions, see the [PORTABILITY.md](PORTABILITY.md) document.

## 10. Future Enhancements

1. **Authentication and Authorization:**
   - Implement OAuth2 authentication using FastAPI's built-in security utilities
   - Role-based access control
   - Audit logging for all operations

2. **Advanced Features:**
   - Reserved parking spaces
   - Variable pricing based on time of day
   - Season passes or regular customer discounts
   - Vehicle type-based pricing
   - Integration with license plate recognition systems

3. **Reporting:**
   - Enhanced analytics dashboard
   - Financial reporting
   - Usage patterns visualization
   - Exportable reports (CSV, PDF)

4. **Technical Improvements:**
   - Implement FastAPI dependency injection for better code organization
   - Add background tasks for non-critical operations
   - Implement caching using FastAPI middleware
   - Add comprehensive unit tests with pytest
   - Use Alembic for database migrations

## 11. Conclusion

The Parking Garage Management System is a full-stack web application with a Python FastAPI backend and React frontend. The system provides a complete solution for managing parking operations, including ticket issuance, payment processing, and statistical monitoring.

The FastAPI backend implementation follows modern best practices for web API development with automatic documentation, strong typing, data validation, and asynchronous request handling. The system is designed to be deployable in various environments from simple single-server setups to containerized cloud deployments, with excellent performance characteristics and a robust architecture.

This design document provides a comprehensive overview of the system architecture, components, and implementation details to facilitate understanding, maintenance, and future development of the application.