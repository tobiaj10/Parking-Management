from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TicketCreate(BaseModel):
    licensePlate: str
    vehicleType: str

class TicketResponse(BaseModel):
    id: int
    ticketNumber: str
    licensePlate: str
    vehicleType: str
    entryTime: datetime
    exitTime: Optional[datetime] = None
    durationMinutes: Optional[int] = None
    amountPaid: Optional[int] = None
    status: str
    paymentMethod: Optional[str] = None

class ExitRequest(BaseModel):
    paymentMethod: str

class ActivityResponse(BaseModel):
    id: int
    ticketNumber: str
    licensePlate: str
    entryTime: datetime
    exitTime: Optional[datetime] = None
    durationMinutes: Optional[int] = None
    amount: Optional[float] = None
    status: str

class GarageStatsResponse(BaseModel):
    totalSpaces: int
    occupiedSpaces: int
    availableSpaces: int
    occupiedSpacesPercentage: int
    availableSpacesPercentage: int
    hourlyRate: float
    todaysRevenue: float
    vehiclesProcessedToday: int
    averageStayTime: float

class StatusResponse(BaseModel):
    status: str = "ok"

class ErrorResponse(BaseModel):
    message: str