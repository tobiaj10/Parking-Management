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
│  React Frontend │ ◄───────────► │  Flask Backend  │ ◄───────────►│   PostgreSQL    │
│    (Browser)    │               │    (Python)     │              │    Database     │
│                 │               │                 │              │                 │
└─────────────────┘               └─────────────────┘              └─────────────────┘
```

The system follows a standard three-tier architecture:
1. **Presentation Layer**: React frontend with UI components
2. **Application Layer**: Flask backend implementing business logic and API endpoints
3. **Data Layer**: PostgreSQL database for persistent storage

## 2. Python Backend Implementation

### 2.1 Core Components

The Python backend consists of four main components:

1. **app.py**: Main application file with Flask routes and business logic
2. **models.py**: Database models using SQLAlchemy ORM
3. **database.py**: Database connection setup and session management
4. **run.py**: Application entry point and server configuration

### 2.2 Component Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│ run.py                                                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ app.py                                                       │   │
│  │  ┌────────────────────────┐      ┌─────────────────────┐    │   │
│  │  │ API Endpoints/Routes   │ ──► │ Business Logic      │    │   │
│  │  └────────────────────────┘      └─────────────────────┘    │   │
│  │               │                            │                 │   │
│  └───────────────┼────────────────────────────┼─────────────────┘   │
│                  ▼                            ▼                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ models.py                                                    │   │
│  │  ┌────────────────────────┐      ┌─────────────────────┐    │   │
│  │  │ SQLAlchemy Models      │ ◄──► │ Data Serialization │    │   │
│  │  └────────────────────────┘      └─────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               ▼                                     
  ┌──────────────────────────────────────────────────────────────┐     
  │ database.py                                                  │     
  │  ┌────────────────────────┐      ┌─────────────────────┐    │     
  │  │ DB Connection          │ ◄──► │ Session Management │    │     
  │  └────────────────────────┘      └─────────────────────┘    │     
  └──────────────────────────────────────────────────────────────┘     
```

### 2.3 Detailed Component Descriptions

#### 2.3.1 app.py

This is the core application file containing the Flask application instance, API routes, and business logic.

**Key Functions:**

1. **initialize_garage_settings()** (Lines 22-30):
   - Creates default garage settings if none exist
   - Sets up 140 total spaces and $10/hour rate
   - Called on application initialization

2. **serve()** (Lines 37-41):
   - Serves static frontend assets
   - Falls back to index.html for SPA routing

3. **status()** (Lines 44-46):
   - Simple health check endpoint

4. **get_garage_stats()** (Lines 49-96):
   - Returns garage statistics including:
     - Total/occupied/available spaces
     - Occupancy percentages
     - Today's revenue
     - Vehicles processed today
     - Average stay time
   - Performs calculations based on ticket data

5. **create_ticket()** (Lines 99-126):
   - Creates a new parking ticket
   - Generates unique ticket number
   - Validates input data
   - Stores entry time and vehicle information

6. **get_ticket()** (Lines 129-140):
   - Retrieves ticket information by ticket number
   - Returns 404 if ticket not found

7. **process_exit()** (Lines 143-189):
   - Processes vehicle exit
   - Validates ticket exists and is active
   - Calculates duration and payment amount
   - Updates ticket with exit information
   - Returns completed ticket data

8. **get_activities()** (Lines 192-216):
   - Returns recent parking activities
   - Optional limit parameter (default 10)
   - Formats data for frontend consumption

**Routes:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves frontend static files |
| `/api/status` | GET | Health check endpoint |
| `/api/garage/stats` | GET | Retrieves garage statistics |
| `/api/tickets` | POST | Creates a new parking ticket |
| `/api/tickets/<ticket_number>` | GET | Gets ticket by number |
| `/api/tickets/<ticket_number>/exit` | PUT | Processes vehicle exit |
| `/api/activities` | GET | Lists recent parking activities |

#### 2.3.2 models.py

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

#### 2.3.3 database.py

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

#### 2.3.4 run.py

Application entry point and server configuration.

**Key Components:**

1. **Server Configuration** (Lines 4-7):
   - Sets host to 0.0.0.0 (accessible from any IP)
   - Sets port to 5001 (avoiding conflict with TypeScript server on 5000)
   - Enables debug mode for development

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
- **Response**: `{ "status": "ok" }`
- **Usage**: Used by monitoring systems and tests to verify the API is operational

#### GET /api/garage/stats
- **Purpose**: Retrieve garage statistics
- **Response**: Complex JSON object with garage metrics
- **Usage**: Dashboard display on frontend

#### POST /api/tickets
- **Purpose**: Create a new ticket when vehicle enters
- **Request Body**: `{ "licensePlate": "ABC123", "vehicleType": "Car" }`
- **Response**: Complete ticket object
- **Usage**: Entry form submission

#### GET /api/tickets/{ticketNumber}
- **Purpose**: Retrieve ticket information
- **Parameters**: ticketNumber in URL path
- **Response**: Complete ticket object
- **Usage**: Ticket lookup on exit

#### PUT /api/tickets/{ticketNumber}/exit
- **Purpose**: Process vehicle exit and payment
- **Parameters**: ticketNumber in URL path
- **Request Body**: `{ "paymentMethod": "Credit Card" }`
- **Response**: Updated ticket with payment information
- **Usage**: Exit form submission

#### GET /api/activities
- **Purpose**: List recent parking activities
- **Query Parameters**: limit (optional, default 10)
- **Response**: Array of ticket/activity objects
- **Usage**: Activity list on dashboard

### 4.2 Error Handling

The API implements consistent error handling:

1. Each endpoint is wrapped in try/except blocks
2. Errors return appropriate HTTP status codes:
   - 400: Bad Request (client error)
   - 404: Not Found
   - 500: Internal Server Error
3. Error responses include a message field explaining the issue
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
│ Python Flask Backend                │
│  ┌─────────────┐   ┌─────────────┐  │
│  │ API Routes  │──►│ Controllers │  │
│  └─────────────┘   └─────────────┘  │
│                      │              │
│                      ▼              │
│  ┌───────────────────────────────┐  │
│  │ SQLAlchemy Models             │  │
│  └───────────────────────────────┘  │
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

1. **Python Flask Backend**:
   - Port: 5001
   - Entry point: `python python_server/run.py`
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

Tests can be run against either backend by setting the `API_PORT` environment variable.

## 7. Production Deployment

### 7.1 Deployment Options

#### Option 1: Single-Server Deployment (Recommended for Small Scale)

This option involves deploying the entire application on a single server:

```
┌─────────────────────────────────────────────────────────┐
│ EC2 Instance or VM                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Nginx       │──│ Gunicorn    │──│ Flask App   │     │
│  │ Web Server  │  │ WSGI Server │  │             │     │
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
3. Set up Gunicorn as a WSGI server
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
│  │ Ingress     │──►│ Flask App Pods (Multiple Replicas)  │    │
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
   - Disable Flask debug mode
   - Set secure HTTP headers
   - Implement rate limiting
   - Use HTTPS only
   - Secure database credentials
   - Implement proper authentication (not currently in the code)

2. **Performance:**
   - Configure proper WSGI server (Gunicorn)
   - Set appropriate worker processes
   - Optimize database queries
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

### 8.1 Python Flask vs. Fast API

**Decision:** Use Flask instead of FastAPI

**Rationale:**
- Flask is more established with broader community support
- Simpler to implement for this use case
- Lower learning curve for maintenance developers
- SQLAlchemy integration is more mature

### 8.2 SQLAlchemy ORM vs. Raw SQL

**Decision:** Use SQLAlchemy ORM for database interactions

**Rationale:**
- Better code organization and maintainability
- SQL injection protection
- Database schema version independence
- Object-oriented approach matches application structure

### 8.3 Monetary Storage as Integers

**Decision:** Store monetary values as integers (cents) rather than floats

**Rationale:**
- Avoids floating-point precision errors
- Standard practice for financial applications
- Consistent with frontend expectations
- Front-end handles formatting for display

### 8.4 API First Design

**Decision:** Implement API endpoints before integrating frontend

**Rationale:**
- Enables independent testing of backend
- Facilitates parallel development with frontend team
- Allows for API client flexibility
- Makes testing simpler

### 8.5 Dual Backend Implementation

**Decision:** Maintain both TypeScript and Python implementations simultaneously during migration

**Rationale:**
- Reduces risk during migration
- Enables direct feature and performance comparison
- Provides fallback if issues arise
- Allows gradual transition without service disruption

## 9. Future Enhancements

1. **Authentication and Authorization:**
   - Implement user login for staff
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
   - Implement caching for better performance
   - Add comprehensive unit tests
   - Create API documentation with Swagger/OpenAPI
   - Implement database migrations tool

## 10. Conclusion

The Parking Garage Management System is a full-stack web application with a Python Flask backend and React frontend. The system provides a complete solution for managing parking operations, including ticket issuance, payment processing, and statistical monitoring.

The Python backend implementation follows best practices for web application development with clear separation of concerns, maintainable code structure, and robust error handling. The system is designed to be deployable in various environments from simple single-server setups to containerized cloud deployments.

This design document provides a comprehensive overview of the system architecture, components, and implementation details to facilitate understanding, maintenance, and future development of the application.