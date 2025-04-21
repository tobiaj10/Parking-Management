# Portability Guide

This document outlines how to run the Parking Garage Management System across different environments and platforms.

## Table of Contents
1. [Development Options](#development-options)
2. [Using Make Commands](#using-make-commands)
3. [Using Docker](#using-docker)
4. [Environment Variables](#environment-variables)
5. [Additional Configuration](#additional-configuration)

## Development Options

The Parking Garage Management System can be run in three different ways:

1. **Replit Environment** - Using the built-in `.replit` configuration
2. **Make Commands** - Using the included `Makefile` for local development
3. **Docker Containers** - Using Docker and docker-compose for containerized setup

## Using Make Commands

The project includes a `Makefile` with common commands for development:

```bash
# Install all dependencies
make install

# Start TypeScript/Node.js backend
make dev-ts

# Start Python/FastAPI backend
make dev-py

# Start both backends
make dev

# Run Python tests
make test-py

# Clean temporary files
make clean
```

For Windows users without Make, consider using WSL (Windows Subsystem for Linux) or installing Make for Windows.

## Using Docker

### Prerequisites
- Docker and Docker Compose installed on your system

### Starting the entire stack

```bash
# Build and start all services
docker-compose up

# Build and start in detached mode
docker-compose up -d

# Rebuild images and start containers
docker-compose up --build
```

### Starting individual services

```bash
# Start only the database
docker-compose up postgres

# Start only the Node.js backend
docker-compose up node-backend

# Start only the Python backend
docker-compose up python-backend
```

### Accessing services

- TypeScript/Node.js backend: http://localhost:5000
- Python/FastAPI backend: http://localhost:5001
- FastAPI Swagger Documentation: http://localhost:5001/docs
- PostgreSQL Database: localhost:5432

### Stopping services

```bash
# Stop all running containers
docker-compose down

# Stop and remove volumes (will delete database data)
docker-compose down -v
```

## Environment Variables

The following environment variables are used by the application:

| Variable      | Description                           | Default Value                                          |
|---------------|---------------------------------------|--------------------------------------------------------|
| DATABASE_URL  | PostgreSQL connection string          | postgres://parking_user:parking_password@postgres:5432/parking_garage |
| PORT          | Port for the backends to listen on    | 5000 (Node.js), 5001 (Python)                           |
| NODE_ENV      | Node.js environment                   | development                                            |

You can set these variables in a `.env` file in the project root or directly in your environment.

## Additional Configuration

### PostgreSQL Database

The Docker setup includes a PostgreSQL database with the following configuration:

- **Username**: parking_user
- **Password**: parking_password
- **Database Name**: parking_garage
- **Port**: 5432

For local development without Docker, you'll need to:
1. Install PostgreSQL locally
2. Create a database and user with appropriate permissions
3. Update the DATABASE_URL environment variable

### Running in Production

For production deployments:

1. Use the Docker setup with proper environment variables
2. Consider adding a reverse proxy like Nginx for SSL termination
3. Implement proper logging and monitoring
4. Set NODE_ENV=production for Node.js backend
5. Use a production-ready WSGI server for Python (e.g., Gunicorn with Uvicorn workers)