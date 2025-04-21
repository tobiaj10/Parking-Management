from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

class Ticket(Base):
    __tablename__ = 'tickets'
    
    id = Column(Integer, primary_key=True)
    ticket_number = Column(String, unique=True, nullable=False)
    license_plate = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=False)
    entry_time = Column(DateTime, nullable=False, default=datetime.now)
    exit_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    amount_paid = Column(Integer, nullable=True)  # stored in cents
    status = Column(String, nullable=False)  # 'active' or 'completed'
    payment_method = Column(String, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticketNumber': self.ticket_number,
            'licensePlate': self.license_plate,
            'vehicleType': self.vehicle_type,
            'entryTime': self.entry_time.isoformat() if self.entry_time else None,
            'exitTime': self.exit_time.isoformat() if self.exit_time else None,
            'durationMinutes': self.duration_minutes,
            'amountPaid': self.amount_paid,
            'status': self.status,
            'paymentMethod': self.payment_method
        }

class GarageSetting(Base):
    __tablename__ = 'garage_settings'
    
    id = Column(Integer, primary_key=True)
    total_spaces = Column(Integer, nullable=False)
    hourly_rate = Column(Integer, nullable=False)  # stored in cents
    
    def to_dict(self):
        return {
            'id': self.id,
            'totalSpaces': self.total_spaces,
            'hourlyRate': self.hourly_rate
        }