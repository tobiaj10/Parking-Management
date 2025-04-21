from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from datetime import datetime
import math
from database import init_db, db_session, shutdown_session
from models import Ticket, GarageSetting
from sqlalchemy import func, desc
import random
from typing import Optional, List
from schemas import (
    TicketCreate, 
    TicketResponse, 
    ExitRequest, 
    ActivityResponse, 
    GarageStatsResponse,
    StatusResponse,
    ErrorResponse
)
import uvicorn
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from starlette import status

# Load environment variables
load_dotenv()

app = FastAPI(title="Parking Garage System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Create default garage settings if none exist
def initialize_garage_settings():
    settings = db_session.query(GarageSetting).first()
    if not settings:
        new_settings = GarageSetting(
            total_spaces=140,
            hourly_rate=1000  # $10.00 in cents
        )
        db_session.add(new_settings)
        db_session.commit()

# Run initialization
initialize_garage_settings()

# Custom exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": "Validation error", "errors": str(exc)},
    )

# Mount static files
try:
    app.mount("/assets", StaticFiles(directory="../client/dist/assets"), name="assets")
except:
    pass

# API endpoints
@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    return {"status": "ok"}

@app.get("/api/garage/stats", response_model=GarageStatsResponse)
async def get_garage_stats():
    try:
        # Get garage settings
        settings = db_session.query(GarageSetting).first()
        if not settings:
            raise HTTPException(status_code=404, detail="Garage settings not found")
        
        # Count active tickets for occupied spaces
        occupied_spaces = db_session.query(Ticket).filter_by(status='active').count()
        available_spaces = settings.total_spaces - occupied_spaces
        
        # Calculate occupancy percentages
        occupied_percentage = math.floor((occupied_spaces / settings.total_spaces) * 100)
        available_percentage = 100 - occupied_percentage
        
        # Calculate today's revenue
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_revenue = db_session.query(func.sum(Ticket.amount_paid)).filter(
            Ticket.status == 'completed',
            Ticket.exit_time >= today
        ).scalar() or 0
        
        # Count vehicles processed today
        vehicles_processed = db_session.query(Ticket).filter(
            Ticket.status == 'completed',
            Ticket.exit_time >= today
        ).count()
        
        # Calculate average stay time
        avg_stay = db_session.query(func.avg(Ticket.duration_minutes)).filter(
            Ticket.status == 'completed'
        ).scalar() or 0
        
        return {
            'totalSpaces': settings.total_spaces,
            'occupiedSpaces': occupied_spaces,
            'availableSpaces': available_spaces,
            'occupiedSpacesPercentage': occupied_percentage,
            'availableSpacesPercentage': available_percentage,
            'hourlyRate': settings.hourly_rate / 100,  # Convert to dollars
            'todaysRevenue': today_revenue / 100,  # Convert to dollars
            'vehiclesProcessedToday': vehicles_processed,
            'averageStayTime': round(avg_stay / 60, 1) if avg_stay else 0  # Convert to hours and round to 1 decimal place
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting garage stats: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving garage statistics")

@app.post("/api/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate):
    try:
        # Generate ticket number
        ticket_number = f"PS-{1000 + random.randint(0, 8999)}"
        
        # Create new ticket
        new_ticket = Ticket(
            ticket_number=ticket_number,
            license_plate=ticket_data.licensePlate,
            vehicle_type=ticket_data.vehicleType,
            entry_time=datetime.now(),
            status='active'
        )
        
        db_session.add(new_ticket)
        db_session.commit()
        
        return new_ticket.to_dict()
    except Exception as e:
        db_session.rollback()
        print(f"Error creating ticket: {e}")
        raise HTTPException(status_code=500, detail="Error creating parking ticket")

@app.get("/api/tickets/{ticket_number}", response_model=TicketResponse)
async def get_ticket(ticket_number: str):
    try:
        ticket = db_session.query(Ticket).filter_by(ticket_number=ticket_number).first()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return ticket.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving ticket: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving ticket information")

@app.put("/api/tickets/{ticket_number}/exit", response_model=TicketResponse)
async def process_exit(ticket_number: str, exit_data: ExitRequest):
    try:
        ticket = db_session.query(Ticket).filter_by(ticket_number=ticket_number).first()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        if ticket.status != 'active':
            raise HTTPException(status_code=400, detail="Ticket has already been processed")
        
        # Calculate duration and amount
        exit_time = datetime.now()
        entry_time = ticket.entry_time
        
        # Calculate duration in minutes
        duration_minutes = math.ceil((exit_time - entry_time).total_seconds() / 60)
        
        # Get hourly rate from settings
        settings = db_session.query(GarageSetting).first()
        if not settings:
            raise HTTPException(status_code=500, detail="Garage settings not found")
        
        # Calculate payment amount (rounded up to the next hour)
        hours = math.ceil(duration_minutes / 60)
        amount_paid = hours * settings.hourly_rate
        
        # Update ticket
        ticket.exit_time = exit_time
        ticket.duration_minutes = duration_minutes
        ticket.amount_paid = amount_paid
        ticket.payment_method = exit_data.paymentMethod
        ticket.status = 'completed'
        
        db_session.commit()
        
        return ticket.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        print(f"Error processing exit: {e}")
        raise HTTPException(status_code=500, detail="Error processing exit")

@app.get("/api/activities", response_model=List[ActivityResponse])
async def get_activities(limit: int = 10):
    try:
        tickets = db_session.query(Ticket).order_by(desc(Ticket.entry_time)).limit(limit).all()
        
        # Format activities for the response
        activities = [
            {
                'id': ticket.id,
                'ticketNumber': ticket.ticket_number,
                'licensePlate': ticket.license_plate,
                'entryTime': ticket.entry_time,
                'exitTime': ticket.exit_time,
                'durationMinutes': ticket.duration_minutes,
                'amount': ticket.amount_paid / 100 if ticket.amount_paid else None,  # Convert to dollars
                'status': ticket.status
            }
            for ticket in tickets
        ]
        
        return activities
    except Exception as e:
        print(f"Error retrieving activities: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving recent activities")

# Serve frontend static assets (catch-all route for SPA)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # First check if the file exists in the static directory
    static_dir = "../client/dist"
    requested_path = os.path.join(static_dir, full_path)
    
    # If the file exists, serve it
    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)
    
    # Otherwise, serve the index.html for client-side routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # If index.html doesn't exist either, return a 404
    raise HTTPException(status_code=404, detail="File not found")

# Clean up database session
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
    finally:
        shutdown_session()
    return response

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5001))  # Using 5001 to avoid conflict with existing server
    uvicorn.run("app:app", host=host, port=port, reload=True)